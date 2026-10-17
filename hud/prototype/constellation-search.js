export function searchConstellation(query,graph){
 const q=String(query||'').toLowerCase().trim();if(!q)return {nodes:[],edges:[]};
 const words=q.split(/\s+/).filter(Boolean);
 const scored=Object.entries(graph.nodes).map(([id,n])=>({id,score:n.terms.reduce((s,t)=>s+(words.some(w=>t.includes(w)||w.includes(t))?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const ids=new Set(scored.map(x=>x.id));
 return {nodes:scored,edges:graph.relationships.filter(e=>ids.has(e.from)||ids.has(e.to))};
}
