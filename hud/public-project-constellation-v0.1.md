# Public Project Constellation — Prototype v0.1

A public-safe, dependency-free prototype for the Archon Soulings / Gestalt discovery layer.

## Intent

This prototype turns the project map into a navigable constellation. It is deliberately public-only. Silver is not a public node, is not referenced by the client state, and no private project or client data belongs in this surface.

## Visitor paths

Every node should answer three questions:

1. What is this?
2. Why might I care?
3. What can I do next?

The four public actions are **Explore**, **Learn**, **Contribute**, and **Collaborate**.

## Nodes

| Node | Purpose | Primary next action |
| --- | --- | --- |
| Archon Soulings | Public nexus for services, teaching, writing and the wider ecosystem | Explore |
| Aura Dynamics | Training around awareness, mind/body attention and the user's esoteric framework | Learn |
| Aureglossa | Constructed ritual/art language and canonical corpus | Learn / Contribute |
| Gestalt Seed / Soul & Stone | Contribution, provenance and collaborative creation project | Contribute |
| Journal / Stories | Field notes, podcast/writing and explanatory material | Explore |
| Workshops | Public teaching, exercises and collaboration opportunities | Collaborate |

Only approved public relationships should be rendered.

## Interaction

- The central Nexus remains stable.
- Nodes orbit slowly in Living mode.
- Selecting a node draws its filament toward the center and opens a detail veil.
- "Enter" may route to the approved public destination.
- Back closes the veil without losing constellation state.
- Stillness freezes decorative movement.
- `prefers-reduced-motion` automatically disables orbit/zoom effects.
- Keyboard: Tab reaches every node/action; Enter/Space selects; Escape closes detail.
- Touch targets: minimum 44px.

## Public state example

```json
{
  "version": "0.1",
  "mode": "living",
  "nodes": [
    {
      "id": "archon-soulings",
      "label": "Archon Soulings",
      "kind": "nexus",
      "summary": "The public threshold into the wider body of work.",
      "actions": ["explore"]
    },
    {
      "id": "aura-dynamics",
      "label": "Aura Dynamics",
      "kind": "learning",
      "summary": "Training and experiential exercises.",
      "actions": ["learn", "collaborate"]
    },
    {
      "id": "aureglossa",
      "label": "Aureglossa",
      "kind": "language",
      "summary": "A constructed language and living creative corpus.",
      "actions": ["learn", "contribute"]
    },
    {
      "id": "gestalt-seed",
      "label": "Gestalt Seed · Soul & Stone",
      "kind": "contribution",
      "summary": "A provenance-aware collaborative creation project.",
      "actions": ["explore", "contribute", "collaborate"]
    },
    {
      "id": "journal",
      "label": "Journal · Stories",
      "kind": "publication",
      "summary": "Field notes, stories and public reflections.",
      "actions": ["explore", "learn"]
    },
    {
      "id": "workshops",
      "label": "Workshops",
      "kind": "teaching",
      "summary": "Live learning and collaboration opportunities.",
      "actions": ["learn", "collaborate"]
    }
  ],
  "edges": [
    ["archon-soulings", "aura-dynamics", "TEACHES"],
    ["archon-soulings", "aureglossa", "USES_CANON"],
    ["archon-soulings", "gestalt-seed", "CONNECTS_TO"],
    ["archon-soulings", "journal", "PUBLISHES"],
    ["aura-dynamics", "workshops", "SUPPORTS"],
    ["aureglossa", "gestalt-seed", "USES_CANON"],
    ["journal", "workshops", "SUPPORTS"]
  ]
}
```

## Visual grammar

Background: deep black-violet space with extremely restrained stars/grain.

Nexus: translucent luminous sphere with gold/platinum geometric rings, teal-violet living filaments and a central Archon eye/seed motif.

Nodes: small pocket worlds rather than cards. Each has a distinct atmospheric behavior:
- Aura Dynamics — layered breathing field contours.
- Aureglossa — rotating canonical glyph ring / manuscript-light behavior.
- Gestalt — stone, lattice and provenance threads.
- Journal — floating illuminated fragments.
- Workshops — converging rings suggesting gathering/meeting.
- Archon Soulings — the stable central living field.

Do not fabricate Aureglossa glyphs. If canonical glyph assets are not loaded, use plain labels or abstract non-linguistic geometry.

## Pocket-dimension transition

State machine:

```
CONSTELLATION
  -> FOCUSING
  -> CROSSING_THRESHOLD
  -> DIMENSION
  -> COLLAPSING_TO_SEED
  -> RETURNING
  -> CONSTELLATION
```

Normal motion:
- Selected node eases toward the center.
- Other nodes recede and blur slightly.
- Its outer membrane expands beyond viewport.
- Filaments stream inward.
- Local dimension geometry resolves after crossing.
- Returning reverses the metaphor: the dimension folds into a luminous seed and rejoins orbit.

Reduced motion:
- No simulated camera travel.
- Cross-fade between constellation and dimension.
- Preserve focus and announce the destination to assistive technology.

## Contributor conversion

The Gestalt node should make contribution understandable before asking for anything:

**Explore** — see what the project is and what has already been built.

**Learn** — read the governing ideas, provenance model and public Aureglossa/Gestalt material.

**Contribute** — one bounded contribution at a time. State what happens to submitted work and preserve attribution/rights boundaries.

**Collaborate** — propose a workshop, research/design/development collaboration, or pilot.

Avoid vague "join the movement" copy. Give visitors a concrete next action.

## Safety / privacy boundary

This public prototype MUST NOT contain:
- Silver routes, labels, prompts, state or metadata;
- authorization allowlists;
- credentials/tokens;
- client information;
- private notes or drafts;
- raw financial data;
- private project graph edges.

A public visual relationship never grants data access or authority.

## Pilot instrumentation

Before analytics is connected, use a simple manual pilot sheet. For each of the first three testers record:
- role: creator / AI-assisted contributor / developer;
- first node selected;
- whether they could explain the project in their own words;
- whether they found a next action without help;
- contribution attempted/completed;
- one confusing point;
- one trust concern;
- one reason they would return.

Do not add third-party tracking merely to satisfy this prototype.

## Build checklist

- [ ] Implement constellation renderer.
- [ ] Implement detail veil.
- [ ] Implement transition state machine.
- [ ] Add Stillness and reduced-motion behavior.
- [ ] Add keyboard/focus handling.
- [ ] Validate public graph against `hud/public-graph.schema.json`.
- [ ] Verify no Silver/private strings or state are shipped.
- [ ] Test at 390px, 820px and 1280px.
- [ ] Run one normal-browser contribution persistence test before broad promotion.
- [ ] Invite the three-person pilot only after persistence is verified.
