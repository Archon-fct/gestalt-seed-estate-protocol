# Living Nexus preview deployment receipt

Date: 2026-10-07 UTC (October 6 evening in Utah).
Status: DEPLOYED_WITH_DEFECTS. Not approved for production promotion.

## Installed preview

- Existing site: Aureglossa HUD v0.6 Preview.
- Site ID: d64fb948-916d-492d-828e-22555f6456a3.
- Preview URL: https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/
- Wix upload ID: da3e516b-ba53-4a46-b17b-7f0de6246c5c.
- Runtime source: 1024f97e787b16eb5d58c551781f2af8601e9330, PR #11, feature/public-project-constellation.
- Original release-candidate source: a8ccc9f08e9ae0462dc2efdec721db8bed8c6308.
- Installed 18 public runtime files plus robots.txt, 122741 bytes total.
- The connected Wix API downloaded the installed archive immediately after upload and confirmed exact byte equality for all 19 files.
- The production archonsoulings.com homepage, navigation, contribution form and site content were not modified. Only the isolated preview was uploaded.
- The temporary transfer site was not claimed and is not the lasting preview URL.

## Scope and source corrections

The package contains the Nexus, Aura Dynamics, Sessions Inner Sanctum, Aureglossa Living Tongue, Gestalt Living Archive, Living Threshold, Astral Journal, Workshops Convergence, and their existing public JavaScript/JSON support files.

The original runtime was preserved except for two committed privacy corrections: an Astral Journal fragment describing private intelligence was replaced by a public provenance note, and a private assistant name was removed from a public journey-module comment. An explicit Nexus return link was also added to the Journal. No test assertions in test-constellation.mjs were changed.

Public package checks passed: explicit runtime allowlist, no symlinks, valid relative HTML asset paths, no private assistant name or common secret-key patterns. Test scripts, owner documents, credentials and private modules were not packaged. Living Thread and Field Journal remain browser-local. Journey save/dissolve and Field Journal clearing passed the browser tests.

This is an isolated public-content preview, not a password-protected site. Do not enter client information or other sensitive data. The current Living Threshold still opens the existing hosted contribution form on explicit interaction. No custom contribution submission or persistence test was performed, and no replacement of that form is authorized by this receipt.

## Test evidence

Final full-browser workflow: https://github.com/Archon-fct/gestalt-seed-estate-protocol/actions/runs/37554910898

Artifact: living-nexus-preview-evidence, artifact ID 11454318283, 13219614 bytes. It contains the manifest, packaged runtime, original-suite log, smoke-results.json, world-inspection.json, served-robots.txt and browser screenshots. The GitHub artifact expires 2026-10-21; a conversation copy was downloaded.

- Original unchanged integration suite: PASS at 390, 820 and 1280 widths.
- Final deployed smoke checks: 42 PASS / 13 FAIL.
- Additional independent world and physical-route checks: 28 PASS / 24 FAIL.
- Engines: Chromium and WebKit. These are automated desktop engines with viewport/touch emulation, not an actual iPad or iOS Safari device.
- All 18 public application files returned HTTP 200 and exactly matched source SHA-256 hashes.
- Nexus navigation, Guide Me, search, crossing/return focus, Aura practice, Aureglossa provenance, Gestalt relationships, local Field Journal, Living Thread save/dissolve, Stillness and reduced-motion checks passed in both engines at all three sizes.
- No page-level JavaScript exceptions were recorded by the primary smoke suite.
- All 20 physical-threshold URL checks passed (5 routes x 2 engines x 2 viewport sizes). This verifies route loading, retained threshold query and page content, not workshop attendance or a submission backend.

## Unresolved acceptance findings

### 1. Direct Nexus returns

Six pocket pages lack explicit direct index.html links: Aura Dynamics, Convergence, Inner Sanctum, Living Archive, Living Threshold and Living Tongue. This produced six primary smoke failures and 24 additional world-check failures across repeated viewport/engine combinations; these are repeated observations, not 30 distinct defects.

Aura has a history.back() button, which can work when entered from the Nexus but is not a reliable deep-link return. Living Threshold's button labelled Return to the Constellation returns only to its own approach screen. The other four listed pages have no explicit Nexus navigation control. Journal's explicit return was verified successfully.

### 2. Nexus Atmosphere / immediate Silence

The spatial-atmosphere.js support file is present, but no Atmosphere/Silence control is wired into index.html. This caused six primary smoke failures. Do not claim this feature is complete based on the original integration suite. Audio controls exist on several pocket pages, but their actual sound/stop behavior was not independently verified in this pass.

### 3. Portrait rendering

Screenshot review at 820px shows clipped right-side panels in the multi-column worlds, including Astral Journal, Aura Dynamics, Convergence, Living Archive and Living Tongue. The document-width assertion did not detect this because content is clipped rather than exposed as horizontal scrolling. The 390px Nexus screenshot also shows footer text under the journal controls. These are additional visual findings, not included in the numeric automated failure totals. Add element-boundary/visibility assertions rather than relying only on document.scrollWidth.

### 4. Host-generated robots.txt

The final full-browser run found that the HTTP robots.txt was Wix-generated and allowed crawling, despite the archive containing Disallow: /. This caused one exact-byte smoke failure.

After that run, the preview-only Wix Robots Txt API successfully accepted content `User-agent: *\nDisallow: /\n`, default=false, for this site's default subdomain. Production SEO was not touched. Public endpoint propagation has not been independently rechecked after the API correction, so the earlier failed check is not being relabelled as a pass. Crawl directives are advisory and are not authentication or a guarantee against indexing.

### 5. Submission and device acceptance

No actual iPad Safari session, custom contribution-form submission, persistence readback, or production promotion was performed. Those remain explicit acceptance gates. Some existing Journal/service actions still identify their downstream wiring as pending; static deployment does not turn those into completed business integrations.

## Recommendation

Ready for a diagnostic hands-on review of the Nexus and existing interactions on the owner's iPad. Not ready to call the complete iPad operating environment acceptance-green, replace the contribution form, or promote to the public homepage/navigation.

Open the preview in Safari. Start with Guide Me -> Learn, search boundaries, open Aura, inspect Field Journal, then save and dissolve Living Thread and refresh. Browser Back is a temporary workaround in worlds lacking a direct return. Keep the contribution path to non-submitting visual inspection until its test endpoint and persistence checks are completed.

## Exact continuation

1. Fix direct Nexus returns in the six named pages while retaining their existing dimensional interactions.
2. Extend the existing responsive layout to cover 820px portrait; verify element bounds and readable right-side content, not just overflow width.
3. Wire the existing spatial-atmosphere module into the Nexus with explicit opt-in, immediate stop, cancellation of pending starts, and page-exit silence.
4. Recheck the preview's served robots.txt after the accepted API setting change.
5. Rerun the unchanged original suite and the stronger deployed checks, test the real iPad, and complete a marked custom submission/persistence test before any separately approved public promotion.

The workflow now propagates failures through log piping with explicit pipefail. Its final full run correctly concluded FAILURE; it must not be described as green. The workflow is in verify mode and does not automatically modify the permanent Wix preview.
