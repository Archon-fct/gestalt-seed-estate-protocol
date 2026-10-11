"""Compiler invariants independent of browser or network access."""
import hashlib, importlib.util, json
from pathlib import Path
import pytest
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('nexus_element_build',ROOT/'scripts/build-living-nexus-element.py')
build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
SHA='d9a6f3952bb7a400eadd4b2e0ae46019fbe8abb6'

def test_deterministic_build_does_not_rewrite_sources(tmp_path):
 lock=json.loads((ROOT/'wix/integration/source-lock.json').read_text())
 before={name:(ROOT/name).read_bytes() for name in lock}
 first=build.build(tmp_path/'first',SHA);second=build.build(tmp_path/'second',SHA)
 assert first==second
 for name,raw in before.items():
  assert (ROOT/name).read_bytes()==raw
  assert hashlib.sha256(raw).hexdigest()==lock[name]
 assert (tmp_path/'first/archon-living-nexus.js').read_bytes()==(tmp_path/'second/archon-living-nexus.js').read_bytes()
 assert first['productionInstalled'] is False and first['productionVerified'] is False
 assert (tmp_path/'first/living-nexus.html').is_file()

@pytest.mark.parametrize('ref',['main','latest','', 'z'*40])
def test_exact_source_required(tmp_path,ref):
 with pytest.raises(ValueError):build.build(tmp_path,ref)

def test_changed_anchor_is_rejected():
 with pytest.raises(ValueError):build.once('two two','two','new')
 with pytest.raises(ValueError):build.once('one','missing','new')

def test_original_procedural_renderer_is_present_without_alteration(tmp_path):
 build.build(tmp_path,SHA)
 code=(tmp_path/'archon-living-nexus.js').read_text()
 original=(ROOT/'hud/prototype/experiments/procedural-v10/procedural.js').read_text()
 # The renderer is serialized inside trusted document data, not rewritten by the adapter.
 assert json.dumps(original,ensure_ascii=False)[1:-1] in code
 assert 'connect-src' in code and 'microphone' in code
 assert 'eval(' not in code and 'new Function(' not in code
