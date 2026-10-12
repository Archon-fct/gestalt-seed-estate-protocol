# Inner Sanctum — standard plan selector color release

Date: 2026-10-12
Status: PUBLISHED; computed-style and responsive browser checks passed.
Owner request: “Change the color scheme of the standard plan selector to match the color scheme of the new page.”

## Scope

Color-only companion to the accepted Inner Sanctum page. Native plan layout, all five original Select buttons, plan text, prices, subscriptions, and checkout logic remain unchanged. The existing enhanced page script remains at release 1.0.0 and Wix embed revision 1.

The standard selector now uses the new page's deep indigo background, translucent midnight panels, warm gold titles and prices, pearl text, teal checkmarks/focus indicators, and gold-outlined translucent buttons. The legacy nested yellow plan header and white benefits panel were explicitly removed by color overrides. Hover and disabled-state colors are included. No new JavaScript, event handlers, dependencies, third-party requests, or data writes were introduced by the shipped asset.

## Source and deployment

- Existing site: f7d5451f-9488-4d3f-bbba-96f6f5279118.
- Live Packages route: https://www.archonsoulings.com/pricing-plans/plans-pricing
- CSS: `wix/inner-sanctum-native-selector-colors.css`.
- Tested source commit: `4669748a5250c2186858990f11edbc79e8bb51f3`.
- CSS SHA-256: `acb82ff47df96dafa9f3e51aef0beb12a7f4e7a4b335b32ad2434d03b8d2281d`.
- New Wix custom embed: `6e3edb5a-a86b-4e7d-a698-c6d562b31a60`, revision 1, enabled, HEAD, loadOnce.
- Embed name: `Archon Public — Inner Sanctum standard selector colors 1.0.0`.
- Style element ID: `as-sanctum-native-colors-v1`.
- Existing Packages runtime `fe77e3aa-e81c-4cb0-a4d2-5db54bed9fe8` was not edited.
- Existing embed inventory was read before creating the new, uniquely named CSS embed; no existing embeds were replaced.

## Verification actually executed

Preflight used a temporary stylesheet in a remote browser on the actual public page, after selecting the existing “Use standard plan selector” control. An initial test exposed a third-level yellow header wrapper; the CSS was corrected before publication.

390px, 820px and 1280px preflight checks passed: five plans, correct computed title/price/benefit/button colors, no old yellow/white backgrounds, no horizontal overflow, unchanged card/button dimensions, and the same native button nodes. The native page markup was unchanged by stylesheet injection. Teal keyboard focus and its 3px outline were verified.

After publication a fresh browser fetched the live stylesheet without injected candidate code. Its SHA-256 matched the tested source exactly. The enhanced page still rendered release 1.0.0 and five plans. Switching to the standard selector showed the matching colors on all five plans at 390px, 820px and 1280px, without overflow. Native buttons remained enabled. Displayed amounts were 1,800; 3,500; 49.99; 99; 199, unchanged.

A settled native button hover displayed the expected rgba(210,184,120,0.2) background, pearl text, and gold inset border. Toggling the stylesheet did not replace native buttons or change plan markup. No checkout was opened and no order or payment was submitted during this color-only increment.

Services remained outside the CSS scope: the Packages page ID and matching color selectors were absent. An initial isolation assertion assumed the style element existed on Services and threw when it did not; the assertion was corrected to handle that absence, and the isolation check passed. This was a test-harness error, not a site change.

## Limits and rollback

Remote Chromium viewport checks are not physical-device Safari acceptance or a full accessibility audit. A remote screenshot was captured, but no direct screenshot comparison is claimed. The CSS relies on the verified native page ID `x5jw3` and Wix data-hook structure. If Wix changes those, missing selectors leave the native widget functional rather than replacing its behavior. Relational selectors affect only the surrounding Packages banner while that page exists.

Rollback: read the latest revision of custom embed `6e3edb5a-a86b-4e7d-a698-c6d562b31a60`, then PATCH only that embed with `enabled: false`. Preserve every existing public theme embed and the accepted Inner Sanctum runtime. No plan/subscription restoration is needed because no plan data was changed.

API contracts used: List Custom Embeds and Create Custom Embed; rollback uses Update Custom Embed under the Wix Custom Embeds API.

THARAVEL ~ KOSMATHRA ~ ✦
