#!/usr/bin/env python3
"""One-use, hash-locked repair. No network or arbitrary paths; only three named files."""
from pathlib import Path
import hashlib
ROOT=Path(__file__).resolve().parents[1]
EXPECTED={
 'hud/prototype/index.html':'e35ce5fe1386d12d03335f9fd77667e56c1f0d5503709f5d6b9a137a06eb1078',
 'tests/test-living-nexus-hosted-bundle.mjs':'2604dd54c80422c3355003298009baaceb5b9298153af8810bd9255d75e9dfa8',
 'scripts/package-living-nexus-release.py':'ce23d2f604fab35c45948e45811b2530840611d0be3fa5050a28ed0f29db9f9e'
}
texts={}
for name,digest in EXPECTED.items():
 raw=(ROOT/name).read_bytes()
 if hashlib.sha256(raw).hexdigest()!=digest: raise SystemExit('Source changed; reconcile instead of overwriting: '+name)
 texts[name]=raw.decode()

def once(text,old,new):
 if text.count(old)!=1: raise SystemExit('Repair anchor is not unique: '+old[:80])
 return text.replace(old,new,1)

s=texts['hud/prototype/index.html']
changes=[
 ('status=document.querySelector("#status");let last=null;','status=document.querySelector("#status");let last=null,crossingTimer=null;'),
 ('function openNode(btn){last=btn;','function openNode(btn){clearTimeout(crossingTimer);last=btn;'),
 ('setTimeout(()=>{veil.classList.remove("preparing");veil.classList.add("open");','crossingTimer=setTimeout(()=>{crossingTimer=null;veil.classList.remove("preparing");veil.classList.add("open");'),
 ('function closeVeil(){\n const space=','function closeVeil(){\n const wasPreparing=veil.classList.contains("preparing");clearTimeout(crossingTimer);crossingTimer=null;\n const space='),
 ('if(reduced){veil.classList.remove("open","preparing");','if(reduced||wasPreparing){space.classList.remove("crossing","resonating");last?.classList.remove("resonant");veil.classList.remove("open","preparing");'),
 ('if(e.key==="Escape"&&veil.classList.contains("open"))closeVeil();','if(e.key==="Escape"&&(veil.classList.contains("open")||veil.classList.contains("preparing")))closeVeil();')
]
for old,new in changes:s=once(s,old,new)
assert hashlib.sha256(s.encode()).hexdigest()=='17d908dc0310479e613e8feeb92e8befe510bd930a4b068e66df5de611817f3f'
assert s.split('<script>')[0]==texts['hud/prototype/index.html'].split('<script>')[0], 'Visual markup changed'
patched={'hud/prototype/index.html':s}
s=texts['tests/test-living-nexus-hosted-bundle.mjs']
s=once(s,"import {chromium, webkit} from 'playwright';","import {chromium, webkit} from 'playwright';\nimport {canonicalHostedBytes} from './wix-html-transport.mjs';")
s=once(s,'const bytes = await get(file);','const bytes = await get(file);\n      const canonical = canonicalHostedBytes(bytes,file);')
s=s.replace('sha(bytes),release.files[file]','sha(canonical),release.files[file]').replace('sha(bytes),sha(source)','sha(canonical),sha(source)')
s=once(s,'return {bytes:bytes.length,sha256:sha(bytes)};','return {bytes:bytes.length,servedSha256:sha(bytes),sourceSha256:sha(canonical),verifiedWixInsertion:file.endsWith(".html")};')
s=s.replace('String(e.message)','String(e.stack||e)')
patched['tests/test-living-nexus-hosted-bundle.mjs']=s
s=texts['scripts/package-living-nexus-release.py']
bootstrap='<script id="wix-site-script" src="https://manage.wix.com/_api/headless-business-setup/v1/headless-business/site-script.js" data-client-id="a1a33144-20ee-4374-b66d-ec671bcaca77" async></script>'
addition='''    # Wix inserts this exact public bootstrap on upload. Preserve renderer bytes,
    # not duplicated hosting markup, when repackaging a captured preview.
    bootstrap = BOOTSTRAP_BYTES
    for name, raw in list(files.items()):
        if name.endswith(".html") and bootstrap in raw:
            if raw.count(bootstrap) != 1 or bootstrap + b"</head>" not in raw:
                raise ValueError("Unexpected Wix bootstrap insertion: " + name)
            files[name] = raw.replace(bootstrap, b"", 1)
'''.replace('BOOTSTRAP_BYTES',repr(bootstrap.encode()))
s=once(s,'    if snapshot and not set(HISTORICAL).issubset(files):',addition+'    if snapshot and not set(HISTORICAL).issubset(files):')
patched['scripts/package-living-nexus-release.py']=s
out=ROOT/'repair-evidence';out.mkdir(exist_ok=True)
(out/'index-before.html').write_text(texts['hud/prototype/index.html'])
for name,text in patched.items():(ROOT/name).write_text(text)
print('Applied hash-locked repair to exactly three files. Tests and source commit are still required.')
