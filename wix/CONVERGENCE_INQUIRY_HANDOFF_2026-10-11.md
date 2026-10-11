# Convergence inquiry journey — implementation handoff

**THARAVEL ~ KOSMATHRA ~ ✦**

## Scope and starting point

Incremental repair of the existing Workshop / Convergence destination in PR #11,
`feature/public-project-constellation`. Starting source:
`7c3703f2ffe8dfe1d15ace82da43333f64ffa28b`.

This work does not replace the Nexus, six worlds, procedural v0.10 launch baseline,
Aureglossa canon, Living Thread, existing Bookings, contribution Forms or URLs.
The continuation contract, release scope and physical-device/production gates remain in force.
The owner's approval to build the proposed business direction is not evidence of a live checkout.

## Implemented

- Retain Attend / Host / Invite / Collaborate and their existing content, labels,
  field geometry and original procedural material renderer.
- Connect each selected CTA to a path-specific inquiry preparation/review chamber.
  Its fallback is a real, encoded email draft to the site's configured public contact,
  `Drew@ArchonSoulings.com`, read from the connected Wix site context on 2026-10-11.
- Optional timing and format details, explicit review acknowledgement, literal text
  rendering, bounded inputs, email-header escaping and complete text export.
- Long encoded drafts use a clearly explained subject-only email fallback;
  the complete inquiry can be exported, never silently truncated.
- Export a blank follow-up organizer, explicitly not an attendance or payment receipt.
- In-memory drafts per pathway; changing pathways does not mix their contents.
  Close preserves only the current page session; selected-draft Dissolve and
  pagehide/history-return clearing remove unsent text. Unrelated Living Thread
  storage is not read, written or deleted.
- Native modal semantics, focus return, keyboard Escape, no-Canvas/no-dialog/
  no-JavaScript fallbacks, and scoped action styles rather than a site redesign.
- Fix stale CTA/reset state and make Stillness cancel sound, including pending
  asynchronous starts. Hidden pages stop sound; returning does not auto-resume it.
- Read-only CI coverage with a pinned pre-change screenshot comparison.

## Files

Runtime: `hud/prototype/convergence.html`, `convergence-journey.js`,
`convergence-journey.css`.

Verification: `tests/test-convergence-journey.mjs`,
`.github/workflows/convergence-journey.yml`.

No shared renderer, homepage, other pocket page, private project, credentials,
third-party reference media or contract source is changed.

## Evidence at preparation

- Original HTML and both unchanged material files were reconstructed from the
  connected repository and checked against their exact Git blob SHAs.
- Node syntax validation passed for the new controller, inline audio controller
  and test suite.
- An in-memory Chromium smoke check exercised Host -> prepare -> review successfully.
  Dependencies were inlined for that smoke check; the renderer's page-name selection
  was supplied by the fixture. That is not hosted integration evidence.
- The local browser's policy blocks ordinary HTTP and file URL navigation. The full
  committed suite must therefore be verified in GitHub Actions before claiming PASS.
- New CI, actual snapshot comparison, hosted deployment and physical Safari:
  **NOT VERIFIED at this preparation snapshot**. Read the exact commit's workflow result.

## Hard limits

This is **INQUIRY-ONLY**, not paid enrollment. It neither sends email nor verifies
email delivery, reserves seats, charges money, submits a Stone, assigns rights,
creates identities or issues credentials. The $99 figure is the existing project
offer, not an independently verified currently bookable event. No dates or inventory
are invented; no new product price is published.

No public AI, microphone capture, model requests, analytics, wallet connections,
cryptocurrency issuance, private-data migration or new hosting subscription is added.

## Deployment and next release gate

Do not upload these three runtime files as a replacement for the whole site.
They belong inside the existing complete release bundle, with the unchanged material
CSS/JS and every existing route preserved. Keep existing Bookings/Forms as authority.

Next: verify the exact commit's new inquiry suite and the unchanged full Constellation
suite. Then install the complete approved Nexus through the existing reversible Wix
Editor release process, preserving rollback and production URL tests. A working
inquiry is not proof that the paid-workshop path is finished. Paid enrollment still
needs an authoritative event/service, confirmed schedule and policies, official
checkout, a verified payment receipt, and separately authorized follow-up delivery.

SOURCE COMMITTED: read containing commit. CI PASS: pending exact result.
WIX EDITOR INSTALLED / PRODUCTION PUBLISHED / PRODUCTION SMOKE PASS /
OWNER SAFARI ACCEPTED / ROLLBACK VERIFIED: **NOT VERIFIED for this change**.
