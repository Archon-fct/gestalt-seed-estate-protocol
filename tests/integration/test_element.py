"""Public release adapter checks. No paid booking, email, or contribution is sent.

With NEXUS_BASE_URL, exercise the real served review page. Without it, use the
explicit offline set-content harness (not evidence of hosted Wix behavior).
"""
import json, os
from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BUILD = Path(os.environ.get('NEXUS_BUILD_DIR',str(ROOT/'integration-build')))
OUT = Path(os.environ.get('NEXUS_REPORT_DIR',str(ROOT/'integration-evidence')))
HOSTED = os.environ.get('NEXUS_BASE_URL')
ENGINES = os.environ.get('NEXUS_ENGINES','chromium').split(',')
OUT.mkdir(parents=True,exist_ok=True)

MEMORY = '''(() => {
const values = {session:new Map(),local:new Map()};
for(const [kind,store] of Object.entries(values))Object.defineProperty(window,kind+'Storage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});
})();'''
AUDIO = '''(() => {
window.__audioStarts=0;window.__audioContexts=[];
class AudioContextMock {
 constructor(){this.state='suspended';this.destination={};window.__audioContexts.push(this);}
 resume(){return new Promise(resolve=>setTimeout(()=>{if(this.state!=='closed')this.state='running';resolve();},window.__audioDelay||0));}
 suspend(){if(this.state!=='closed')this.state='suspended';return Promise.resolve();}
 close(){this.state='closed';return Promise.resolve();}
 createGain(){return {gain:{value:0},connect(){return this;},disconnect(){}};}
 createOscillator(){return {frequency:{value:0},connect(){return this;},start(){window.__audioStarts++;},stop(){},disconnect(){}};}
}
window.AudioContext=AudioContextMock;window.webkitAudioContext=AudioContextMock;
})();'''

@pytest.fixture(scope='session')
def playwright():
 with sync_playwright() as p: yield p

@pytest.fixture(params=ENGINES)
def browser(playwright,request):
 engine=getattr(playwright,request.param)
 opts={'headless':True}
 if request.param=='chromium' and os.environ.get('CHROMIUM_EXECUTABLE'):
  opts.update(executable_path=os.environ['CHROMIUM_EXECUTABLE'],args=['--no-sandbox'])
 b=engine.launch(**opts)
 yield request.param,b
 b.close()

class Harness:
 def __init__(self,engine,browser,width=390,height=844,motion='reduce',memory=True,audio=False):
  self.engine=engine
  self.context=browser.new_context(viewport={'width':width,'height':height},has_touch=width<1000,reduced_motion=motion,accept_downloads=True)
  if audio:self.context.add_init_script(AUDIO)
  self.page=self.context.new_page();self.page.set_default_timeout(7000)
  self.errors=[];self.network=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  def route(r):
   self.network.append((r.request.method,r.request.url))
   if HOSTED and r.request.method=='GET' and r.request.url.startswith(HOSTED.rsplit('/',1)[0]+'/'): r.continue_()
   else:r.abort()
  self.context.route('**/*',route)
  if HOSTED:
   self.page.goto(HOSTED,wait_until='networkidle')
  else:
   self.page.set_content('<html><head></head><body style="margin:0;background:#070c17"><header id="host-header">Host header</header><archon-living-nexus route-base="https://www.archonsoulings.com/living-nexus"></archon-living-nexus><footer id="host-footer">Host footer</footer></body></html>')
   if memory:self.page.evaluate(MEMORY)
   self.page.add_script_tag(content=(BUILD/'archon-living-nexus.js').read_text())
  self.ready()
 @property
 def el(self):return self.page.locator('archon-living-nexus')
 @property
 def frame(self):return self.el.locator('iframe').element_handle().content_frame()
 def ready(self):self.page.wait_for_function("document.querySelector('archon-living-nexus')?.dataset.ready==='true'")
 def snapshot(self):return self.el.evaluate('(e)=>e.snapshot()')
 def world(self,name):self.el.evaluate('(e,w)=>e.navigate(w)',name);self.ready()
 def action(self,name):self.el.locator(f'[data-action="{name}"]').click()
 def close(self):self.context.close()

def make(browser,**kw):return Harness(*browser,**kw)

@pytest.mark.parametrize('width,height',[(390,844),(820,1180),(1280,900)])
def test_six_worlds_fit_and_host_is_not_replaced(browser,width,height):
 h=make(browser,width=width,height=height)
 try:
  rects=h.frame.locator('.world:not(.nexus-touch)').evaluate_all('(xs)=>xs.map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.world,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,iw:innerWidth,ih:innerHeight}})')
  assert len(rects)==6
  for r in rects:
   assert r['x']>=0 and r['y']>=0 and r['right']<=r['iw'] and r['bottom']<=r['ih'],r
   assert r['w']>=44 and r['h']>=44,r
  assert h.frame.locator('#livingScene').count()==1
  assert h.frame.locator('img').count()==0
  assert h.el.locator('[data-action="silence"]').is_visible()
  assert h.page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert h.page.evaluate("document.querySelectorAll('body > header').length===1 && document.querySelectorAll('body > footer').length===1")
  h.page.screenshot(path=str(OUT/f'{h.engine}-{width}-nexus.png'),full_page=True)
  assert not h.errors,h.errors
 finally:h.close()

