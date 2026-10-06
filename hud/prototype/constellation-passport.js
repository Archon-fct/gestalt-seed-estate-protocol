// Archon Soulings — Constellation Passport v0.1
// Local/session-only prototype. No scores, streaks, ranking, or server upload.
const KEY='archonPassport.v1';
const allowed=['entered-living-field','integrated-aura','discovered-tharavel','checked-provenance','entered-inner-sanctum','explored-gestalt-relationship','entered-convergence','entered-journal'];
export function getPassport(){try{return [...new Set(JSON.parse(sessionStorage.getItem(KEY)||'[]'))].filter(x=>allowed.includes(x))}catch{return[]}}
export function mark(id){const p=getPassport();if(allowed.includes(id)&&!p.includes(id)){p.push(id);sessionStorage.setItem(KEY,JSON.stringify(p));window.dispatchEvent(new CustomEvent('archon:passport',{detail:{passport:p}}))}return p}
export function clearPassport(){sessionStorage.removeItem(KEY)}
export const labels={
 'entered-living-field':'Entered the Living Field',
 'integrated-aura':'Completed Sense → Integrate',
 'discovered-tharavel':'Discovered Tharavel',
 'checked-provenance':'Asked where a form came from',
 'entered-inner-sanctum':'Entered the Inner Sanctum',
 'explored-gestalt-relationship':'Explored a Gestalt relationship',
 'entered-convergence':'Entered the Convergence',
 'entered-journal':'Entered the Astral Archive'
};
