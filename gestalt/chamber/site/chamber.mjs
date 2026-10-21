import { mountField } from './field.mjs';
import { REALMS } from './realms.mjs';

// Cinematic presentation only. Realm data and external destinations are unchanged.
const $ = selector => document.querySelector(selector);
const nodes = $('#nodes'), canvas = $('#field'), stillButton = $('#still');
const hatch = $('#hatch-toggle'), picker = $('#realm-select'), soundButton = $('#sound');
const media = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0, open = false, storedStill = false, soundOn = false, audio = null;
let soundGeneration = 0;
const activeVoices = new Set();
try { storedStill = localStorage.getItem('gestalt.platinum.still') === '1'; } catch {}
const still = () => storedStill || media.matches;
const positions = REALMS.map((_, i) => i === 0 ? { x: 50, y: 50 } : {
  x: 50 + 40 * Math.cos(-Math.PI / 2 + (i - 1) * Math.PI * 2 / 9),
  y: 50 + 40 * Math.sin(-Math.PI / 2 + (i - 1) * Math.PI * 2 / 9)
});
const field = mountField(canvas, {
  selection: () => selected,
  still: () => still() || !open,
  targets: () => positions.map(p => ({ x: canvas.clientWidth * p.x / 100, y: canvas.clientHeight * p.y / 100 }))
});

// Engraving uses ordinary geometry, never invented language or supplied artwork.
const svgNS = 'http://www.w3.org/2000/svg';
for (let i = 0; i < 120; i++) {
  const a = i * Math.PI / 60, major = i % 10 === 0;
  const tick = document.createElementNS(svgNS, 'line');
  const r1 = major ? 262 : 267, r2 = 273;
  for (const [key, value] of Object.entries({x1:400+Math.cos(a)*r1,y1:400+Math.sin(a)*r1,x2:400+Math.cos(a)*r2,y2:400+Math.sin(a)*r2,stroke:'#c7b88b','stroke-opacity':major?'.75':'.28','stroke-width':major?'1.4':'.7'})) tick.setAttribute(key,String(value));
  $('#dial-marks').append(tick);
}

function silence(message = 'Sound is off.') {
  soundGeneration++;
  soundOn = false;
  for (const voice of activeVoices) {
    try { voice.gain.gain.cancelScheduledValues(0); voice.gain.gain.value = 0; voice.osc.stop(); } catch {}
    voice.gain.disconnect();
  }
  activeVoices.clear();
  if (audio && audio.state === 'running') audio.suspend().catch(() => {});
  soundButton.textContent = 'Sound off';
  soundButton.setAttribute('aria-pressed', 'false');
  $('#audio-status').textContent = message;
}

function chime(index = selected, opening = false) {
  if (!soundOn || !audio || audio.state !== 'running' || still() || document.hidden) return;
  const now = audio.currentTime, base = [164.81,196,220,246.94,293.66][index % 5];
  [1, 2.001, 3.002].forEach((ratio, i) => {
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = 'sine'; osc.frequency.value = base * ratio;
    const start = now + i * .035, end = start + (opening ? 1.6 : .85);
    gain.gain.setValueAtTime(0,start);
    gain.gain.linearRampToValueAtTime(.018 / (i + 1), start + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, end);
    osc.connect(gain); gain.connect(audio.destination);
    const voice = {osc,gain}; activeVoices.add(voice);
    osc.onended = () => { activeVoices.delete(voice); osc.disconnect(); gain.disconnect(); };
    osc.start(start); osc.stop(end + .04);
  });
}

function setOpen(value, audible = true) {
  open = value;
  document.body.dataset.open = String(open);
  hatch.setAttribute('aria-expanded', String(open));
  hatch.querySelector('strong').textContent = open ? 'CLOSE THE IRIS' : 'OPEN THE SEED';
  hatch.querySelector('small').textContent = open ? 'The archive is open' : 'Touch to unfold';
  $('#map-hint').textContent = open ? 'Ten realms. Each one keeps its story.' : 'Turn a seal. Reveal its origin.';
  field.refresh();
  if (audible) chime(selected, true);
}

