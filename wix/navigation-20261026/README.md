# Top navigation, bottom HUD, welcome motion — 2026-10-26

Status: applied to the public Archon Soulings site on 2026-10-27 UTC (October 26 in America/Denver).

## Owner request

Debbie's feedback, relayed by the owner: put the HUD at the very bottom, make the rest of navigation straightforward at the top, fix the apparently static welcome artwork, and remove its duplicate from Explore. The owner further specified that the navigation menu should be laid out at the top. This is authorization for this bounded navigation/layout change; it does not promote the separate cinematic-flow candidate or claim owner visual approval of a new Living Nexus runtime.

## Result

- Six primary text links always visible at the top: Home, Sessions, Aura Dynamics, About Drew, Journal, Shop. They use one row on tablet and two rows on phones; desktop fits alongside the brand and booking button.
- A ResizeObserver measures the header and keeps page content below it. Links have 44px minimum targets and keyboard focus states.
- More provides supplementary pages and comfort controls, without duplicated welcome canvas artwork.
- Existing Living Nexus section follows the existing footer in both DOM and flex order. The current hosted visual12 iframe, origins, route guards, world routing, and adaptive controls are preserved.
- Original homepage copy is shown above the field; the duplicate home orbit is hidden.
- Welcome rendering retains the existing auric contours and colors, but deforms contours with phase so motion is visible. Existing Stillness/reduced-motion lifecycle continues to control it.

## Wix receipt

Site: `f7d5451f-9488-4d3f-bbba-96f6f5279118`

| Source | Embed ID | Revision |
| --- | --- | --- |
| navigation.html | 80484ee9-ac8e-42c0-8ccc-0d9f7872ee56 | 5, enabled |
| production-adapter.html | c66f62db-5a8f-4e1a-85b7-72adda503557 | 10, enabled |
| arrival.html | 50aeb4c6-b59f-4dd7-a790-2d674d7e2b5a | 11, enabled |

The new embed is active without a query parameter. The optional viewport review harness is gated behind `navigationReview=20261026&navigationViewport=390`, `820`, or `1280`. It does nothing on normal visits.

## Verification

- `node wix/navigation-20261026/check.cjs`: syntax, 15,000-character embed limits, changing contour geometry, stable paused phase, deterministic phase return, finite coordinates pass.
- `git diff --check`: pass.
- Live desktop Chrome at 1363px: all six direct links, header ends at 86px and page starts at 86px; document width and scroll width both 1348px. HUD is the footer's next sibling, flex order 30. Menu has zero canvases.
- 390px review iframe: client/scroll width 375/375px, header/content boundary 168/168px, six links all 44px tall. Single-column More menu reviewed; Sessions route successfully opens existing sessions page.
- 820px review iframe: client/scroll width 805/805px, header/content boundary 128.4/129px, six visible navigation links.
- Welcome replay and Stillness controls respond; rendered contours visually change between frames. HUD expansion and exit remain functional; iframe URL remains visual12.
- These are browser viewport checks, not actual-device Safari testing. No frame-rate benchmark or completed checkout transaction was performed. Existing physical iPad Safari acceptance requirements for the separate Living Nexus implementation remain unresolved; this change does not label that implementation visually approved.

## Rollback

Disable only the new navigation embed and reload: its root class and welcome renderer disappear, the adapter uses its original placement, and arrival uses its original local renderer. For an exact source rollback, restore the two files in baseline/ to their corresponding embed IDs using current revision guards. Do not use stale revision numbers. No private NOX modules or business records were changed.

Source snapshots were taken from live Wix embeds, rather than replacing production with an older repository candidate. Base repository checkout: `67ea6c3344b7808aba0abba99cb5e65072edaea8`.

## Source SHA-256

- `navigation.html`: `02c900fa9f43c5e124c53408f580bfe376c05eeb7e6e91914b3de0e7b9cefda2`
- `production-adapter.html`: `eff2a1a78ecb9cb814748b17227f1c6d7cd3fbd5a375623ee247c12f53fbbcfc`
- `arrival.html`: `22d2dda3dcb52c3b6a054fee0403723599b85183dc946c60d26fd8cc1848d64a`
