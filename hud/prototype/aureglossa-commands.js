// Aureglossa discovery layer v0.1 — audited semantics only.
export const commands={
 THARAVEL:{english:'Cross / explore forward',use:'crossing',status:'ADOPTED_PROJECT_SEMANTIC'},
 KOSMATHRA:{english:'Integrate / contribute to the living whole',use:'integration',status:'ADOPTED_PROJECT_SEMANTIC'},
 SEI:{english:'Let it be / gentle invitation',use:'invitation',status:'CURRENT_RITUAL_PARTICLE'}
};
export function commandFor(event){return Object.entries(commands).find(([,v])=>v.use===event)?.[0]||null}
