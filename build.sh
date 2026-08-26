#!/bin/sh
set -eu

cd "$(dirname "$0")"

if ! command -v mvi >/dev/null 2>&1; then
    echo "build: mvi is required (https://github.com/oxUnd/mvi)" >&2
    exit 1
fi

build_tmp=$(mktemp -d "${TMPDIR:-/tmp}/posts-build.XXXXXX")
trap 'rm -rf "$build_tmp"' EXIT HUP INT TERM

rm -rf public
mkdir -p public

# Use a stable image while developing and a fresh seed for every release.
# The downloaded file becomes part of public/, so the deployed site never
# depends on the image service at page-view time.
feature_seed=${SITE_FEATURE_SEED:-preview}
if [ "$feature_seed" = random ]; then
    feature_seed="release-$(date -u '+%Y%m%d%H%M%S')-$$"
fi
feature_dir=public/assets/home
feature_tmp="$build_tmp/home-feature.webp"
mkdir -p "$feature_dir"
if command -v curl >/dev/null 2>&1 && \
    curl --fail --location --silent --show-error --retry 3 \
        "https://picsum.photos/seed/$feature_seed/900/1200.webp?grayscale" \
        --output "$feature_tmp"; then
    mv "$feature_tmp" "$feature_dir/feature.webp"
    MVI_HOME_FEATURE=assets/home/feature.webp
    export MVI_HOME_FEATURE
else
    echo "build: warning: homepage feature image unavailable; continuing without it" >&2
fi

export_org() {
    source_file=$1
    output_file=$2
    page=$(basename "$output_file" .html)
    mkdir -p "$(dirname "$output_file")"
    if ! MVI_ORG_OUTPUT=$output_file MVI_ASSET_BASE="assets/$page/" \
        mvi --lua ./mvi-export.lua "$source_file" \
        </dev/null >"$build_tmp/mvi.log" 2>&1; then
        cat "$build_tmp/mvi.log" >&2
        return 1
    fi

    source_dir=$(dirname "$source_file")
    if [ -d "$source_dir/images" ]; then
        asset_dir="public/assets/$page"
        mkdir -p "$asset_dir"
        cp -R "$source_dir/images/." "$asset_dir/"
    fi
}

# Every published Org file has a unique basename, because mvi publishes a flat
# collection. Fail early if a future post would overwrite an existing page.
find . -type f -name '*.org' ! -path './public/*' -exec basename {} .org \; \
    | sort >"$build_tmp/basenames"
duplicates=$(uniq -d "$build_tmp/basenames")
if [ -n "$duplicates" ]; then
    echo "build: duplicate Org basenames:" >&2
    echo "$duplicates" >&2
    exit 1
fi

# The homepage is still Org source. Add the post list at build time, then let
# mvi's own Org renderer produce the final standalone HTML document.
cp index.org "$build_tmp/index.org"
{
    printf '\n* Posts\n\n'
    find posts -type f -name '*.org' | sort -r | while IFS= read -r post; do
        page=$(basename "$post" .org)
        title=$(awk '
            BEGIN { IGNORECASE = 1 }
            /^#[+]TITLE:[[:space:]]*/ {
                sub(/^#[+]TITLE:[[:space:]]*/, "")
                gsub(/^"|"$/, "")
                print
                exit
            }
        ' "$post")
        printf -- '- [[file:%s.html][%s]]\n' "$page" "${title:-$page}"
    done
} >>"$build_tmp/index.org"
export_org "$build_tmp/index.org" public/index.html

find . -type f -name '*.org' \
    ! -path './public/*' \
    ! -path './index.org' \
    ! -path './README.org' \
    | sort | while IFS= read -r source_file; do
        page=$(basename "$source_file" .org)
        export_org "$source_file" "public/$page.html"
    done

cp CNAME LICENSE public/

cat >"$build_tmp/404.org" <<'EOF'
#+TITLE: Page moved
#+OPTIONS: toc:nil
#+HTML_HEAD: <meta http-equiv="refresh" content="0; url=/">

This page has moved. [[file:/][Go to the homepage]].
EOF
export_org "$build_tmp/404.org" public/404.html

mvi_version=$(mvi --version | awk '/^mvi [0-9]/{ print $1, $2; exit }')
echo "Built $(find public -type f | wc -l | tr -d ' ') files with $mvi_version"
