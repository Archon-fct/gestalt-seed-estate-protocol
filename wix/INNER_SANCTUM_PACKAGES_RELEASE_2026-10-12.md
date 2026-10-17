# Inner Sanctum Packages — main-domain release receipt

Release: `inner-sanctum-packages-1.0.0`
Date: 2026-10-12
Owner authorization: after reviewing the isolated Inner Sanctum preview, the owner requested: “Looks great. Publish it please.” This authorizes this Packages integration, not replacement of unrelated site pages.

## Implemented and deployed

- Primary Wix site: `f7d5451f-9488-4d3f-bbba-96f6f5279118` (existing Editor site).
- Live URL: https://www.archonsoulings.com/pricing-plans/plans-pricing
- New custom embed: `fe77e3aa-e81c-4cb0-a4d2-5db54bed9fe8`, revision `1`, enabled, BODY_END, loadOnce.
- Embed name: `Archon Public — Inner Sanctum Packages 1.0.0`.
- Source: `wix/inner-sanctum-packages-live.js` at commit `165e980608615842d867553847a6103b6985d939`.
- Script SHA-256: `2f55364d581ef2041185868037c2e89ec3151207a5d9005b9abc573baff66eed`.
- A fresh browser session retrieved the live main-domain page with no script injection. The served script matched this SHA-256 exactly, the DOM identified release 1.0.0, and all five plans rendered.

The first create request was rejected before mutation because the optional `www.archonsoulings.com` domain metadata did not match Wix's connected-domain record. The corrected request omitted this optional metadata, as the existing public embeds do. Runtime applicability remains restricted to the exact Packages pathname and the existing public-site state. No DNS, domain assignment, site creation, existing embed, or plan record was changed.

## Scope and behavior

The approved auric emblem, gold/teal/indigo palette, typography, three arched pathways, and grouped package presentation are carried into the existing public shell. The existing navigation, booking picker, login/cart controls, and footer are preserved.

Five plan prices, names, taglines, and benefits are read from the existing rendered Wix Pricing Plans app, not written to its database. Matching is by the unique expected plan names, with a fail-safe return to the native selector if required controls disappear. No plan button is cloned or moved. The new purchase action invokes the corresponding original Wix button once after a fresh lookup. Wix creates and owns the checkout session; this integration neither constructs reusable checkout IDs nor submits payment.

Preview-only wording was removed. The Groups & Organizations action now uses the existing published invitation mailto destination rather than sending visitors back to the homepage. Included benefits are available in expandable details. Stillness, OS reduced motion, section-focus handling, duplicate-initialization protection, a standard-selector fallback, and route cleanup are included.

Only this Packages presentation was changed. The broader Living Nexus homepage and other worlds were not promoted or redesigned in this release. The existing review site was not replaced.

## Executed verification

### Pre-publication, temporary browser injection into the actual public page

The production candidate script was fetched from its pinned GitHub commit and syntax-checked. These tests used the real Wix page, but the temporary script injection was confined to the test browser before publication:

- 390px: document width 375px, one pathway column, five plans, no horizontal overflow, all new controls at least 44px high.
- 820px: document width 805px, three pathway columns, five plans, no horizontal overflow, controls at least 44px high.
- 1280px: document width 1265px, three pathway columns, five plans, no horizontal overflow, controls at least 44px high.
- Familiar-path navigation focused the Familiar Plans heading.
- Stillness froze auric animation times across the sampled interval.
- OS reduced-motion produced `animation-name: none` and enabled Stillness.
- Standard-selector fallback removed the enhancement and kept all five original plans visible after the next polling interval.
- `/services` remained unaffected and retained the existing 30-minute and 60-minute booking links.
- Package of 10 entered native checkout with Package of 10 and $1,800.00.
- Familiar #1 entered native checkout with Familiar #1, $49.99, and monthly recurrence.
- Checkout removed the Packages enhancement and restored the native page container.

### Post-publication, fresh page with no injected candidate

- Actual main-domain script bytes matched the pinned SHA-256.
- Correct release identifier and “The Inner Sanctum” heading; five plans; no preview-only copy.
- Actual published page repeated the 390px, 820px, and 1280px no-overflow/five-plan/44px-control checks: PASS.
- Package of 20 entered native checkout with Package of 20 and $3,500.00: PASS.
- Returning to the Packages URL loaded the new published version again: PASS.
- No customer details were typed and no payment was submitted. Opening checkout may create ordinary Wix checkout-session records; these checks are not completed purchases.

## Verification limits

- Remote browser viewport tests are not physical iPhone/iPad Safari acceptance or a full accessibility audit.
- Actual-browser screenshots were captured remotely, but image retrieval for direct side-by-side review did not complete. Pixel-level visual comparison is NOT VERIFIED; the owner's prior preview approval and unchanged design materials are not substitutes for a new image comparison.
- Container Chromium navigation was blocked by its runtime policy, so the separately written local synthetic browser suite was NOT RUN to completion. It is not counted as a pass. The positive evidence above comes from the executed remote-browser checks.
- Payments, renewal processing, cancellation, and all five completed purchase flows were not executed. No purchase was made.
- The native Wix DOM is a compatibility dependency. The original plan selector remains the fallback if its expected structure changes.
- Only the new public asset received the narrow content/egress review. No claim of a whole-site privacy or security audit is made.

## Rollback

Disable only custom embed `fe77e3aa-e81c-4cb0-a4d2-5db54bed9fe8` on the primary site, using its latest revision. Do not delete or disable the pre-existing public theme embeds. Reload the Packages URL and verify that the original “Keep growing” presentation and five native plan buttons return.

Confirmed Wix contracts:
- GET https://www.wixapis.com/embeds/v1/custom-embeds
- PATCH https://www.wixapis.com/embeds/v1/custom-embeds/{customEmbed.id}, with the current `customEmbed.id`, `revision`, and `enabled: false`.
- Update reference: https://dev.wix.com/docs/api-reference/business-management/custom-embeds/update-custom-embed

No data migration is involved. Existing plans, subscriptions, prices, Bookings, Forms, and checkout configuration remain the authority.

## Next action

Obtain physical Safari feedback on the live Packages URL and review captured screenshots against the accepted Inner Sanctum preview. Treat any site-wide visual work as a separate increment; do not overwrite this accepted page or unrelated theme work.

THARAVEL ~ KOSMATHRA ~ ✦
