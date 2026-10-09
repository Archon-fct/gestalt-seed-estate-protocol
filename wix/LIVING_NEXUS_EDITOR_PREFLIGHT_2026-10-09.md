# Living Nexus 1.0 — authenticated Editor preflight, 2026-10-09

**Outcome: HOLD before installation and publication.** Release execution remains authorized. The original claim that authenticated Editor installation is the only remaining step is incomplete: the exact v0.10 source needs a compatible Wix integration and release-gate reconciliation.

## Scope and evidence
- Repository: `Archon-fct/gestalt-seed-estate-protocol`.
- Branch: `feature/public-project-constellation`; runtime source inspected at `2c0ac8db0f7e49d60a0431e79260c2e66be8e282`.
- [Project Constellation CI #608](https://github.com/Archon-fct/gestalt-seed-estate-protocol/actions/runs/37907074448): completed successfully at that SHA.
- [Soul and Souls Contracts #187](https://github.com/Archon-fct/gestalt-seed-estate-protocol/actions/runs/37907074432): completed successfully at that SHA.
- Production site `f7d5451f-9488-4d3f-bbba-96f6f5279118`, https://www.archonsoulings.com/.
- Authenticated Wix dashboard and Wix Editor both opened successfully. **Sign-in is no longer the blocker in this session.**
- No candidate page, custom-element bundle, new custom-code snippet, or homepage change was installed. Publish was not clicked. No booking, form, payment, camera, or microphone operation was submitted.

## Rollback checkpoint
Wix Site History shows the latest published Editor revision:
- Revision **387**, document `31cc5676-3da7-47eb-8266-0f86132d4327`.
- Branch `00000000-0000-0000-0000-000000000000`, displayed as Original-Branch.
- Published by site owner, **Oct 05, 2026, 7:19 PM**, as displayed in Wix; the UI did not identify the time zone.
- Revision 387 was starred in Site History as a rollback candidate. No revision was restored.
- History URL: https://manage.wix.com/dashboard/f7d5451f-9488-4d3f-bbba-96f6f5279118/site-history

**Important limit:** revision 387's preview shows the original Wix layout. The live home presents the newer quiet constellation. The dashboard separately lists enabled public-theme/navigation custom-code snippets. Therefore a Site History revision alone is not demonstrated to restore the complete live presentation. Preserve those snippets and their settings before modifying them. Their code was not changed or fully backed up in this preflight. A rollback was not exercised.

Two unedited screenshots were saved for the owner: the current live home and revision 387 in Site History.

## Public continuity snapshot
Observed live homepage title: `Chakra Balancing And Healing | Archon Soulings, LLC`.
Canonical: `https://www.archonsoulings.com`.
Description:
> A holistic life coaching approach that empowers and gives you the tools you need to build the life you really want! Enjoy the experiences of self-empowerment and the peace of mind in taking back your power! Spiritual journeys are for everyone and a joyful life is a habit. Archon Soulings, LLC.

Existing public navigation includes:
`/`, `/services`, `/shop`, `/blog`, `/testimonials`, `/single-project`, `/pricing-plans/plans-pricing`, and `/book-online`.
The live session links include `/booking-calendar/30-minutes-1` and `/booking-calendar/60-minutes-1`. The subscription form remains in the public footer.
The standalone contribution URL to preserve is https://archonsoulings.wixforms.com/f/7513018975966463049, as recorded in the approved handoff. This preflight did not submit or independently revalidate that form.

## Concrete integration gaps
1. **Wix packaging:** `hud/prototype/experiments/procedural-v10/index.html` is a full HTML document loading `app.js`, `procedural.js`, `gaze.js`, and `portal.js`. It is not a Wix custom-element entry. Wix documents a supported route through a JavaScript Web Component in `public/custom-elements/`, selected using Choose Source → Velo file. No such tested adapter accompanies this candidate. This requires code integration, not simply pasting the HTML into Velo page code.
2. **Production route mapping:** v0.10 `app.js` hard-codes the isolated preview hostname as its world base. `portal.js` also identifies preview-host HTML links. Pocket-page Nexus links currently point to `./index.html`. Resolve all of these to the real production route without changing the existing business routes.
3. **Required controls are split between implementations:** v0.10 has its own `nexus-cinematic-v10-saved` journey key. The pocket pages use `archonLivingThread.session.v1` and `archonPassport.v1`; the existing shared passport and consent-created Soul modules are separate. The v0.10 entry does not load those modules or expose Field Journal/Passport. Integrate the existing features and verify Save/Dissolve across the actual released experience.
4. **Immediate Silence:** v0.10 adds Silence inside its Tools panel. Closing or replacing that panel hides the control while audio can continue. Verify and provide the required directly available stop control.
5. **Mobile gate mismatch:** the new production checker requires every `.world[data-world]` target to lie in the viewport. Source `resize()` uses `Math.max(width/1536,height/1024)`, which crops the stage on tall screens. At 390×844, static calculation gives Aureglossa x=-162.5…10.6 and Sessions x=378.1…551.2; at 820×1180 the side targets also exceed the viewport. The mobile selector supplies alternate buttons, but the checker inspects the original targets. These are **source calculations, not browser test results**. Reconcile the actual accessible behavior and approved checker before claiming the exact bundle passes.

Supported Wix integration documentation:
- https://dev.wix.com/docs/velo/velo-only-apis/%24w/custom-element/add-a-custom-element

## Bounded next Work task
Package the frozen procedural v0.10 renderer and current pocket pages as a Wix-supported, page-scoped integration on the existing site. Reuse the existing controllers; preserve the six worlds and approved visual architecture. Resolve the five gaps above, test the exact bundle, then install on a real /living-nexus route with a visible home entrance. Complete the existing preview and production gates. Do not substitute an editorless preview, global takeover script, DNS change, or forced full-screen cross-origin iframe.

This is release integration work within the existing scope; it does not authorize new systems, paid services, or private-code publication. No renewed scope approval is required just to continue the already approved integration.

## Release status
| Stage | Status |
| --- | --- |
| SOURCE COMMITTED | PASS — inspected baseline 2c0ac8d; this receipt changes documentation only |
| CI PASS | PASS — #608 and #187 for that baseline |
| WIX EDITOR INSTALLED | NOT DONE |
| PRODUCTION PUBLISHED | NOT DONE |
| PRODUCTION SMOKE PASS | NOT RUN — no installed production Nexus URL |
| OWNER SAFARI ACCEPTED | NOT VERIFIED |
| ROLLBACK VERIFIED | PARTIAL — revision 387 identified/starred; full presentation recovery not verified |

**THARAVEL ~ KOSMATHRA ~ ✦**
