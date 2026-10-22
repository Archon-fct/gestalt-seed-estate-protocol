# Inner Sanctum release review — October 21, 2026

**Decision: HOLD. No merge, Wix publication, pricing change, or production-source replacement.**

## Baseline discrepancy — release blocker

PR #14 was inspected at `5bed42f1c758e0d7492ba45673f4a31b9edac3b5`, open, draft, no recorded reviews. Its base `feature/public-project-constellation` still contains Packages 1.0.0. The exact current public page instead serves **inner-sanctum-packages-1.2.0** with a two-column introduction, SVG auric sculpture, rectangular pathways, different copy, typography, and forced-colors handling.

Public page: https://www.archonsoulings.com/pricing-plans/plans-pricing

Served 1.2.0 script SHA-256: `066e24ef5dc372332b68361c4490533c13e7ebde91168090cf5a1386b9ab861b`.

This discrepancy was established from the actual DOM version and complete executable script element, not from the historical dashboard. The source of the newer deployment and its owner acceptance have not been established. Do not assume a higher version number is aesthetic approval. Applying this PR directly could remove newer production work. Resolve the desired baseline before preparing a hosted candidate.

## Safe corrections in this isolated branch

Candidate version: `inner-sanctum-packages-1.1.1-review`.

1. Compare freshly read plan metadata with the displayed snapshot before delegating checkout. If amount, currency, recurrence, tagline, benefits or matched names have changed, reveal the native selector without clicking a purchase control. The user can review the current native terms.
2. Display the native recurrence text rather than translating every nonempty recurrence into `/ month`. The current monthly plans still retain their actual monthly terms; an annual plan will not be misrepresented as monthly.

No plan records, prices, IDs, accounts, subscriptions, payment handlers, or visual CSS were modified. The original React-bound `plan.button.click()` remains the only checkout delegation. This snapshot guard covers displayed fields; full plan terms remain authoritative in Wix checkout.

Corrected source SHA-256: `4bb48669e9b19de75b1175b89140f0b53f52f2d38eabe21a8ad28f5d83b1a07e`.

## Executed test evidence

### Source and DOM simulation — candidate, not a browser render

Node 24.19.0; jsdom 30.1.3; exact application script evaluated unmodified in a simulated document at a synthetic origin. The fixture uses the public Wix data-hook contract and observed plan names/amounts, with mock native handlers and controlled timers/media events. It does not contact Wix.

- Original PR: **17 passed, 3 failed**. Failures reproduce changed-price handoff, changed-recurrence handoff, and forced-monthly labeling.
- Corrected candidate: **20 passed, 0 failed**.
- JavaScript syntax check: PASS.
- Cases cover all five mappings, single native delegation/double-click suppression, fresh native-node replacement, disabled/missing/duplicate plan fallback, stale displayed data, native recurrence, standard-selector persistence, exact-route/public-scope gating, Services/checkout cleanup and reentry, duplicate initialization, Stillness/media state, section focus, timeout without repeated clicks, and escaped Wix text.

Reproduce with `tests/inner-sanctum-review.cjs`; install the pinned dependency in `tests/sanctum-review-runtime/package.json`, then set `JSDOM_PATH` to that installation's `node_modules/jsdom` path. This is deliberately separate from production dependencies. Set `SANCTUM_SOURCE` to another source path for comparison. **These results do not establish layout, visual fidelity, CSS animation freezing, genuine keyboard input, Safari, or live payment integration.**

### Actual remote Chrome — current production 1.2.0 only

Observed viewport: 1363 × 936 CSS pixels. Document scroll width: 1348px; no horizontal overflow at that observed size. This is neither a 1280px test nor physical iPad/iPhone Safari.

| Check | Actual result |
|---|---|
| Five enhanced plans and five original Wix buttons | PASS; expected names and displayed amounts |
| New buttons, links and disclosure controls | PASS; measured minimum height 44px at observed desktop size |
| Stillness | PASS for control state and computed auric animation-play-state `paused`; no frame-timing measurement |
| Familiar-path keyboard Enter | PASS; focus moved to Familiar Plans heading |
| Native selector fallback | PASS; enhancement removed; native container displayed; all five buttons enabled; heading focused |
| Services isolation | PASS; no Sanctum host, integration stylesheet or active class; existing Services presentation and 30/60-minute links visible |
| Services → Packages return | PASS; 1.2.0 remounted with five controls |
| Navigation keyboard Enter / Escape | PASS after settlement; menu opened, Escape returned focus to Open navigation |
| Checkout route cleanup | PASS in all five successful captures; Sanctum host absent and active class cleared |

An initial menu click immediately after return produced no visible menu; keyboard activation after settlement worked. One Familiar #1 handoff immediately after navigation did not produce an observed checkout and later showed Packages again. A single controlled retry after page settlement succeeded. Cause is **unverified**; retain a rapid-navigation/hydration reliability check in the release gate. Do not erase this observation by reporting a flawless run.

### Actual live checkout summaries — no purchase

