# Living Nexus — page-contained Release 1.0 integration

THARAVEL ~ KOSMATHRA ~ ✦

This is an additive adapter for the owner-approved procedural v0.10 and the seven existing public pocket pages. It is not a replacement website or a new visual design. The original renderer, atlas, inquiry sources, Bookings and Forms are not rewritten.

## Implementation

The deterministic compiler locks 27 original source files by SHA-256. It produces one self-contained `archon-living-nexus.js`, the build manifest, and an explicitly labelled integration-review page. The component uses a bounded Shadow DOM container and trusted, same-origin `srcdoc` documents to isolate the original pages' CSS and lifecycle. There is no remote scene iframe, fullscreen takeover, global snippet, CSS applied to the host document, external model, new server data collection, or new payment system.

All eight document states route within this one component. Public URLs are `/living-nexus?world=aura` and the equivalent allowlisted world names; the root is `/living-nexus`. Native booking URLs and the existing contribution-form fallback remain unchanged. The review harness uses its own URL; the supplied Velo page bridge uses the main-site URL.

The adapter shares the existing Thread, Passport and optional Soul controllers. Save explicitly stores public journey/Field Journal data in localStorage. Dissolve removes this journey and its old saved version, not unrelated site data or a separately consented Soul. Malformed persisted entries are filtered. Storage denial falls back to the open-page session with an honest notice. Nothing migrates from the isolated preview's origin to the main site's origin; that would require a separate explicit export/import decision.

Stillness and Silence remain outside the frame, always reachable. Delayed audio acquisition is cancelled; detached frames stop tracked timers, animation callbacks, audio contexts and media streams. The existing optional video-only gaze experiment stays opt-in and does not trigger navigation. No microphone input is enabled. Controller tests use audio mocks; no real camera/audio is acquired by CI.

The portrait adapter fits the original six-world topology and makes labels and targets usable without changing `procedural.js`. This is not proof of fresh owner visual approval.

## Build and tests

```sh
python3 scripts/build-living-nexus-element.py --source-sha "$(git rev-parse HEAD)" --output integration-build
node --check integration-build/archon-living-nexus.js
node --test tests/integration/test_wix_bridge.mjs
python3 -m pytest tests/integration/test_compiler.py tests/integration/test_element.py
```

Browser tests require pytest 9.0.2 and Python Playwright 1.57.0. Set `NEXUS_BUILD_DIR=integration-build`, `NEXUS_REPORT_DIR=integration-evidence`, and `NEXUS_ENGINES=chromium,webkit`. An optional `NEXUS_BASE_URL` selects the served integration-review page instead of the explicit offline set-content fixture. Both are controlled test environments; neither substitutes for testing the actual Wix Editor integration or physical iPad Safari.

## Existing Wix Editor installation — not yet performed by this package

Target only site `f7d5451f-9488-4d3f-bbba-96f6f5279118`. Preserve the current live site, native services/forms, SEO, and all existing URLs. Record current published Site History and separately capture enabled custom-code configuration before any change. The earlier 387 checkpoint is historical, not a fresh complete rollback guarantee.

1. Add or use a non-primary `/living-nexus` page in that existing Editor site. Keep its native header/footer and an accessible text introduction/fallback booking link. Do not change the homepage yet.
2. Add a Custom Element. Prefer a Velo file `public/custom-elements/archon-living-nexus.js` containing the exact compiled bytes. Wix also supports an HTTPS Server URL for the compiled component. Do not point it at the review HTML page.
3. Use tag `archon-living-nexus`, element ID `livingNexus`, full available page width and sufficient height (the component's minimum is 560px on phones and 580px otherwise; verify actual Editor sizing on mobile/tablet).
4. Add `living-nexus-page.js` to this page's Velo code, not masterPage.js or a global tracking snippet. It uses the documented custom-element event interface and `wix-location-frontend` to coordinate query navigation. It never uses arbitrary event URLs or owner credentials.
5. Inspect all worlds, same-page returns, host navigation, browser back, direct `?world=` entry, shared Save/Dissolve, Stillness/Silence, and native Bookings/Form fallback at 390/820/1280px. In particular verify that the platform permits the trusted srcdoc execution; an offline standalone Web Component pass is not that evidence.
6. Publish only after these checks and a restorable rollback checkpoint. Verify the real custom-domain page. Add a native homepage entrance only after the page works. Physical iPad Safari and owner visual acceptance remain explicit gates.

Official contracts read for this integration:
- https://dev.wix.com/docs/velo/velo-only-apis/$w/custom-element/add-a-custom-element
- https://dev.wix.com/docs/velo/velo-only-apis/$w/custom-element/handle-events
- https://dev.wix.com/docs/velo/apis/wix-location-frontend/query
- https://dev.wix.com/docs/velo/apis/wix-location-frontend/query-params/remove

## Acceptance boundary

Source build and controlled browser tests are independent of WIX EDITOR INSTALLED, CUSTOM DOMAIN LIVE, OWNER VISUAL ACCEPTANCE, PHYSICAL SAFARI, PAID CHECKOUT, EMAIL DELIVERY and DURABLE FORM RECEIPT. Record each separately. The Convergence paths remain inquiry-only; do not advertise a seat reservation or a completed payment. This package does not publish the existing draft workshop, launch cryptocurrency, or expose private tools.

No main-site installation or completed-project claim is authorized merely by generating the bundle. Continue from the existing release contracts and record exact deployed bytes and evidence.
