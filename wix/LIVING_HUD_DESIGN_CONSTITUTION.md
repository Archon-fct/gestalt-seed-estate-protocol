# Living HUD Design Constitution — Visual Baseline v1.0

Status: PROPOSED, owner approval required. Supplements, never supersedes, `wix/LIVING_NEXUS_CONTINUATION.md` and `wix/LIVING_NEXUS_PREVIEW_DEPLOYMENT.md`.

## Binding authority
1. Preserve tested architecture and visual authority together. No redesign by default.
2. Primary visual references: `22C3AFC1-AA61-4829-98F1-C5CBC2E938AE.jpeg` (immersive constellation), `6FC5F009-4510-450D-851C-92D1D791CA35.jpeg` (organic filament behavior). Secondary operational reference: `0B966560-630D-459D-9E19-AC3A79511A42.jpeg` (journey interactions). These are owner-supplied Library references, not yet committed binary fixtures. Their exact bytes must be captured in an approved fixture process before pixel regression tests can claim baseline coverage.
3. Image concepts are NOT deployment artifacts, functional proof, or permission to replace the existing HUD.

## Immutable visual invariants
- Central luminous NEXUS / Meeting Field, surrounded by six embedded, visually connected pocket worlds: Aura Dynamics, Aureglossa, Sessions, Workshops, Gestalt, Journal / Stories.
- One continuous auric field: translucent membranes, irregular luminous filaments, crossing currents, spatial depth, soft orbital relationships. Worlds must not look like independent cards.
- Dark restrained palette: pearl, gold, teal, indigo, violet. Light is concentrated, not a uniformly bright backdrop.
- THARAVEL ~ KOSMATHRA, exact canonical inscription.
- Living Thread appears as integrated journey memory, not a dominant conventional dashboard.
- Navigation, Search, Guide Me, Stillness, Atmosphere/Silence remain subordinate to the living environment.
- iPad and mobile retain a recognizable constellation; no generic stacked-card replacement.

## Required functional invariants
All routes and behaviors named in the continuation contract remain operational, including crossing/return, Field Journal, provenance, relationships, clearable journey, accessible focus, opt-in audio, immediate Silence, reduced motion and privacy/Silver isolation.

## Adaptable implementation details
Responsive node spacing, accessible labels, typography sizes, visual shader implementation, performance budgets and secondary panel arrangement may change, but cannot violate immutable invariants.

## Change protocol
- Before each change, state which invariant(s) it touches.
- Changes to immutable characteristics require explicit owner approval; functional improvements do not implicitly authorize visual redesign.
- Keep source and target screenshots at ~390px, ~820px, ~1280px, with reference identifiers, build SHA, device/browser and capture date.
- Run interaction/integration checks and visual checks independently. Both must pass; never weaken tests to make them green.
- Any image-only concept or fallback is labeled as such, never called deployed or release-ready.

## Visual acceptance checklist
- [ ] Central Nexus dominates composition without obscuring world access
- [ ] Six distinct destinations visibly connect to Nexus
- [ ] Filaments/membranes create continuous living geometry rather than straight-line diagramming
- [ ] No card grid, ordinary landing page, dominant sidebar, or fantasy landscape substitution
- [ ] Living Thread integrated and usable, with Save and Dissolve reachable
- [ ] Stillness/reduced-motion preserves legibility and navigation
- [ ] Guide Me/Search overlays prevent underlying pointer interception
- [ ] No horizontal overflow; touch targets >=44px at mobile and iPad sizes
- [ ] No Silver/private information in public bundle
- [ ] Real iPad Safari owner acceptance before any public promotion

## Release gate
A build is BLOCKED if functional tests pass but visual acceptance fails, or vice versa. Keep all work on isolated preview/PR branches until owner review. No public homepage, primary navigation or contribution-form changes under this constitution.