function select(index, { reveal = true, audible = true } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= REALMS.length) return;
  selected = index;
  const n = REALMS[index];
  $('#realm-title').textContent = n[0];
  $('#realm-copy').textContent = n[5];
  $('#realm-status').textContent = n[1] + ' · ' + n[2];
  $('#realm-link').href = n[6];
  $('#realm-link').textContent = index === 1 ? 'Enter Soul & Stone ↗' : index === 9 ? 'Explore open contributions ↗' : 'Explore this realm ↗';
  $('#realm-note').textContent = index === 1 ? 'Opens the contribution gateway in a new tab.' : 'Opens the public source in a new tab.';
  $('#folio').textContent = String(index + 1).padStart(2,'0');
  for (const [i, button] of [...nodes.children].entries()) button.setAttribute('aria-pressed',String(i === index));
  picker.value = String(index);
  $('#selection-status').textContent = n[0] + ' selected. ' + n[2] + '. Realm details updated below.';
  if (reveal && !open) setOpen(true, false);
  if (audible) chime(index);
  field.refresh();
}

REALMS.forEach((n,i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'realm' + (i === 0 ? ' core' : '');
  b.style.setProperty('--x', positions[i].x + '%'); b.style.setProperty('--y', positions[i].y + '%');
  b.setAttribute('aria-label',n[0] + ' · ' + n[1]); b.setAttribute('aria-controls','realm-detail');
  const number = document.createElement('span'); number.className = 'sigil'; number.setAttribute('aria-hidden','true'); number.textContent = String(i + 1).padStart(2,'0');
  const label = document.createElement('span'); label.textContent = n[0];
  b.append(number,label); b.addEventListener('click',()=>select(i));
  b.addEventListener('keydown',e => {
    if (!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? REALMS.length - 1 : (i + (['ArrowRight','ArrowDown'].includes(e.key) ? 1 : REALMS.length - 1)) % REALMS.length;
    nodes.children[next].focus(); select(next);
  });
  nodes.append(b);
  const option = document.createElement('option'); option.value = String(i); option.textContent = n[0]; picker.append(option);
});

function syncStillness() {
  document.body.dataset.still = String(still());
  stillButton.setAttribute('aria-pressed',String(still()));
  stillButton.textContent = media.matches ? 'Stillness · system' : storedStill ? 'Stillness on' : 'Stillness';
  stillButton.disabled = media.matches;
  stillButton.title = media.matches ? 'Reduced motion is enabled in your system preferences.' : '';
  soundButton.disabled = still();
  soundButton.title = still() ? 'Sound stays off while Stillness is active.' : '';
  if (still()) silence('Stillness is on. Sound stopped.');
  field.refresh();
}
stillButton.addEventListener('click',()=>{
  storedStill = !storedStill;
  try { localStorage.setItem('gestalt.platinum.still',storedStill ? '1' : '0'); } catch {}
  syncStillness();
});
media.addEventListener('change',syncStillness);
hatch.addEventListener('click',()=>setOpen(!open));
picker.addEventListener('change',()=>select(Number(picker.value)));
$('#inspect').addEventListener('click',()=>{
  setOpen(true,false); $('#realm-detail').focus({preventScroll:true});
  $('#realm-detail').scrollIntoView({behavior:still() ? 'auto' : 'smooth',block:'start'});
});
document.addEventListener('keydown',e=>{
  if (e.key === 'Escape') { silence(); if (open) { setOpen(false,false); hatch.focus({preventScroll:true}); } }
});
soundButton.addEventListener('click',async()=>{
  if (soundOn) { silence(); return; }
  if (still()) return;
  const attempt = ++soundGeneration;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Audio unavailable');
    audio ||= new Audio();
    await audio.resume();
    if (attempt !== soundGeneration || still() || document.hidden) { if (!soundOn) audio.suspend().catch(()=>{}); return; }
    soundOn = true; soundButton.textContent = 'Silence'; soundButton.setAttribute('aria-pressed','true');
    $('#audio-status').textContent = 'Sound on. Select Silence to stop immediately.';
    chime(selected,true);
  } catch { silence('Sound is unavailable in this browser. The chamber remains fully usable.'); }
});
document.addEventListener('visibilitychange',()=>{ if(document.hidden) silence(); });
window.addEventListener('pagehide',()=>silence());
select(0,{reveal:false,audible:false}); syncStillness(); setOpen(false,false);
