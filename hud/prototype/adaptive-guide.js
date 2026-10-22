// Archon Soulings — adaptive Guide Me v0.1
// Reorganizes recommendations only from explicit visitor choices.
export const intents={
 learn:['aura','aureglossa','journal'],
 experience:['aura','services','workshops'],
 work:['services','workshops'],
 create:['workshops','gestalt','aureglossa'],
 contribute:['gestalt','workshops']
};
export function recommend(intent,journey=[]){const base=intents[intent]||[];return [...base.filter(x=>!journey.includes(x)),...base.filter(x=>journey.includes(x))]}
export const prompts=[
 {id:'learn',label:'Learn something'},
 {id:'experience',label:'Experience something'},
 {id:'work',label:'Work with someone'},
 {id:'create',label:'Create something'},
 {id:'contribute',label:'Contribute something'}
];
