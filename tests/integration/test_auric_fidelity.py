"""Visual source guards. Only original generated material is bundled; no reference footage."""
from pathlib import Path
import hashlib, json, re
ROOT = Path(__file__).resolve().parents[2]
RENDER = ROOT / 'hud/prototype/experiments/procedural-v10/procedural.js'
CSS = ROOT / 'hud/prototype/experiments/procedural-v10/style.css'
LOCK = ROOT / 'wix/integration/source-lock.json'
PORTRAIT = ROOT / 'wix/integration/portrait.css'
HTML = ROOT / 'hud/prototype/experiments/procedural-v10/index.html'

def test_six_world_targets_are_unchanged_by_visual_candidate():
    content = HTML.read_text()
    worlds = re.findall(r'<button class="world" data-world="([^"]+)"', content)
    assert worlds == ['aura','aureglossa','sessions','workshops','gestalt','journal']
    assert content.count('class="world nexus-touch"') == 1
    assert 'id="livingScene" aria-hidden="true"' in content

def test_synthetic_visual_layer_does_not_capture_or_move_data():
    code = RENDER.read_text()
    for expected in ['AURIC_DEPTH_01','function makeVolumeCache()',
                     'function relationalWeave(t)', 'function centralIris(t)',
                     "canvas.dataset.visualLayer='auric-depth-01'", 'canvas.dataset.cachedVolume']:
        assert expected in code
    for prohibited in ['fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage',
                       'getUserMedia', 'navigator.sendBeacon', 'innerHTML', 'new Image(']:
        assert prohibited not in code

def test_material_is_passive_and_static_in_stillness():
    code = RENDER.read_text()
    style = CSS.read_text()
    assert 'app.state.still||document.hidden' in code
    assert 'if(app.state.still||document.hidden){draw();return;}' in code
    assert 'pointer-events:none' in style
    assert '@media (min-width:851px){.bottom-mark{display:none}}' in PORTRAIT.read_text()
    assert '.right-inscription{top:153px}' in style

def test_only_exact_changed_renderer_sources_receive_new_locks():
    lock = json.loads(LOCK.read_text())
    for path in ['hud/prototype/experiments/procedural-v10/procedural.js',
                 'hud/prototype/experiments/procedural-v10/style.css']:
        assert lock[path] == hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
    assert len(lock) == 28

def test_compiler_preserves_v10_family_but_marks_candidate_separately():
    build = (ROOT/'scripts/build-living-nexus-element.py').read_text()
    assert "VERSION = '1.1.0-auric-preview.1'" in build
    assert "'procedural-living-constellation-v10'" in RENDER.read_text()
    assert 'wix-site-host.com' in (ROOT/'wix/integration/element.js').read_text()  # existing review-origin allowlist


def test_material_atlas_is_local_bounded_and_fail_safe():
    code = RENDER.read_text()
    atlas = ROOT / 'hud/prototype/experiments/procedural-v10/material-atlas.js'
    lock = json.loads(LOCK.read_text())
    assert lock[str(atlas.relative_to(ROOT))] == hashlib.sha256(atlas.read_bytes()).hexdigest()
    assert 'data:image/webp;base64,' in atlas.read_text()
    assert 'atlas.naturalWidth===1536&&atlas.naturalHeight===1024' in code
    assert "atlas.onerror=()=>{atlasReady=false;refresh();};" in code
    assert 'function makeShell(n)' in code  # procedural material remains the fallback
