// Public client-copy non-regression gate.
// This scans shipped HTML/JS/CSS only, not private research or internal documentation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('hud/prototype');
const excluded=new Set(['node_modules','test-artifacts','.git']);
const forbidden=/psychological profile|personality profil(?:e|ing)|behavioral profil(?:e|ing)|client profil(?:e|ing)|psychographic|infer your thoughts|record where you look/gi;
const issues=[];
let checked=0;
function scan(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(excluded.has(entry.name))continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){scan(file);continue;}
  if(!entry.isFile()||!/[.]html$|[.]js$|[.]css$/.test(entry.name)||entry.name.startsWith('test-'))continue;
  const s=fs.readFileSync(file,'utf8');checked++;
  for(const match of s.matchAll(forbidden)){
   issues.push(path.relative(root,file)+': forbidden client copy at '+match.index);
  }
 }
}
scan(root);
assert.deepEqual(issues,[], 'Client-facing public source must not refer to profiling or thought inference');
console.log('PASS: '+checked+' public source files contain no client-profiling or thought-inference copy');
