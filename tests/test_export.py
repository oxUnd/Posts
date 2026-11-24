"""Exercise the real mvi renderer and the site's batch build without network."""

from html.parser import HTMLParser
from pathlib import Path
import os
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
MVI = shutil.which("mvi")


class Elements(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.parents = []
        self.stack = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        self.parents.append(tuple(self.stack))
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input",
                       "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append((tag, dict(attrs)))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def attributes(self, tag, key):
        return [attrs[key] for name, attrs in self.tags if name == tag and key in attrs]


@unittest.skipUnless(MVI, "mvi is required")
class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="posts-export-test-")
        self.addCleanup(self.temp.cleanup)
        self.workspace = Path(self.temp.name)

    def export(self, text, name="article.html", **env):
        source = self.workspace / "source with spaces.org"
        source.write_text(text)
        output = self.workspace / name
        result = subprocess.run(
            [MVI, "-N", "-u", "NONE", "-i", "NONE", "-n", "--noplugin", "-es",
             "-S", str(ROOT / "mvi-export.vim"), "--", str(source)],
            env={**os.environ, "MVI_ORG_OUTPUT": str(output),
                 "MVI_ASSET_BASE": "", "MVI_HOME_FEATURE": "", **env},
            capture_output=True, text=True, timeout=20,
        )
        return result, output

    def test_home_layout_and_fixed_theme(self):
        result, output = self.export(
            "#+TITLE: Home\n#+OPTIONS: toc:nil title:nil\n#+HTML_THEME: ocean\n* Posts\n",
            name="index.html", MVI_HOME_FEATURE="assets/home/frame.webp?a=1&b=2",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        html = output.read_text()
        elements = Elements(html)
        root = next(attrs for tag, attrs in elements.tags if tag == "html")
        self.assertEqual(root["data-theme"], "mono")
        self.assertEqual(root["data-default-theme"], "mono")
        self.assertIn("data-site-layout", html)
        self.assertIn("data-site-theme", html)
        self.assertIn('aria-current="page"', html)
        self.assertNotIn('class="toc"', html)
        self.assertNotIn('class="document-header"', html)
        self.assertIn("assets/home/frame.webp?a=1&b=2", elements.attributes("img", "src"))

    def test_post_assets_and_literal_options(self):
        result, output = self.export(
            '#+TITLE: 图片 & code\n* Body\n[[file:images/photo.png]]\n'
            '[[file:./images/other.png]]\n[[file:images/manual.txt][Manual]]\n'
            '#+BEGIN_SRC org\n#+OPTIONS: toc:nil title:nil\n#+END_SRC\n',
            MVI_ASSET_BASE="assets/post & demo/",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        html = output.read_text()
        elements = Elements(html)
        self.assertIn("assets/post & demo/photo.png", elements.attributes("img", "src"))
        self.assertIn("assets/post & demo/other.png", elements.attributes("img", "src"))
        self.assertIn("assets/post & demo/manual.txt", elements.attributes("a", "href"))
        self.assertIn('class="toc"', html)
        self.assertIn('class="document-header"', html)
        self.assertNotIn("page", elements.attributes("a", "aria-current"))

    def test_export_error_is_reported(self):
        result, output = self.export('#+INCLUDE: "missing.org"\n')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing.org", result.stdout + result.stderr)
        self.assertFalse(output.exists())

    def test_article_title_is_inside_document_card(self):
        result, output = self.export(
            "#+TITLE: Emacs使用以及简单优化\n* Body\nArticle text.\n"
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        html = output.read_text()
        elements = Elements(html)
        titles = [parents for (tag, _), parents in zip(elements.tags, elements.parents)
                  if tag == "h1"]
        self.assertEqual(len(titles), 1)
        self.assertEqual([tag for tag, _ in titles[0]][-2:], ["main", "header"])
        self.assertEqual(titles[0][-1][1]["class"], "document-header")
        self.assertIn("<h1>Emacs使用以及简单优化</h1>", html)
        self.assertNotIn("<p></p>", html)
        self.assertLess(html.index('<header class="document-header">'),
                        html.index('<aside class="toc">'))

    def test_complete_build_with_spaces_and_separate_assets(self):
        for name in ("build.sh", "mvi-export.vim", "CNAME", "LICENSE"):
            shutil.copy2(ROOT / name, self.workspace / name)
        shutil.copytree(ROOT / "theme", self.workspace / "theme")
        (self.workspace / "index.org").write_text("#+TITLE: Home\n#+OPTIONS: toc:nil title:nil\n")
        (self.workspace / "README.org").write_text("#+TITLE: Not a post\n")
        for page in ("2026-01-01-first post", "2026-01-02-second"):
            directory = self.workspace / "posts" / page
            (directory / "images").mkdir(parents=True)
            (directory / "images/photo.png").write_bytes(page.encode())
            (directory / (page + ".org")).write_text(
                "#+TITLE: " + page + "\n* Body\n[[file:images/photo.png]]\n"
            )
        # Force the supported offline path, keeping this test deterministic.
        binaries = self.workspace / "bin"
        binaries.mkdir()
        curl = binaries / "curl"
        curl.write_text("#!/bin/sh\nexit 1\n")
        curl.chmod(0o755)
        result = subprocess.run(
            ["sh", "build.sh"], cwd=self.workspace,
            env={**os.environ, "PATH": str(binaries) + os.pathsep + os.environ["PATH"],
                 "MVI_HOME_FEATURE": ""},
            capture_output=True, text=True, timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        public = self.workspace / "public"
        self.assertEqual(len(list(public.glob("*.html"))), 4)
        links = Elements((public / "index.html").read_text()).attributes("a", "href")
        for page in ("2026-01-01-first post", "2026-01-02-second"):
            self.assertIn(page + ".html", links)
            html = (public / (page + ".html")).read_text()
            self.assertIn("assets/" + page + "/photo.png", Elements(html).attributes("img", "src"))
            self.assertEqual((public / "assets" / page / "photo.png").read_bytes(), page.encode())
        self.assertIn('content="0; url=/"', (public / "404.html").read_text())
        self.assertIn("files with mvi (VIM", result.stdout)


if __name__ == "__main__":
    unittest.main()
