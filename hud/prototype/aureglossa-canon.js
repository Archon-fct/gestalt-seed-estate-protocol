/* Aureglossa canonical alphabet bridge.
 * Source-backed 32-letter inventory from Aureglossa Language Pack v0.3,
 * preserved as the historical baseline carried by Canonical Master v1.0.
 * This file activates recorded letters/names/IPA only. It does not invent
 * custom glyph art, historical etymology, or superseded v0.3 grammar.
 */
(()=>{"use strict";
const alphabet=Object.freeze([
  {letter:"A",name:"Ahra",ipa:"a",notes:"ah as in father"},
  {letter:"Æ",name:"Aetha",ipa:"ae",notes:"diphthong eye-eh"},
  {letter:"B",name:"Bera",ipa:"b",notes:""},
  {letter:"C",name:"Kora",ipa:"k ~ t͡ʃ",notes:"k normally; ch before E/I"},
  {letter:"D",name:"Dara",ipa:"d",notes:""},
  {letter:"E",name:"Etha",ipa:"e",notes:"eh as in met"},
  {letter:"F",name:"Phora",ipa:"f",notes:""},
  {letter:"G",name:"Gura",ipa:"g",notes:""},
  {letter:"H",name:"Hael",ipa:"h",notes:""},
  {letter:"I",name:"Isar",ipa:"i",notes:"ee as in machine"},
  {letter:"J",name:"Jora",ipa:"ʒ",notes:"zh as in vision"},
  {letter:"K",name:"Kael",ipa:"k",notes:"hard k"},
  {letter:"L",name:"Lura",ipa:"l",notes:""},
  {letter:"M",name:"Mora",ipa:"m",notes:""},
  {letter:"N",name:"Nara",ipa:"n",notes:""},
  {letter:"O",name:"Oran",ipa:"o",notes:"oh as in holy"},
  {letter:"Ω",name:"Omae",ipa:"oː",notes:"long sacred oh"},
  {letter:"P",name:"Phera",ipa:"p",notes:""},
  {letter:"Q",name:"Quora",ipa:"kw",notes:""},
  {letter:"R",name:"Raha",ipa:"r̄",notes:"trilled"},
  {letter:"S",name:"Sara",ipa:"s",notes:""},
  {letter:"T",name:"Tara",ipa:"t",notes:""},
  {letter:"U",name:"Urum",ipa:"u",notes:"oo as in truth"},
  {letter:"V",name:"Vael",ipa:"v",notes:""},
  {letter:"W",name:"Waen",ipa:"w",notes:""},
  {letter:"X",name:"Xara",ipa:"ks ~ ʃ",notes:"ks normally; sh in some positions"},
  {letter:"Y",name:"Yara",ipa:"j",notes:"y"},
  {letter:"Z",name:"Zara",ipa:"z",notes:""},
  {letter:"Θ",name:"Thura",ipa:"θ",notes:"soft th"},
  {letter:"Ψ",name:"Psyra",ipa:"ps",notes:""},
  {letter:"Φ",name:"Phaios",ipa:"pʰ",notes:"aspirated ph"},
  {letter:"Χ",name:"Khara",ipa:"kʰ",notes:"aspirated kh"}
].map(Object.freeze));

const canon=Object.freeze({
  schema:"archon.aureglossa.alphabet/1.0",
  count:alphabet.length,
  alphabet,
  source:{pack:"Aureglossa Language Pack",version:"0.3",updated:"2025-08-10"},
  masterLineage:{name:"Aureglossa Canonical Master",version:"1.0",canonDate:"2026-09-21"},
  status:"SOURCE_BACKED_CANON_BASELINE",
  boundary:"Letter names and phonetic inventory are activated. Custom glyph artwork remains a separate unrecovered asset; v0.3 grammar remains historical where Canonical Master v1.0 supersedes it."
});
window.AureglossaCanon=canon;

function markPassport(id){
  try{
    const key="archonPassport.v1";
    const p=JSON.parse(sessionStorage.getItem(key)||"[]");
    if(!p.includes(id))p.push(id);
    sessionStorage.setItem(key,JSON.stringify(p));
  }catch{}
}
function updateSoulCanonMark(mark){
  try{
    const key="archonSoul.v1";
    const soul=JSON.parse(sessionStorage.getItem(key)||"null");
    if(!soul||soul.version!==1)return;
    soul.canonMarks=[...new Set([...(soul.canonMarks||[]),mark])].slice(0,64);
    sessionStorage.setItem(key,JSON.stringify(soul));
  }catch{}
}
function activate(entry){
  markPassport("aureglossa-letter-"+entry.letter);
  updateSoulCanonMark("AUREGLOSSA:"+entry.letter);
  const status=document.querySelector("#status"),title=document.querySelector("#title"),
    copy=document.querySelector("#copy"),klass=document.querySelector("#class"),
    source=document.querySelector("#source"),canonEl=document.querySelector("#canon"),
    note=document.querySelector("#note");
  if(status)status.textContent="CANONICAL ALPHABET · SOURCE-BACKED";
  if(title)title.textContent=entry.letter+" · "+entry.name;
  if(copy)copy.textContent="Recorded phonetic value /"+entry.ipa+"/."+ (entry.notes?" "+entry.notes+".":"");
  if(klass)klass.textContent="alphabet letter";
  if(source)source.textContent="Aureglossa Language Pack v0.3 · preserved master lineage";
  if(canonEl)canonEl.textContent="SOURCE-BACKED CANON BASELINE";
  if(note)note.textContent="This activates the recorded letter/name/phonetic inventory only. No custom glyph shape or historical etymology is being invented.";
}
function renderRing(){
  const ring=document.querySelector(".glyphring");
  if(!ring||ring.querySelector(".canon-letter"))return;
  ring.setAttribute("aria-label","Aureglossa canonical alphabet");
  alphabet.forEach((entry,i)=>{
    const b=document.createElement("button");
    b.type="button";b.className="canon-letter";b.textContent=entry.letter;
    b.title=entry.name+" · /"+entry.ipa+"/";
    b.setAttribute("aria-label",entry.letter+", "+entry.name+", "+entry.ipa);
    b.style.setProperty("--i",String(i));b.style.setProperty("--n",String(alphabet.length));
    b.addEventListener("click",()=>activate(entry));
    ring.appendChild(b);
  });
  const style=document.createElement("style");
  style.textContent=`
    .glyphring{pointer-events:none}
    .glyphring .canon-letter{pointer-events:auto;position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;border:1px solid #7ce2d155;background:#08111edc;color:#eee7d8;font:16px/1 Georgia,serif;display:grid;place-items:center;cursor:pointer;transform:rotate(calc((360deg / var(--n)) * var(--i))) translateY(calc(-1 * min(35vw,365px))) rotate(calc((-360deg / var(--n)) * var(--i)));box-shadow:0 0 16px #7ce2d11c;transition:box-shadow .25s,transform .25s}
    .glyphring .canon-letter:hover,.glyphring .canon-letter:focus-visible{outline:2px solid #7ce2d3;outline-offset:2px;box-shadow:0 0 26px #7ce2d155,0 0 18px #e0bd7330;z-index:3}
    @media(max-width:980px){.glyphring{position:absolute;top:375px;width:min(92vw,620px);height:min(92vw,620px)}.glyphring .canon-letter{width:34px;height:34px;margin:-17px;font-size:13px;transform:rotate(calc((360deg / var(--n)) * var(--i))) translateY(calc(-1 * min(42vw,280px))) rotate(calc((-360deg / var(--n)) * var(--i)))}}
    @media(prefers-reduced-motion:reduce){.glyphring .canon-letter{transition:none}}
  `;
  document.head.appendChild(style);
}
function addAtlasTab(){
  const tabs=document.querySelector("#aureglossaAtlas .atlas-tabs");
  if(!tabs||tabs.querySelector('[data-atlas-tab="alphabet"]'))return;
  const b=document.createElement("button");b.className="atlas-tab";b.type="button";
  b.setAttribute("role","tab");b.dataset.atlasTab="alphabet";b.textContent="Alphabet";
  const grammar=tabs.querySelector('[data-atlas-tab="grammar"]');
  tabs.insertBefore(b,grammar||null);
}
renderRing();
addAtlasTab();
})();