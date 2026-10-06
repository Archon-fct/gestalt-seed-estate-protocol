// Archon Soulings — shared public journey state v0.1
// Privacy contract: no server write, no sensitive profiling, no Silver/private state.
const KEY='archonLivingThread.v1';
const SESSION='archonLivingThread.session.v1';
const validWorlds=['nexus','aura','aureglossa','services','workshops','gestalt','journal'];
function clean(list){return [...new Set((Array.isArray(list)?list:[]).filter(x=>validWorlds.includes(x)))].slice(0,12)}
export function getJourney(){try{return clean(JSON.parse(sessionStorage.getItem(SESSION)||'[]'))}catch{return []}}
export function rememberWorld(id){const j=getJourney();if(validWorlds.includes(id)&&!j.includes(id))j.push(id);sessionStorage.setItem(SESSION,JSON.stringify(clean(j)));window.dispatchEvent(new CustomEvent('archon:journey',{detail:{journey:clean(j)}}));return clean(j)}
export function saveJourney(){const j=getJourney();sessionStorage.setItem(KEY,JSON.stringify(j));return j}
export function restoreSavedJourney(){try{const j=clean(JSON.parse(sessionStorage.getItem(KEY)||'[]'));sessionStorage.setItem(SESSION,JSON.stringify(j));return j}catch{return []}}
export function dissolveJourney(){sessionStorage.removeItem(KEY);sessionStorage.removeItem(SESSION);window.dispatchEvent(new CustomEvent('archon:journey',{detail:{journey:[]}}))}
export function journeyCount(){return getJourney().length}
