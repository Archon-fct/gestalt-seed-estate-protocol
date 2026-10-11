"""Release safety tests. Network access is never used by this test module."""
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("release_package", ROOT / "scripts/package-living-nexus-release.py")
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)
SHA = "b50960d9b032fe6705025c4d24121c5539375c20"

class Packaging(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.write("index.html", '<!doctype html><html><body>Hello</body></html>')
        self.write("PREVIEW_BUNDLE_MANIFEST.json", json.dumps({"required": ["index.html"]}))

    def write(self, name, text):
        p = self.root / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    def archive(self, files):
        target = self.root / "snapshot.zip"
        package.write_zip(target, files)
        return target

    def test_actual_runtime_dependencies_and_new_modules(self):
        files = package.build(package.RUNTIME, None, SHA)
        for name in ('public-graph.json', 'public-relationships.json', 'convergence-journey.js', 'convergence-journey.css', 'living-pocket-material.js', 'living-pocket-material.css', 'aureglossa-atlas.js', 'aureglossa-atlas.css'):
            self.assertIn(name, files)
        self.assertNotIn('test-constellation.mjs', files)
        self.assertNotIn('PREVIEW_BUNDLE_MANIFEST.json', files)

    def test_valid_build_and_receipt(self):
        files = package.build(self.root, None, SHA)
        receipt = json.loads(files['release.json'])
        self.assertEqual(receipt['sourceCommit'], SHA)
        self.assertFalse(receipt['productionPublished'])
        self.assertTrue(receipt['inquiryOnly'])
        self.assertEqual(len(receipt['files']['index.html']), 64)

    def test_deterministic_zip(self):
        files = package.build(self.root, None, SHA)
        first, second = self.root/'a.zip', self.root/'b.zip'
        package.write_zip(first, files)
        package.write_zip(second, dict(reversed(list(files.items()))))
        self.assertEqual(first.read_bytes(), second.read_bytes())

    def test_exact_source_required(self):
        with self.assertRaises(ValueError):
            package.build(self.root, None, 'latest')

    def test_missing_source_is_fatal(self):
        (self.root/'index.html').unlink()
        with self.assertRaises(FileNotFoundError):
            package.build(self.root, None, SHA)

    def test_missing_dependency_is_fatal(self):
        self.write('index.html', '<html><script src="missing.js"></script></html>')
        with self.assertRaisesRegex(ValueError, 'Missing dependency'):
            package.build(self.root, None, SHA)

    def test_external_links_are_not_downloaded(self):
        self.write('index.html', '<html><a href="https://example.invalid/page.html">External</a></html>')
        package.build(self.root, None, SHA)

    def test_paths_are_bounded(self):
        for name in ('../secret.js', '/index.html', 'a/../../b.js', '.env', 'a\\b.js', 'a//b.js'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                package.safe_name(name)

    def test_duplicate_manifest_is_fatal(self):
        self.write('PREVIEW_BUNDLE_MANIFEST.json', json.dumps({'required': ['index.html','index.html']}))
        with self.assertRaises(ValueError):
            package.build(self.root, None, SHA)

    def test_symlink_source_is_fatal(self):
        (self.root/'index.html').unlink()
        (self.root/'index.html').symlink_to(ROOT/'README.md')
        with self.assertRaises(ValueError):
            package.build(self.root, None, SHA)

    def test_private_content_and_keys_are_fatal(self):
        for text in ('Silver private mirror', 'EFA', 'Ilyr', '-----BEGIN PRIVATE KEY-----', 'sk-proj-abcdefghijk1234'):
            self.write('index.html', '<html>'+text+'</html>')
            with self.subTest(text=text), self.assertRaises(ValueError):
                package.build(self.root, None, SHA)

    def test_non_html_errors_are_fatal(self):
        self.write('index.html', 'Gateway failed')
        with self.assertRaises(ValueError):
            package.build(self.root, None, SHA)

    def test_archive_strips_provider_metadata(self):
        raw = self.archive({'index.html': b'<html></html>', 'wix.config.json': b'{}', '_wix/pages.json': b'{}'}).read_bytes()
        files = package.public_archive(raw, {'index.html'})
        self.assertEqual(set(files), {'index.html'})

    def test_unknown_archive_entry_is_fatal(self):
        raw = self.archive({'index.html': b'<html></html>', 'owner-notes.txt': b'notes'}).read_bytes()
        with self.assertRaises(ValueError):
            package.public_archive(raw, {'index.html'})

    def test_snapshot_must_preserve_every_comparison(self):
        path = self.archive({'index.html': b'<html></html>'})
        with self.assertRaises(ValueError):
            package.build(self.root, path, SHA)

    def test_historical_bytes_survive_merge(self):
        old = {name: b'<html></html>' if name.endswith('.html') else b'/* historical */' for name in package.HISTORICAL}
        old['index.html'] = b'<html>old</html>'
        files = package.build(self.root, self.archive(old), SHA)
        for name in package.HISTORICAL:
            self.assertEqual(files[name], old[name])
        self.assertNotEqual(files['index.html'], old['index.html'])
        self.assertTrue(json.loads(files['release.json'])['preservedDeployedComparisons'])

    def test_zip_symlink_is_rejected(self):
        raw = io.BytesIO()
        with zipfile.ZipFile(raw, 'w') as archive:
            info = zipfile.ZipInfo('index.html')
            info.external_attr = 0o120777 << 16
            archive.writestr(info, 'elsewhere')
        with self.assertRaises(ValueError):
            package.public_archive(raw.getvalue(), {'index.html'})

if __name__ == '__main__':
    unittest.main()
