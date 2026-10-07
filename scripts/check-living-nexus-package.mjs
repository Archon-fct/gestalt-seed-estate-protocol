#!/usr/bin/env node
// Pre-deployment static package gate. Does not deploy or alter files.
// Run from repository root: node scripts/check-living-nexus-package.mjs
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const root = 'hud/prototype';
const required = [
  'index.html','aura-dynamics.html','inner-sanctum.html','living-tongue.html',
  'living-archive.html','living-threshold.html','astral-journal.html','convergence.html'
];
let failures = 0;
for (const name of required) {
  const path = join(root,name);
  try {
    const s = await stat(path);
    if (!s.isFile() || s.size === 0) throw Error('empty or not a file');
    console.log('OK',path,s.size,'bytes');
  } catch (e) {
    console.error('MISSING',path,String(e));
    failures++;
  }
}
const entry = await readFile(join(root,'index.html'),'utf8').catch(()=> '');
for (const term of ['NEXUS','THARAVEL','KOSMATHRA']) {
  if (!entry.toUpperCase().includes(term)) {console.error('MISSING REQUIRED INSCRIPTION',term);failures++;}
}
// Scan shipped textual source for high-confidence private material. Review ambiguous hits manually.
const privatePatterns = [
  /\b(?:sk-proj-|sk_live_|ghp_|github_pat_)\S{8,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bSILVER\b/i
];
const { readdir } = await import('node:fs/promises');
async function scan(dir) {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,item.name);
    if (item.isDirectory()) {await scan(path);continue;}
    if (!/\.(html|css|js|json|txt|md|svg)$/i.test(item.name)) continue;
    const body=await readFile(path,'utf8');
    for (const pattern of privatePatterns) if(pattern.test(body)){
      console.error('PRIVATE MATERIAL REVIEW REQUIRED',path,pattern.source);
      failures++;
    }
  }
}
await scan(root);
if(failures){console.error('BLOCKED:',failures,'package issue(s)');process.exitCode=1}
else console.log('PASS: required static routes and basic private-material scan');
console.log('NOTE: passing does not certify visual fidelity, behavior, secrets outside known patterns, or Wix readiness.');