@pytest.mark.parametrize('world', ['aura','aureglossa','sessions','workshops','gestalt','journal','threshold'])
def test_every_world_material_and_return(browser,world):
 h=make(browser)
 try:
  h.world(world)
  assert h.frame.locator('#livingPocketMaterial').count()==1
  assert h.frame.evaluate('document.documentElement.scrollWidth<=innerWidth')
  base=h.el.evaluate('(e)=>e.hrefFor("nexus")')
  link=h.frame.locator('a[href="'+base+'"]').first
  assert 'living-nexus' in link.get_attribute('href')
  link.click();h.ready()
  assert h.snapshot()['world']=='nexus'
  assert not h.errors,h.errors
  assert not any(method!='GET' for method,_ in h.network)
 finally:h.close()

def test_click_enters_the_same_instance_and_preserves_native_booking_urls(browser):
 h=make(browser)
 try:
  f=h.frame;f.locator('.world[data-world="sessions"]').click()
  links=f.locator('#panelActions a').evaluate_all('(xs)=>xs.map(x=>x.href)')
  assert 'https://www.archonsoulings.com/booking-calendar/30-minutes-1' in links
  assert 'https://www.archonsoulings.com/booking-calendar/60-minutes-1' in links
  assert any('?world=sessions' in x for x in links)
  f.locator('#panelActions a').first.click();h.ready()
  assert h.snapshot()['world']=='sessions'
  assert h.frame.locator('a[href="https://www.archonsoulings.com/booking-calendar/60-minutes-1"]').count()
  assert h.page.locator('archon-living-nexus').count()==1
  assert not h.errors,h.errors
 finally:h.close()

def test_shared_field_journal_save_and_dissolve(browser):
 h=make(browser)
 try:
  h.world('aura')
  h.frame.locator('[data-step="4"]').click()
  assert 'integrated-aura' in h.snapshot()['passport']
  h.world('aureglossa');h.frame.locator('[data-word="tharavel"]').click()
  h.world('nexus');h.action('journey')
  content=h.el.locator('.journey-content').inner_text()
  assert 'Completed Sense' in content and 'Discovered Tharavel' in content
  assert set(h.snapshot()['journey'])=={'aura','aureglossa'}
  assert h.page.evaluate("localStorage.getItem('archonLivingNexus.saved.v1')") is None
  h.action('save')
  saved=json.loads(h.page.evaluate("localStorage.getItem('archonLivingNexus.saved.v1')"))
  assert set(saved['journey'])=={'aura','aureglossa'}
  h.page.evaluate("sessionStorage.setItem('unrelated-business-state','keep')")
  h.action('dissolve')
  assert h.snapshot()['journey']==[] and h.snapshot()['passport']==[]
  assert h.page.evaluate("localStorage.getItem('archonLivingNexus.saved.v1')") is None
  assert h.page.evaluate("sessionStorage.getItem('unrelated-business-state')")=='keep'
  assert not h.errors,h.errors
 finally:h.close()

def test_soul_requires_separate_informed_action(browser):
 h=make(browser)
 try:
  assert h.page.evaluate("sessionStorage.getItem('archonSoul.v1')") is None
  h.action('journey');assert 'random identifier' in h.el.locator('.journey-content').inner_text()
  h.el.get_by_role('button',name='Create a browser-local Soul (optional)',exact=True).click()
  soul=json.loads(h.page.evaluate("sessionStorage.getItem('archonSoul.v1')"))
  assert soul['economic'] is False and soul['chain'] is None
  h.el.get_by_role('button',name='Dissolve local Soul',exact=True).click()
  assert h.page.evaluate("sessionStorage.getItem('archonSoul.v1')") is None
 finally:h.close()

@pytest.mark.parametrize('gate', ['attend','host','teach','collab'])
def test_convergence_review_export_and_clear(browser,gate):
 h=make(browser)
 try:
  h.world('workshops');f=h.frame
  f.locator(f'[data-gate="{gate}"]').click();f.locator('#primary').click()
  f.locator('#inquiryGoal').fill('Offline synthetic inquiry only. <script>window.evil=1</script>')
  f.locator('#inquiryConsent').check();f.locator('#reviewInquiry').click()
  assert f.locator('#emailInquiry').get_attribute('href').startswith('mailto:Drew@ArchonSoulings.com?')
  assert f.evaluate('window.evil') is None
  with h.page.expect_download() as download:f.locator('#exportInquiry').click()
  text=Path(download.value.path()).read_text();assert 'Offline synthetic inquiry' in text
  f.locator('#dissolveInquiry').click();assert f.locator('#inquiryGoal').input_value()==''
  assert not h.errors,h.errors
 finally:h.close()

