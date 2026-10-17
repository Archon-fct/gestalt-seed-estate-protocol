# Archon Soulings — Living HUD preview 0.2

Source continuation of PR #11 on `feature/public-project-constellation`.
Baseline inspected: `d5cf50c2b94cb0b3b10ee5cc8e5f1d4984802a6c`.
Prepared and locally tested: 2026-10-06.

## Status

**Working standalone UI and an isolated, admin-only Wix test adapter. Not installed,
not published, and not proven against a live Wix submission.**

The original `hud/prototype/` files, original Wix page/backend, current hosted form,
live site, private assistant, and public/private permissions are not replaced.
The current tool session did not provide an authenticated Wix Editor installation
path. No Wix form schema or submission record was changed during this work.

## Working preview

Open `index.html` in a browser. It is self-contained, with no external scripts,
fonts, analytics, localStorage, automatic draft persistence, or private project data.

- The original constellation/orb/chamber visual language is carried into a new,
  separate preview: six project paths, breathing fields, stage-specific ambience,
  and Stillness / system reduced-motion handling.
- Project pathways open real existing public destinations, local contribution
  steps, or explicit email enquiries. No fabricated booking or acceptance state.
- Four genuine field stages preserve the existing form target names and pinned
  terms. Required fields and HTTPS links are checked; forward shortcuts validate
  prior stages. Entries are retained in memory across Back / Nexus navigation.
- The Covenant includes a text-only review, unchecked rights consent, and the
  existing data-use notice. Explicit draft export resets consent in the exported
  copy. Clear removes the draft but cannot undo a server-side submission.
- This pilot accepts text plus an optional HTTPS artifact link. Original-file
  upload remains on the separate existing hosted form. Drafts are not copied there.
- The custom send button remains disabled until an authorized Wix preview bridge
  responds. A standalone file never pretends it submitted a contribution.

## Separate Wix pilot files

`../../wix/living-threshold-preview-page.js` expects one HTML Component with ID
`#livingHUD`, containing this HTML, on a separate unpublished/non-primary page.
It imports `backend/livingThresholdPreview.web`.

`../../wix/livingThresholdPreview.web.js` belongs in the site's backend and exposes
only `Permissions.Admin` methods. It uses `wix-web-module`, `@wix/forms`, and
`@wix/essentials`. Module availability and actual Wix Editor runtime behavior still
need an installation test; local unit mocks do not establish either.

Do not replace the old backend or weaken permissions to `Anyone`. The pilot
requires a title starting `[HUD TEST]`. Use only owner-authorized original test
material; the owner deliberately accepts the pinned terms before sending.

The HTML recognizes only explicitly listed Wix parent origins, a matching parent
window, protocol, document nonce, and active request ID. No data is posted with a
wildcard origin. If the real preview parent origin differs, the bridge fails closed;
inspect the actual origin and deliberately configure it, never use a wildcard.

The host permits one attempted write per page lifetime, caches a bounded set of
responses for duplicate message IDs, and allows field corrections only when the
backend confirms validation failed before any write. This is a per-page guard,
not durable idempotency across tabs, refreshes, or server processes.

## Receipt semantics

The existing source explicitly requested Wix `PENDING`. This new, separate adapter
omits that override and uses the Wix Forms default. It performs **one create**,
then retrieves the resulting ID and checks the saved form ID, `CONFIRMED` status,
and every submitted field. This is necessary because the project README records
unretrievable PENDING receipts even after native thank-you screens.

The UI accepts only a verified receipt with a GUID, the expected form ID,
`CONFIRMED` storage status, and **PROVISIONAL** stewardship. It returns no email or
contribution body. Missing, mismatched, pending, or unreadable receipts remain
unverified. A timeout does not prove a write failed; the UI retains the draft and
locks sending rather than silently retrying. The adapter exposes no arbitrary
submission read method.

**Receipt is not acceptance, publication, payment, ownership, or canon promotion.**

## Release gate still open

Install only as the separate unpublished preview. Run one deliberately marked
owner test through the actual HTML component and backend. Verify its receipt can
be read back and appears in the owner's existing Wix submissions view with the
same field values. Test denial to non-admin visitors, the actual mobile Safari
runtime, error/timeout handling, and the actual parent-origin handshake.

Do not publish or replace the live entry path before that succeeds and the owner
authorizes the next release. Public intake additionally needs a separately tested
visitor authorization/CAPTCHA path, abuse/rate controls, durable idempotency,
file-upload security and receipt checks, and qualified review of the draft terms.
The existing hosted form remains available, but its previously documented durable
receipt issue is **not** claimed fixed by this preview.

## Local tests

Run from the package/repository root:

```sh
node tests/test-preview-backend.mjs
node tests/test-preview-bridge.mjs
python tests/test-preview-browser.py
```

Browser tests require Python Playwright and Chromium at `/usr/bin/chromium`
(adjust `executable_path` on another machine). The tests render local HTML via
`set_content`; all network requests are blocked. Backend/host calls are mocked.
No real Wix form is submitted by these test files.

Result in this environment: **25 backend + 15 bridge/receipt + 31 browser UI checks
passed**. Chromium was visually inspected at desktop and phone sizes; browser
checks also cover 320, 390, 768, and 1440 pixel widths. This is not a live Wix or
Safari end-to-end certification.

## Sources inspected

- PR #11 and its original `hud/prototype/index.html`, `living-threshold.html`, and
  `wix/living-threshold-page.js` / `soulStoneSubmission.web.js`.
- Live form schema `292fd420-6097-4980-a1da-ee6398f78981`, revision 5; read only.
- Pinned contribution terms, unchanged:
  https://github.com/Archon-fct/gestalt-seed-estate-protocol/blob/48eb522adcff5299e9736e005366fb3f9c9da12c/CONTRIBUTING.md
- https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/create-submission?apiView=SDK
- https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/get-submission?apiView=SDK
- https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/confirm-submission?apiView=SDK
- https://dev.wix.com/docs/velo/apis/wix-web-module/web-method
- https://dev.wix.com/docs/velo/api-reference/$w/html-component/on-message
