# Living Nexus — Owner-Supplied Visual Reference Extension (2026-10-08)

Status: **OWNER-SUPPLIED ART DIRECTION; IMPLEMENTATION PROVISIONAL; VISUAL ACCEPTANCE PENDING**.

This is a continuity note, **not a replacement** for `wix/LIVING_NEXUS_CONTINUATION.md`,
`wix/LIVING_HUD_BASE_SPECIFICATION.md`, or `wix/VISUAL_TOUCHSTONE_CHECKLIST.md`.
Preserve the six-world operating environment, its interaction engine, privacy boundaries,
and all established functional tests.

## New images provided by the owner

The source images are in the owner's private ChatGPT Library as
`IMG_2740.jpeg` through `IMG_2744.jpeg`. Do **not** commit the originals to
this public repository or use them as production assets without an affirmative
license/rights decision. Interpret them as art direction, not as evidence of
functional code, psychological inference, literal characters, or released canon.

| File | Observed visual vocabulary | Intended translation |
|---|---|---|
| `IMG_2740.jpeg` | Hooded cosmic figure, held multichromatic nucleus, diffuse teal atmosphere | Central luminous intelligence: mysterious and intimate, contained within a quiet dimensional field. No literal hooded character required |
| `IMG_2741.jpeg` | Fluid iridescent ribbons, dramatic chromatic folds, angular fragments | True prismatic thickness: wide transparent light-rivers with internal caustics and occasional small facets, not mechanical wireframes |
| `IMG_2742.jpeg` | Violet luminous markings moving along a hand | Hierarchically branching energy nerves and vein geometry. **No reproduction or invention of rune text**; canonical Aureglossa rule is unchanged |
| `IMG_2743.jpeg` | Eyes and crimson-black irregular tissue | Rare subtle watchful apertures and shadow depth, not an oppressive field of red eyes or a surveillance metaphor |
| `IMG_2744.jpeg` | Anatomical heart, multiple optical motifs, spectrum from amber to violet | Asymmetric, breathing multi-layered core. Warm-to-cool living tissue and responsive visual focus, not a literal anatomical asset |

## Non-regression constraints

- The central NEXUS / Meeting Field retains hierarchy and legible labeling.
- Six worlds remain spatially connected. Source art does not authorize a seventh world,
  conventional card stack, fantasy landscape, or scene-only artwork.
- Prismatic accents remain subordinate to void / gold / teal / indigo / pearl / violet.
  Crimson stays rare and non-default; do not turn the public site into a horror collage.
- All organic ribbons, cores, and optical apertures are `aria-hidden`,
  `pointer-events: none`, and behind the genuine interactive controls.
- Guide Me, Search, Living Thread, provenance, Field Journal, Save, Dissolve,
  Stillness, reduced-motion support, Atmosphere / immediate Silence, and pocket
  dimension returns must keep working.
- No imported reference images, fabricated Aureglossa writing, Silver content,
  secrets, private notes, client material, or unsolicited audio in public bundles.
- No animation is required to understand what each world does. The field must
  remain intelligible under Stillness and `prefers-reduced-motion: reduce`.
- Mobile must preserve actual spatial relations; avoid ordinary stacked cards.

## Implementation history

- Run #317 / organic-depth v0.3: functional browser tests passed, but owner described
  the result as only "closer". Thin outlines and schematic rings remained.
- The next source implementation in `hud/prototype/organic-depth.{js,css}`
  translates the five images into noninteractive volumetric spectral rivers,
  asymmetrical core forms, chromatic folds, and quiet lens-like apertures.
- `hud/prototype/test-constellation.mjs` includes structural / interaction guards
  that **cannot** prove visual fidelity by themselves.
- **Owner visual approval is not recorded.** Compare actual run screenshots at
  390px, 820px and 1280px, then test physical iPad Safari before release.

## Visual-review rubric for next captures

1. **Organic depth:** can the visitor see translucent volumes, fluid color and
   internal folds rather than primarily concentric rings?
2. **Living centrality:** does the Nexus feel like held, responsive light
   without sacrificing its title and legible six-world structure?
3. **Responsive recognition:** are the worlds still navigable at phone size
   without losing relationship hierarchy?
4. **Behavior:** do hover/focus/visit/return/guidance visibly affect the world
   while accessible labels, Silence and Dissolve remain functional?
5. **Restraint:** is the environment beautiful, slightly eldritch, and usable,
   rather than a static fantasy composition or dazzling unreadable spectacle?

Use the user's latest qualitative feedback as visual acceptance input.
**Green CI is not owner approval or proof of physical iPad performance.**

THARAVEL ~ KOSMATHRA ~ ✦
