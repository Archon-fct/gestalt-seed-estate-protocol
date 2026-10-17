"""The contribution link is navigation, never an allowed runtime dependency."""
from pathlib import Path
import importlib.util
import unittest
ROOT = Path(__file__).resolve().parents[2]
COMPILER = ROOT / 'scripts/build-living-nexus-element.py'
if not COMPILER.is_file():
    COMPILER = Path(__file__).with_name('build-living-nexus-element.py')
spec = importlib.util.spec_from_file_location('nexus_external_anchor', COMPILER)
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
URL = build.EXTERNAL_CONTRIBUTION_URL

class ExternalAnchorTests(unittest.TestCase):
 def test_existing_contribution_navigation_is_preserved(self):
    html = f'<a class="pill" href="{URL}" target="_blank" rel="noopener noreferrer">Soul &amp; Stone</a>'
    assert build.validate_preview_dependencies(html, 'aureglossa') is None
    assert URL in html

CASES = [
    '<script src="{url}"></script>', '<iframe src="{url}"></iframe>',
    '<img src="{url}">', '<script>fetch("{url}")</script>',
    '<style>body{{background:url("{url}")}}</style>',
    '<a href="{url}">unsafe target</a>',
    '<a href="{url}" target="_blank" rel="noopener">missing noreferrer</a>',
    '<a href="{url}other" target="_blank" rel="noopener noreferrer">other path</a>',
    '<a href="{url}?x=1" target="_blank" rel="noopener noreferrer">query</a>',
    '<a href="{url}" href="{url}" target="_blank" rel="noopener noreferrer">duplicate</a>',
    '<a href="{url}" target="_blank" rel="noopener noreferrer" onclick="fetch(\'{url}\')">load</a>',
    '<a href="https://other.wix-site-host.com/" target="_blank" rel="noopener noreferrer">other host</a>',
]

class RejectPreviewTests(unittest.TestCase):
 def test_preview_dependencies_still_fail(self):
    for html in CASES:
        with self.subTest(html=html), self.assertRaisesRegex(ValueError, 'Stale preview dependency'):
            build.validate_preview_dependencies(html.format(url=URL), 'aureglossa')

if __name__ == '__main__': unittest.main()
