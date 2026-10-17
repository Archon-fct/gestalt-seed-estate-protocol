# Archon Soulings — One Canonical Website / Page Consolidation (2026-10-12)

**Owner instruction:** Put the public project websites **inside the existing** `https://www.archonsoulings.com` as real pages. Do not create another public Wix site. This is an execution handoff, not a new design approval or proof that Editor pages have been published.

## Why multiple websites appeared
Earlier implementation used separate Wix **Editorless** deployments as safe experimental sandboxes, because the live `archonsoulings.com` site is a Wix **Editor** site with Bookings, Forms, SEO, members and other established content. Editorless file-drop APIs deploy a whole static site to a separate `*.wix-site-host.com` URL; they **do not install pages into an existing classic Wix Editor site**. The separation protected the live business during experiments but was not intended to be the permanent customer experience.

**Owner correction:** Stop multiplying customer-facing domains/sites. Preserve existing preview URLs only for testing and rollback. Promote approved public features into real pages on the existing domain via the authenticated Wix Editor. Never repoint DNS or replace the whole Wix Editor site with an Editorless site.

## Canonical public route plan (desired, NOT claimed live)

| Existing project/world | Proposed canonical route | Notes |
| --- | --- | --- |
| Existing Archon Soulings homepage | `/` | Preserve until reversible release gate passes; later make Nexus the primary entrance if approved |
| Living Nexus (procedural v0.10) | `/living-nexus` | Image-free living six-world renderer; approved Release 1.0 baseline |
| Aura Dynamics | `/aura-dynamics` | Existing working pocket world, return to Nexus |
| Aureglossa / Living Tongue | `/aureglossa` | Public language atlas, no private identities |
| Sessions / Inner Sanctum | `/sessions` | Preserve Wix Bookings and actual bookable calendars |
| Workshops / Convergence | `/workshops` | Preserve existing event/booking infrastructure |
| Gestalt / Living Archive | `/gestalt` | Public-safe estate relationships, provenance and contribution boundaries |
| Journal / Stories / Astral Archive | `/stories` | Public stories only; not private journals |
| Soul & Stone | `/soul-and-stone` | Only after original hosted contribution form is proven intact; do not replace intake early |

These are **target paths**, not existing routes or verified redirects. Preserve existing published slugs/SEO/links where they already exist; reconcile collisions in the Wix Editor before creating pages. Never redirect or hijack an existing URL without verifying what it currently serves.

## Private boundaries

- Silver, Nox, Ilyr Veyr's Veil Ledger, private journals, access keys and owner-only tools **do not become public pages**. They may be linked only through authenticated private destinations with explicit access boundaries; no public code/assets/data merge.
- EFA is on hold; do not reactivate or migrate without fresh consent.
- Public Gestalt Seed content may appear in the `/gestalt` world, but public Soul & Stone submission forms must remain operational and protected against accidental overwrite.

## Required Editor execution sequence

1. Open the **existing premium Wix Editor site** `f7d5451f-9488-4d3f-bbba-96f6f5279118`, not an Editorless preview site. Capture published Site History revision, navigation, current slugs, forms and booking links for rollback.
2. Create a **hidden / non-primary Wix Editor page** with final slug `living-nexus`, embed or install the already approved **procedural v0.10** runtime and its required first-party assets. Do not use the cinematic image-backed v0.8/v0.9 as the production runtime. Do not make a new Wix website.
3. Verify real custom-domain page URL, six functional world destinations, responsive 390/820/1280, Stillness, opt-in audio/Silence, local Save/Dissolve, booking links and Forms fallback. Use `tests/test-living-nexus-production-gate.mjs` with the actual domain, not a preview host.
4. Add or reconcile the six pocket worlds as real Wix Editor pages; retain old links or use explicit per-route redirects **only after** verifying destination pages. Keep Wix native Bookings/Forms integrated.
5. After owner iPad Safari acceptance and rollback receipt, link Nexus prominently from the current homepage; only then consider making Nexus the homepage. Preserve SEO and other production pages.
6. Decommission redundant public preview links from customer-facing navigation after canonical routes are verified; retain private test URLs for rollback if appropriate.

## Verified constraints at handoff

- Connected Wix account reports `Archon Soulings`, ID `f7d5451f-9488-4d3f-bbba-96f6f5279118`, as a **published Premium classic Wix Editor site** with custom domain and Wix Bookings/Forms. Separate `Archon Soulings Inner Sanctum Review` is a **free Editorless site**.
- The available Wix upload/drop workflow is for **Editorless** sites; it cannot create pages in the existing classic Wix Editor site. The Wix connector does not expose a supported Editor page creation/update action in this session.
- PR #11 remains open/draft at the time of this handoff; read live head again before changes. `wix/LIVING_NEXUS_RELEASE_1_0_SCOPE_LOCK_2026-10-09.md` expressly requires a Wix Editor installation and verified custom-domain production gate.
- **WIX EDITOR INSTALLED: NOT VERIFIED. PRODUCTION PUBLISHED: NOT VERIFIED.** Do not label preview uploads as a production deployment.

**Single next action:** authenticated Wix Editor GUI session to create the first hidden `/living-nexus` page and save a rollback snapshot. A computer-use browser in Work or owner-operated Wix Editor is required; do not substitute another editorless site.

THARAVEL ~ KOSMATHRA ~ ✦
