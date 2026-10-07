# Living Nexus — Preview Launch and Sustainability Gate

This is a deployment runbook, NOT evidence that the site is deployed.

## Order of operations
1. Merge the approved design constitution only after owner review. Do not merge a draft PR merely to speed deployment.
2. Capture approved reference-image bytes in versioned fixture storage with filenames, SHA-256 hashes, author/owner approval date and permitted use. Avoid relying on chat images as machine-accessible fixtures.
3. Start the existing `hud/prototype/` static bundle on a local preview server; run `node scripts/capture-living-hud.mjs <preview-url>` after installing Playwright/Chromium. Inspect report and screenshots at 390/820/1280. The automated script is evidence capture, not a pixel-diff test.
4. Compare screenshots to the approved reference compositions. Record a signed-off review or explicit rejection with specific differences. Preserve the central Nexus, six living worlds, filaments, and minimal UI.
5. Run the repository's existing integration suite unchanged. Verify all pocket routes, Guide Me, Search, Living Thread Save/Dissolve, Field Journal, Stillness, opt-in Atmosphere, immediate Silence, and privacy/Silver isolation.
6. Deploy the full tested static bundle only to the isolated editorless Wix preview if suitable; otherwise the hidden non-primary Living Nexus Preview. Never modify public homepage, primary navigation or contribution form.
7. Run actual iPad Safari acceptance; confirm touch targets, keyboard focus, no overlay interception, crossing/return and no horizontal overflow.
8. Verify the contribution receipt/read-back and persistence gates required by `wix/LIVING_NEXUS_PREVIEW_DEPLOYMENT.md`. Do not assume a static prototype satisfies backend requirements.
9. Public launch requires explicit owner authorization and a separate release PR after every gate passes.

## Sustainable operations
- **Ownership:** Archon-fct controls merge approvals, deployment credentials and release authorization.
- **Release discipline:** changes via branches/PRs; preserve a rollback artifact and last known-good deployment; never publish from concept art.
- **Privacy:** browser-local journey state by default, opt-in audio only, no Silver/private materials in public assets; review any new analytics or persistence before enabling.
- **Performance:** budget animation work for low-power iPad/iPhone, support Stillness and reduced motion; prefer progressive enhancement over mandatory heavy rendering.
- **Maintenance:** on each release capture device evidence, verify functional smoke tests, check privacy boundaries, and record build SHA and rollback version.
- **Costs:** measure Wix hosting/storage, asset bandwidth, optional model inference, monitoring and any persistent backend separately before enabling recurring services; set a monthly ceiling and alerts.
- **Reliability:** maintain a static functional fallback and accessible navigation if atmospheric effects fail; fallback is not visual release acceptance.

## Current known status
- Design constitution and evidence-capture script are proposed in a draft PR.
- Image binaries are not yet committed as fixtures.
- No evidence-capture run, automated visual diff, real iPad Safari acceptance, Wix preview deployment or public release is claimed here.
