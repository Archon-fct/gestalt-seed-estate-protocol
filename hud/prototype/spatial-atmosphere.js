// Archon Soulings — opt-in spatial atmosphere v0.1
// WebAudio is created only after an explicit user action. Silence is always immediate.
let ctx=null,nodes=[];
const worlds={
 aura:{base:174,over:261,depth:.018},
 services:{base:146,over:220,depth:.012},
 gestalt:{base:196,over:392,depth:.014},
 journal:{base:130,over:195,depth:.010},
 workshops:{base:164,over:246,depth:.015},
 aureglossa:{base:220,over:330,depth:.012},\n nexus:{base:110,over:220,depth:.008}\n};
function stopNodes(){nodes.forEach(n=>{try{n.stop?.()}catch{}try{n.disconnect?.()}catch{}});nodes=[]}
export async function enterAtmosphere(world){
 if(!worlds[world])return false;
 ctx ||= new (window.AudioContext||window.webkitAudioContext)();
 await ctx.resume();stopNodes();const s=worlds[world],master=ctx.createGain();master.gain.value=s.depth;master.connect(ctx.destination);
 [s.base,s.over].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i?'sine':'triangle';o.frequency.value=f;g.gain.value=i?.24:.5;o.connect(g).connect(master);o.start();nodes.push(o,g)});nodes.push(master);return true
}
export function silence(){stopNodes();if(ctx)ctx.suspend()}
