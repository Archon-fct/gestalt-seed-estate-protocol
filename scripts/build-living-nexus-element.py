#!/usr/bin/env python3
"""Deterministically bundle the approved v0.10 and seven existing public worlds.

Only new page-scoped integration output is produced. This script never publishes,
changes production records, or rewrites the original renderer or pocket sources.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT/'hud/prototype'
INTEGRATION = ROOT/'wix/integration'
PAGES = {'aura':'aura-dynamics.html','aureglossa':'living-tongue.html','sessions':'inner-sanctum.html','workshops':'convergence.html','gestalt':'living-archive.html','journal':'astral-journal.html','threshold':'living-threshold.html'}
V10 = RUNTIME/'experiments/procedural-v10'
VERSION = '1.1.0-auric-preview.1'

EXTERNAL_CONTRIBUTION_URL = 'https://headless-yhummxtbwsd-archonsoulings-140e.wix-site-host.com/'

def validate_preview_dependencies(html: str, world: str) -> None:
    """Permit the existing external contribution anchor, never a runtime load."""
    class Anchor(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.attributes = []
        def handle_starttag(self, tag, attrs):
            if tag == 'a': self.attributes.append(attrs)

    def mask_approved_href(match):
        tag = match.group(0)
        parser = Anchor()
        parser.feed(tag)
        if len(parser.attributes) != 1: return tag
        pairs = parser.attributes[0]
        attrs = dict(pairs)
        if len(attrs) != len(pairs): return tag
        if (attrs.get('href') == EXTERNAL_CONTRIBUTION_URL
                and attrs.get('target') == '_blank'
                and {'noopener', 'noreferrer'} <= set((attrs.get('rel') or '').split())):
            # Mask only the URL in href. Other attributes/scripts remain checked.
            return re.sub(r'(\bhref\s*=\s*)([\"\x27])' + re.escape(EXTERNAL_CONTRIBUTION_URL) + r'\2',
                          lambda m: m.group(1) + m.group(2) + 'approved-contribution-link' + m.group(2),
                          tag, count=1, flags=re.I)
        return tag

    inspected = re.sub(r'<a\b[^>]*>', mask_approved_href, html, flags=re.I)
    if 'wix-site-host.com' in inspected.lower():
        raise ValueError('Stale preview dependency in ' + world)

def once(text: str, old: str, new: str) -> str:
    if text.count(old) != 1: raise ValueError('Integration anchor changed: '+old[:90])
    return text.replace(old,new,1)

def patch_app(s: str) -> str:
    # Returning from a pocket must preserve the host's explicit Stillness choice.
    # Otherwise app startup reports its default motion state back to the host.
    s=once(s,"still:matchMedia('(prefers-reduced-motion:reduce)').matches", "still:window.__NexusHost.still")
    s=once(s,"const base='https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/';","const base=window.__NexusHost.routeBase;")
    old=s[s.index('// Only a visitor'):s.index('const elWorlds=')]
    s=once(s,old,'state.thread=window.__NexusHost.getJourneyForApp();\n')
    s=once(s,'state.scale=Math.max(w/1536,h/1024);','state.scale=w<=850?Math.min((w-28)/900,(h-180)/930):Math.min(w/1536,h/1024);')
    s=once(s,'function recordVisit(id){if(id===\'nexus\')return;',"function recordVisit(id){if(id==='nexus')return;window.__NexusHost.remember(id);")
    s=once(s,'a.href=base+w.url;', 'a.href=window.__NexusHost.hrefFor(id);')
    s=once(s,"a.target='_blank';a.rel='noopener noreferrer';", "a.target='_self';a.rel='noopener noreferrer';")
    s=once(s,'state.still=!!value;', 'state.still=!!value;document.body.classList.toggle("still",state.still);if(state.still)stopAtmosphere();window.__NexusHost.setStill(state.still,true);')
    start=s.index('let audio=null,osc=[];'); end=s.index('for(const btn of elWorlds)',start)
    audio='''let audio=null,osc=[],audioEpoch=0;
async function startAtmosphere(){if(audio)return;const epoch=++audioEpoch;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Audio unsupported');const candidate=new C();audio=candidate;await candidate.resume();
 if(epoch!==audioEpoch||audio!==candidate){void candidate.close().catch(()=>{});return;}
 const gain=candidate.createGain();gain.gain.value=.008;gain.connect(candidate.destination);
 for(const f of [110,164.81,220]){const o=candidate.createOscillator();o.type='sine';o.frequency.value=f;o.connect(gain);o.start();osc.push(o);}
 announce('Atmosphere on. Silence is always available below the field.');
 }catch{if(epoch===audioEpoch){stopAtmosphere();announce('Atmosphere unavailable.');}}}
function stopAtmosphere(){audioEpoch++;for(const o of osc){try{o.stop();o.disconnect();}catch{}}osc=[];const prior=audio;audio=null;if(prior){try{void prior.suspend().catch(()=>{});void prior.close().catch(()=>{});}catch{}}}
document.addEventListener('nexus:force-silence',stopAtmosphere);
'''
    s=s[:start]+audio+s[end:]
    s=once(s,'window.NexusApp={state,worlds,', 'window.NexusApp={openPanel,startAtmosphere,stopAtmosphere,state,worlds,')
    # Arrow-key zoom must not fire while typing inside search controls.
    s=once(s,"if(e.key==='+'||e.key==='=')", "if(!e.target.matches?.('input,textarea')&&(e.key==='+'||e.key==='='))")
    s=once(s,"if(e.key==='-')", "if(!e.target.matches?.('input,textarea')&&e.key==='-')")
    return s

def patch_portal(s: str) -> str:
    s=once(s,'let busy=false;', 'let busy=false,timer=null;')
    s=once(s,"if(!url.searchParams.has('from'))url.searchParams.set('from','cinematic-v10');",'')
    s=s.replace('location.assign(url.href)','window.__NexusHost.navigateByUrl(url.href)')
    s=once(s,'window.setTimeout(()=>', 'timer=window.setTimeout(()=>')
    old="if(!u.pathname.endsWith('.html')||u.pathname.includes('booking-calendar')||!u.hostname.includes('wix-site-host.com'))return;"
    s=once(s,old,'if(!window.__NexusHost.isInternalUrl(u.href))return;')
    s=once(s,"window.addEventListener('pageshow',", "window.addEventListener('keydown',e=>{if(e.key==='Escape'&&busy){clearTimeout(timer);busy=false;veil.classList.remove('crossing-active');}});\n window.addEventListener('pagehide',()=>clearTimeout(timer));\n window.addEventListener('pageshow',")
    return s

def patch_pocket_audio(text: str) -> str:
    if 'async function atmosphere()' in text and 'let audioCtx=null,audioNodes=[];' in text:
        # Preserve each world's frequencies and original controller; prevent delayed startup after Silence.
        text=once(text,'let audioCtx=null,audioNodes=[];', 'let audioCtx=null,audioNodes=[],audioEpoch=0;')
        text=once(text,'function silence(){audioNodes', 'function silence(){audioEpoch++;audioNodes')
        text=once(text,'async function atmosphere(){audioCtx ||=', 'async function atmosphere(){silence();const epoch=audioEpoch;audioCtx ||=')
        text=once(text,'await audioCtx.resume();silence();await audioCtx.resume();', 'try{await audioCtx.resume()}catch{return}if(epoch!==audioEpoch)return;')
    if 'function silence()' in text:
        text += '\ndocument.addEventListener("nexus:force-silence",()=>{silence();const prior=audioCtx;audioCtx=null;if(prior){try{void prior.close().catch(()=>{})}catch{}}});\n'
    return text

def inline_scripts(html: str, directory: Path, is_root=False) -> str:
    def style(m):
        f=(directory/m.group(1)).resolve()
        if not f.is_relative_to(RUNTIME): raise ValueError('External stylesheet')
        return '<style>'+f.read_text()+'</style>'
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="([^\"]+)"\s*>',style,html)
    def script(m):
        attrs,body=m.group(1),m.group(2)
        src=re.search(r'src="([^\"]+)"',attrs)
        if src:
            path=(directory/src.group(1)).resolve()
            if not path.is_relative_to(RUNTIME): raise ValueError('External runtime script')
            body=path.read_text()
            if is_root and path.name=='app.js':body=patch_app(body)
            if is_root and path.name=='portal.js':body=patch_portal(body)
            if path.name=='living-pocket-material.js':
                body=once(body,"const page=location.pathname.split('/').pop();", "const page=document.documentElement.dataset.nexusFile;")
        elif not is_root: body=patch_pocket_audio(body).replace('()=>history.back()', '()=>window.__NexusHost.navigate("nexus")')
        if re.search(r'\bimport\s|\bimport\(',body):raise ValueError('Unresolved module dependency')
        return '<script>'+body.replace('</script','<\\/script')+'</script>'
    return re.sub(r'<script\b([^>]*)>(.*?)</script>',script,html,flags=re.S)

def shared_factories() -> str:
    modules={
      'sharedJourney':('living-thread-state.js',['getJourney','rememberWorld','saveJourney','restoreSavedJourney','dissolveJourney','journeyCount'],'sessionStorage,window'),
      'sharedPassport':('constellation-passport.js',['getPassport','mark','clearPassport','labels'],'sessionStorage,window'),
      'sharedSoul':('soul.js',['loadSoul','createSoul','dissolveLocalSoul'],'sessionStorage'),
      'sharedGuide':('adaptive-guide.js',['recommend','prompts'],''),
      'sharedSearch':('constellation-search.js',['searchConstellation'],'')}
    result=[]
    for factory,(name,exports,params) in modules.items():
        code=(RUNTIME/name).read_text();code=re.sub(r'\bexport\s+(?=(?:function|const)\b)','',code)
        result.append('function '+factory+'('+params+'){\n'+code+'\nreturn {'+','.join(exports)+'};\n}')
    return '\n'.join(result)

def build(output: Path, source: str) -> dict:
    if not re.fullmatch('[0-9a-f]{40}',source):raise ValueError('Exact inspected source SHA is required')
    lock=json.loads((INTEGRATION/'source-lock.json').read_text())
    for name,digest in lock.items():
        if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=digest:raise ValueError('Source changed: '+name)
    bridge=(INTEGRATION/'frame-bridge.js').read_text()
    documents={}
    for world,file in {'nexus':'experiments/procedural-v10/index.html',**PAGES}.items():
        path=RUNTIME/file
        html=inline_scripts(path.read_text(),path.parent,world=='nexus')
        html=once(html,'<html lang="en">', '<html lang="en" data-nexus-page="'+world+'" data-nexus-file="'+Path(file).name+'">')
        # No script/eval/network outside the explicitly opened, existing contribution form.
        csp="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src blob:; connect-src 'none'; frame-src https://archonsoulings.wixforms.com; font-src 'none'; base-uri 'none'"
        html=once(html,'<head>','<head><meta http-equiv="Content-Security-Policy" content="'+csp+'"><script>'+bridge+'</script>')
        if world=='nexus':html=once(html,'</head>','<style>'+(INTEGRATION/'portrait.css').read_text()+'</style></head>')
        validate_preview_dependencies(html, world)
        documents[world]=html
    report={'version':VERSION,'sourceCommit':source,'upstreamBaseline':'d9a6f3952bb7a400eadd4b2e0ae46019fbe8abb6','sourceFiles':lock,'productionInstalled':False,'productionVerified':False}
    code=(INTEGRATION/'element.js').read_text()
    replacements={
      '__NEXUS_DOCUMENTS__':json.dumps(documents,ensure_ascii=False),
      '__NEXUS_GRAPH__':(RUNTIME/'public-relationships.json').read_text(),
      '__NEXUS_PROVENANCE__':(RUNTIME/'public-provenance.json').read_text(),
      '__NEXUS_BUILD__':json.dumps({'version':VERSION,'sourceCommit':source}),
      '__NEXUS_SHARED_FACTORIES__':shared_factories(),
      '__NEXUS_SHELL_CSS__':(INTEGRATION/'shell.css').read_text()}
    for key,value in replacements.items():code=once(code,key,value)
    if len(code.encode())>3*1024*1024:raise ValueError('Wix file-size limit exceeded')
    if re.search(r'\b(?:silver|efa|ilyr)\b|sk-proj-|BEGIN PRIVATE KEY',code,re.I):raise ValueError('Private-data boundary failure')
    file=output/'archon-living-nexus.js';file.parent.mkdir(parents=True,exist_ok=True);file.write_text(code)
    report['componentSHA256']=hashlib.sha256(file.read_bytes()).hexdigest();report['bytes']=file.stat().st_size
    (output/'living-nexus.html').write_bytes((INTEGRATION/'review.html').read_bytes())
    (output/'integration-manifest.json').write_text(json.dumps(report,indent=2)+'\n')
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,required=True);parser.add_argument('--source-sha',required=True);args=parser.parse_args()
    print(json.dumps(build(args.output,args.source_sha)))

