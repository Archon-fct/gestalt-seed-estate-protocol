# Archon Soulings × Silver — Living Field Bridge v0.1

Status: PROVISIONAL architecture. No autonomous actions, client-data migration, browser control, microphone capture, model-provider connection, or financial authority are granted by this document.

## Purpose

Make the Archon Soulings living HUD the human-facing constellation and Silver the private, owner-controlled intelligence layer behind it. The same spatial grammar can support Sessions, Aura Dynamics, Soulings, Journal/Stories, Business, Aureglossa, and Gestalt without collapsing their distinct purposes.

## Interaction model

The Archon Soulings Nexus is the stable center. Each destination opens as a pocket dimension. Entering a dimension carries a small luminous "thread" from the Nexus; leaving collapses the dimension back into a sphere and returns the thread to the Nexus.

Silver appears as a subtle companion presence rather than a conventional chatbot panel. It may surface contextual prompts, project continuity, checklists, and reviewed suggestions. It does not impersonate a client, diagnose a person, or silently record a session.

## Silver access boundary — owner authority

Silver is NOT a public Archon Soulings feature.

- Default state for every visitor is `silverAccess: false`.
- Only Kaluthra / the owner and people the owner explicitly authorizes may enter Silver.
- Being a site visitor, customer, client, member, contributor, collaborator, Gestalt participant, or holder of any public role does not imply Silver access.
- Public HUD code must not contain Silver's private interface, private data, client notes, credentials, prompts, project state, or a security-by-obscurity "hidden link".
- Authorization must be enforced server-side or by an equivalent trusted identity/authorization layer. A client-side flag, URL parameter, localStorage value, visual glyph, or knowledge of a route is never sufficient authorization.
- The public interface may omit Silver entirely. An authenticated authorized user may receive a subtle private threshold after authorization succeeds.
- Authorization should be deny-by-default, individually attributable, revocable, and auditable.
- Delegated users receive only the scopes the owner grants. They do not gain authority to authorize additional users unless the owner explicitly grants that separate capability.
- Removing a person's authority should invalidate future Silver access; sessions/tokens should have bounded lifetimes rather than permanent bearer access.
- No public project edge or Gestalt relationship grants permission to cross into Silver's owner-private or client-sensitive data zones.

Suggested role model:

```json
{
  "principal": "authenticated-user-id",
  "silverAccess": true,
  "role": "delegate",
  "scopes": [
    "project.read",
    "suggestions.read"
  ],
  "grantedBy": "owner",
  "revocable": true
}
```

The owner role may manage delegates. A delegate has only explicitly listed scopes.

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

Every dimension may expose a Silver context ribbon ONLY after trusted authorization confirms Silver access:
- Where am I?
- What am I working on?
- What is the next bounded action?
- What source/canon governs this?
- What is unfinished or awaiting human review?

Public visitors receive no Silver context payload.

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

Silver should maintain a private project graph whose nodes can include:
- Archon Soulings
- Aura Dynamics
- Aureglossa
- Gestalt Seed / Soul & Stone
- Silver
- Workshops / Ireland
- Podcast / Journal
- Business operations

A public constellation may show approved public relationships without Silver-private metadata. Silver itself should not appear as an accessible public node.

Edges are explicit relationships such as USES_CANON, SUPPORTS, PUBLISHES_TO, DEPENDS_ON, or NEEDS_REVIEW. A visual edge is not permission for data access or action.

## Data zones

### Public
Published Archon Soulings material, public Gestalt records, approved public Aureglossa material.

### Owner-private
Silver, project notes, drafts, task state, private Studio Knowledge, business planning. Access requires owner authorization.

### Client-sensitive
Consent-scoped client notes and session material. Keep separate from public/project corpora and do not train a model on it. Silver access alone does not automatically grant every delegate access to client-sensitive material; that requires a separate explicit scope.

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
- sharing private material;
- granting, changing, or revoking Silver delegate authority.

Edits invalidate stale approvals. Duplicate or stale drafts should be rejected rather than silently overwritten.

## UI state contract

Public HUD state contains no Silver capability or private payload:

```json
{
  "dimension": "aura-dynamics",
  "mode": "living",
  "continuity": {
    "sourceStatus": "canonical-or-reviewed"
  }
}
```

After trusted authorization, an owner/delegate-specific private response may add:

```json
{
  "silver": {
    "authorized": true,
    "role": "owner",
    "scopes": ["project.read", "suggestions.read", "suggestions.review"],
    "presence": "available",
    "lens": "teacher-coach",
    "requiresReview": true
  }
}
```

Never place secrets, client text, private keys, auth tokens, raw financial data, or an authorization allowlist in public HUD state.

## Motion language

- Nexus -> dimension: selected sphere dilates, filaments converge, camera crosses the membrane, local geometry blossoms.
- Dimension -> Nexus: local geometry folds into a luminous seed, camera withdraws, seed rejoins its orbit.
- Authorized Silver threshold: after authorization only, a quiet platinum/silver filament resolves from the Nexus. It is absent for everyone else.
- Silver prompt: one filament brightens and resolves into a short suggestion; it should not interrupt the whole scene.
- Human approval: a small gold seal closes; this is UI feedback only, not a cryptographic signature.
- Warning/uncertainty: motion slows and the relevant thread becomes diffuse rather than using alarming effects.

Respect reduced-motion preferences and provide a Stillness control.

## Next implementation slice

Build a local/private prototype before connecting live services:

1. Add a persistent Nexus shell shared by all pocket dimensions.
2. Implement the transition state machine and reduced-motion fallback.
3. Build two render paths: public Nexus and authenticated authorized Nexus.
4. Add the private Silver context ribbon using mock/local project state only.
5. Add a Project Constellation view with public-safe metadata; reveal Silver-private layers only after authorization.
6. Add a private Authority chamber where the owner can eventually view delegates, scopes, grant provenance, and revocation state.
7. Add review-gate UI components for suggestions.
8. Keep microphone, browser control, cloud sync, model inference, financial actions, and live delegate management disconnected until their individual permission, security, and test paths are implemented.

## Definition of done for this slice

- Home plus at least Aura Dynamics and Sessions transition without full-page visual discontinuity.
- Back navigation always returns to the same Nexus state.
- Stillness/reduced-motion works.
- An unauthenticated visitor cannot discover Silver through rendered navigation or receive Silver-private state.
- Mock unauthorized requests resolve to deny.
- Authorized mock owner state reveals the private Silver threshold.
- Delegate scopes can be represented without implying implementation.
- Silver suggestions are visibly advisory and cannot self-save.
- No client/private content leaks into public state.
- No action is described as live unless tested in the target environment.