| Native plan | Observed checkout amount | Recurrence / duration shown |
|---|---|---|
| Package of 10 | $1,800.00 | Duration: Until canceled; no monthly recurrence shown |
| Package of 20 | $3,500.00 | Duration: Until canceled; no monthly recurrence shown |
| Familiar #1 | $49.99 | per month; Auto-renew until canceled; passed on controlled retry |
| Familiar #2 | $99.00 | per month; Auto-renew until canceled |
| Speciality Familiar | $199.00 | per month; Auto-renew until canceled |

The existing signed-in browser session was reused. No customer fields were filled, Save & Continue was not activated, no payment was submitted, and no purchase was made. Opening checkout can create normal checkout-session records. Guest checkout, payment processing, entitlement creation, renewals, cancellation, and all corrected-candidate checkout journeys remain unverified. Session-bound checkout URLs and account details are deliberately excluded from this record.

Browser logs included an existing analytics `this.log is not a function` error and a Wix `ecom-platform-providers` resolution warning; browser-extension errors were separate. Their relationship to the intermittent handoff is not established. No zero-console-error claim is made.

## Visual comparison evidence

The three project-authoritative still-image references were recovered and visually inspected: organic energy (`6FC5F009…`), six-world constellation (`22C3AFC1…`), and operational HUD (`0B966560…`). Raw reference media are not copied into this public repository. A separate owner review artifact includes these reference images and the actual cropped public desktop capture, without account or payment UI.

| Dimension | Current production 1.2.0, observed | PR #14 / corrected candidate |
|---|---|---|
| Palette / readable typography | Dark indigo, warm gold, muted violet/teal align broadly | Colors present in source; rendered comparison NOT VERIFIED |
| Organic layered material | Fine-strand sculpture has depth locally, but is a detached hero ornament | Irregular membranes and glows present in source; insufficient evidence of rendered depth |
| Connected spatial field | The visible hero and rectangular pathway cards do not show the reference's connected filament field | CSS has one connecting arc and arched cards; no equivalent procedural filaments or Canvas layer |
| Layout hierarchy | Conventional two-column hero and three-card row; weaker living-field continuity than reference | Three pathways remain intentional Packages functionality; do not replace the Nexus or add six worlds to this commercial page |
| Motion | Auric translation / Stillness state observed; kinetic fidelity NOT VERIFIED | Low-frequency CSS breathing only; actual motion NOT VERIFIED |
| Phone/tablet composition | NOT VERIFIED this run | NOT VERIFIED this run |

The calmer Sessions dimension need not duplicate the Nexus homepage, but its materials should remain recognizably related. Palette matching alone does not establish fidelity. The separate October 20 Canvas study is not an exact render of this CSS-only candidate and is not counted as candidate evidence.

## Remaining release gates

1. Confirm whether the next candidate should preserve current 1.2.0 layout/content or remain a separate 1.1 alternative. Recover the newer source and approval record before any integration; no silent downgrade.
2. Load the exact selected source on an isolated Wix preview that retains real native controls. Record served-source digest. No hosted URL for the exact PR source was present in the inspected PR/dashboard evidence.
3. Capture real 390/820/1280 layouts, full Tab/Shift-Tab and visible-focus coverage, Stillness frame freezing, OS reduced-motion changes, route cleanup and rapid navigation/hydration, refresh and native fallback.
4. Repeat all five native checkout summaries using the corrected candidate, without payment; include guest behavior. Resolve console failures attributable to the integration and the intermittent first handoff.
5. Physical iPhone/iPad Safari, performance and owner visual acceptance remain required. Bind acceptance to the exact build digest.
6. Re-read the live Wix embed inventory/revision and save an exact production rollback export before any approved promotion.

Tool limits this run: remote browser supplied actual live-site interaction but no supported viewport/media emulation or candidate injection; local-file preview was blocked by browser policy. No workaround was attempted. Local Chromium installation failed, so it contributes no browser evidence. Wix metadata bootstrap timed out; current embed revision was not revalidated. DOM simulation continued independently.

## Rollback and protected state

This review changes only the isolated PR branch. Revert this review's commit to recover original PR head `5bed42f1c758e0d7492ba45673f4a31b9edac3b5`; the original source is also retained in the private working evidence. No production rollback is needed because this review did not change Wix.

Historical deployment record identifies Packages embed `fe77e3aa-e81c-4cb0-a4d2-5db54bed9fe8` on site `f7d5451f-9488-4d3f-bbba-96f6f5279118`. **The October 12 revision/hash is not the current production rollback baseline.** For a later approved release, first read current identity/revision and export the served 1.2.0 source and its asset dependencies. Restore that exact current baseline if needed. A native-selector fallback may be obtained by disabling only the verified Packages embed, preserving the independent selector-color and public theme embeds. No plan-data migration is involved.

PR: https://github.com/Archon-fct/gestalt-seed-estate-protocol/pull/14

THARAVEL ~ KOSMATHRA ~ ✦