def test_aureglossa_atlas_and_relational_search(browser):
 h=make(browser)
 try:
  h.frame.locator('#menu').click();h.frame.locator('input[type="search"]').fill('boundaries')
  assert h.frame.locator('#panelBody .choice').count()>0
  h.frame.locator('#closePanel').click();h.frame.locator('#guide').click()
  h.frame.get_by_role('button',name='Learn something',exact=True).click()
  assert h.frame.locator('.world.guide-relevant').count()==3
  h.world('aureglossa');h.frame.locator('#openAtlas').click()
  h.frame.locator('[data-atlas-tab="grammar"]').click()
  assert 'Grammar as relationship' in h.frame.locator('.atlas-body').inner_text()
  assert not h.errors,h.errors
 finally:h.close()

def test_lifecycle_resources_stop_on_disconnect(browser):
 h=make(browser,motion='no-preference')
 try:
  h.page.evaluate("window.savedElement=document.querySelector('archon-living-nexus');window.oldFrame=window.savedElement.frame.contentWindow")
  h.page.wait_for_timeout(150)
  h.el.evaluate('(e)=>e.remove()')
  old=h.page.evaluate('window.oldFrame.__nexusLifecycle()')
  assert old['disposed'] and old['frames']==0 and old['timers']==0 and old['streams']==0
  h.page.evaluate('document.body.append(window.savedElement)');h.ready()
  assert h.snapshot()['live'] is True
  assert not h.errors,h.errors
 finally:h.close()

@pytest.mark.parametrize('world',['nexus','aura','workshops'])
def test_silence_cancels_delayed_audio_and_can_restart(browser,world):
 h=make(browser,audio=True,motion='no-preference')
 try:
  if world!='nexus':h.world(world)
  f=h.frame;f.evaluate('window.__audioDelay=120')
  if world=='nexus':
   f.locator('#menu').click()
   f.evaluate("()=>{window.NexusApp.startAtmosphere();window.__NexusHost.shadowRoot.querySelector('[data-action=\"silence\"]').click()}")
  else:f.evaluate("()=>{document.querySelector('#sound').click();window.__NexusHost.shadowRoot.querySelector('[data-action=\"silence\"]').click()}")
  h.page.wait_for_timeout(200)
  assert f.evaluate('window.__audioStarts')==0
  assert f.evaluate('window.__audioContexts.every(c=>c.state==="closed")')
  f.evaluate('window.__audioDelay=0')
  if world=='nexus':f.get_by_role('button',name='Atmosphere (opt-in)',exact=True).click()
  else:f.locator('#sound').click()
  h.page.wait_for_timeout(80)
  assert f.evaluate('window.__audioStarts')>0
  h.action('still');assert h.snapshot()['still']
  assert f.evaluate('window.__audioContexts.every(c=>c.state==="closed")')
  assert not h.errors,h.errors
 finally:h.close()

def test_unsupported_storage_keeps_controls_usable(browser):
 if HOSTED:pytest.skip('Storage denial fixture is a separate offline test')
 h=make(browser,memory=False)
 try:
  h.world('aura');h.action('journey');h.action('save')
  assert 'unavailable' in h.el.locator('.notice').inner_text()
  h.action('dissolve');assert h.snapshot()['journey']==[]
  assert not h.errors,h.errors
 finally:h.close()

def test_unapproved_routes_are_rejected_and_pending_crossing_cancels(browser):
 h=make(browser,motion='no-preference')
 try:
  before=h.snapshot()['world'];h.el.evaluate('(e)=>e.navigateByUrl("https://evil.example/living-nexus?world=aura")')
  assert h.snapshot()['world']==before
  h.frame.locator('.world[data-world="aura"]').click()
  h.frame.evaluate('''()=>{document.querySelector('#panelActions a').click();window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));}''')
  h.page.wait_for_timeout(900)
  assert h.snapshot()['world']=='nexus'
  assert not h.errors,h.errors
 finally:h.close()

def test_saved_journey_restores_after_new_session_and_rejects_hostile_values(browser):
 h=make(browser)
 try:
  h.world('aura');h.action('journey');h.action('save');h.action('close')
  h.page.evaluate('''() => {
   for(const k of ['archonLivingThread.session.v1','archonLivingThread.v1','archonPassport.v1'])sessionStorage.removeItem(k);
   const saved=JSON.parse(localStorage.getItem('archonLivingNexus.saved.v1'));
   saved.journey.push('__proto__','<img src=x onerror=alert(1)>');
   saved.passport.push('unknown-private-mark');localStorage.setItem('archonLivingNexus.saved.v1',JSON.stringify(saved));
   const old=document.querySelector('archon-living-nexus'), fresh=document.createElement('archon-living-nexus');
   fresh.setAttribute('route-base',old.getAttribute('route-base'));old.replaceWith(fresh);
  }''');h.ready()
  assert h.snapshot()['journey']==['aura']
  assert h.snapshot()['passport']==['entered-living-field']
  h.action('journey');h.action('dissolve')
  assert h.page.evaluate("localStorage.getItem('archonLivingNexus.saved.v1')") is None
  h.el.evaluate('(e)=>e.navigate("__proto__")')
  assert h.snapshot()['world']=='nexus'
  assert not h.errors,h.errors
 finally:h.close()
