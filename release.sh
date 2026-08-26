#!/bin/sh
set -eu

cd "$(dirname "$0")"

if [ ! -s public/index.html ]; then
    echo "release: public/index.html is missing; run make first" >&2
    exit 1
fi

publish_branch=${RELEASE_BRANCH:-gh-pages}
publish_remote=${RELEASE_REMOTE:-}
if [ -z "$publish_remote" ]; then
    publish_remote=$(git remote get-url origin)
fi

release_tmp=$(mktemp -d "${TMPDIR:-/tmp}/posts-release.XXXXXX")
trap 'rm -rf "$release_tmp"' EXIT HUP INT TERM
stage="$release_tmp/site"

git -C "$release_tmp" init -q site
git -C "$stage" remote add publish "$publish_remote"

set +e
git ls-remote --exit-code --heads "$publish_remote" \
    "refs/heads/$publish_branch" >/dev/null 2>"$release_tmp/remote.err"
remote_status=$?
set -e

case "$remote_status" in
    0)
        git -C "$stage" fetch -q --depth=1 publish "refs/heads/$publish_branch"
        git -C "$stage" checkout -q -b "$publish_branch" FETCH_HEAD
        ;;
    2)
        git -C "$stage" checkout -q --orphan "$publish_branch"
        ;;
    *)
        cat "$release_tmp/remote.err" >&2
        exit "$remote_status"
        ;;
esac

# Work only inside the disposable repository. The source checkout and its
# current branch/index are never switched or modified by a release.
git -C "$stage" rm -r -q --ignore-unmatch -- .
cp -R public/. "$stage/"
git -C "$stage" add -A

if git -C "$stage" diff --cached --quiet; then
    echo "release: gh-pages already matches public/"
    exit 0
fi

release_name=$(git config user.name || printf '%s' 'mvi site publisher')
release_email=$(git config user.email || printf '%s' 'actions@users.noreply.github.com')
release_message=${RELEASE_MESSAGE:-"Publish $(date -u '+%Y-%m-%dT%H:%M:%SZ')"}

git -C "$stage" \
    -c user.name="$release_name" \
    -c user.email="$release_email" \
    commit -q -m "$release_message"
git -C "$stage" push publish "HEAD:refs/heads/$publish_branch"

echo "release: published public/ to $publish_remote ($publish_branch)"
