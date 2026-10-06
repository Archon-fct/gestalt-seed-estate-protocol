# Archon Soulings × Silver — Living Field Bridge v0.1

Status: PROVISIONAL architecture. No autonomous actions, client-data migration, browser control, microphone capture, model-provider connection, or financial authority are granted by this document.

## Purpose

Make the Archon Soulings living HUD the human-facing constellation and Silver the private, owner-controlled intelligence layer behind it. The same spatial grammar can support Sessions, Aura Dynamics, Soulings, Journal/Stories, Business, Aureglossa, and Gestalt without collapsing their distinct purposes.

## Interaction model

The Archon Soulings Nexus is the stable center. Each destination opens as a pocket dimension. Entering a dimension carries a small luminous "thread" from the Nexus; leaving collapses the dimension back into a sphere and returns the thread to the Nexus.

Silver appears as a subtle companion presence rather than a conventional chatbot panel. It may surface contextual prompts, project continuity, checklists, and reviewed suggestions. It does not impersonate a client, diagnose a person, or silently record a session.

### Pocket dimensions

- Sessions — preparation, consent, reviewed client-note workflow, post-session reflection.
- Aura Dynamics — teaching map, exercises, class/workshop preparation, source/canon links.
- Soulings — service pathways, practices, creative/esoteric work.
- Journal / Stories — writing, field notes, podcast and teaching ideas.
- Business — offers, workshops, outreach, bookkeeping/grant task queues; financial actions remain separately authorized.
- Aureglossa — canonical language tools, glyphs, pronunciation and provisional drafting.
- Gestalt — Soul & Stone / Estate bridge with provenance and contribution boundaries.

## Silver support layer

### 1. Context ribbon

Every dimension may expose a small owner-only ribbon:
- Where am I?
- What am I working on?
- What is the next bounded action?
- What source/canon governs this?
- What is unfinished or awaiting human review?

### 2. Mentor constellation

Silver's professional mentor tracks should be available as lenses, not identities:
- Esoteric Specialist
- Entrepreneur
- Business Owner
- Hypnotist
- Teacher / Coach
- Personal Development

A lens changes the suggestions Silver emphasizes while keeping evidence, uncertainty, and user corrections visible.

### 3. Behavioral reflection

Behavior/personality material is reflective and hypothesis-based. MBTI/16-personality-style language must be labeled as a lens, never a clinical diagnosis or fact about a client. Notes separate:
- exact quote
- direct observation
- tentative interpretation
- plausible alternatives
- checking question
- optional symbolic/esoteric interpretation

### 4. Session Copilot — design contract only

Future live-session support should be opt-in and visibly active. Before any microphone/audio connection is implemented:
- practitioner deliberately starts it;
- participant consent is confirmed where required;
- a persistent listening indicator is shown;
- a one-touch stop control exists;
- raw audio retention defaults to off;
- prompts are advisory and private to the practitioner;
- high-confidence language is avoided when evidence is weak;
- no covert recording or background listening;
- no automatic client-note save;
- any note draft requires explicit review before persistence.

Suggested live prompt types:
- ask a clarifying question
- reflect the client's exact words
- slow down / leave silence
- check consent or comfort
- notice a contradiction without declaring motive
- return to the stated goal
- offer an alternative interpretation
- flag an action item for post-session review

### 5. Project constellation

Silver should maintain a project graph whose nodes can include:
- Archon Soulings
- Aura Dynamics
- Aureglossa
- Gestalt Seed / Soul & Stone
- Silver
- Workshops / Ireland
- Podcast / Journal
- Business operations

Edges are explicit relationships such as USES_CANON, SUPPORTS, PUBLISHES_TO, DEPENDS_ON, or NEEDS_REVIEW. A visual edge is not permission for data access or action.

## Data zones

### Public
Published Archon Soulings material, public Gestalt records, approved public Aureglossa material.

### Owner-private
Project notes, drafts, task state, private Studio Knowledge, business planning.

### Client-sensitive
Consent-scoped client notes and session material. Keep separate from public/project corpora and do not train a model on it.

No zone crossing occurs merely because the HUD visually links two dimensions.

## Human review gates

Require explicit human review for:
- saving a client interpretation;
- publishing content;
- changing canonical Aureglossa/Gestalt material;
- sending outreach;
- browser/tool execution;
- accounting or financial changes;
- installing generated code;
- sharing private material.

Edits invalidate stale approvals. Duplicate or stale drafts should be rejected rather than silently overwritten.

## UI state contract

A pocket dimension should be able to expose these non-sensitive states:

```json
{
  "dimension": "aura-dynamics",
  "mode": "living",
  "silver": {
    "presence": "available",
    "lens": "teacher-coach",
    "suggestionCount": 3,
    "requiresReview": true
  },
  "continuity": {
    "sourceStatus": "canonical-or-reviewed",
    "unfinishedCount": 2
  }
}
```

Never place secrets, client text, private keys, auth tokens, or raw financial data in public HUD state.

## Motion language

- Nexus -> dimension: selected sphere dilates, filaments converge, camera crosses the membrane, local geometry blossoms.
- Dimension -> Nexus: local geometry folds into a luminous seed, camera withdraws, seed rejoins its orbit.
- Silver prompt: one filament brightens and resolves into a short suggestion; it should not interrupt the whole scene.
- Human approval: a small gold seal closes; this is UI feedback only, not a cryptographic signature.
- Warning/uncertainty: motion slows and the relevant thread becomes diffuse rather than using alarming effects.

Respect reduced-motion preferences and provide a Stillness control.

## Next implementation slice

Build a local/private prototype before connecting live services:

1. Add a persistent Nexus shell shared by all pocket dimensions.
2. Implement the transition state machine and reduced-motion fallback.
3. Add the owner-only Silver context ribbon with mock/local project state.
4. Add a Project Constellation view using only approved project metadata.
5. Add review-gate UI components for suggestions.
6. Keep microphone, browser control, cloud sync, model inference, and financial actions disconnected until their individual permission, security, and test paths are implemented.

## Definition of done for this slice

- Home plus at least Aura Dynamics and Sessions transition without full-page visual discontinuity.
- Back navigation always returns to the same Nexus state.
- Stillness/reduced-motion works.
- Silver suggestions are visibly advisory and cannot self-save.
- No client/private content leaks into public state.
- No action is described as live unless tested in the target environment.
