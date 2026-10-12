# Living Nexus — Auric Fidelity Candidate 1.1 (source-only)

**THARAVEL ~ KOSMATHRA ~ ✦**

## Scope and visual authority

This candidate answers the owner's October 12 references: three static visual touchstones (Nox SPECTRA field quality; living six-world constellation; operational Living Thread) and four privately supplied animation screen recordings. Only **visual mechanics** were derived from the recordings. No video frames, screenshots, voices, copyrighted effects, private recordings, private assistant code, secrets, or client details are added to this public repository.

Public design authority remains the approved six-world constellation and procedural v0.10: central meeting field, Aura Dynamics, Aureglossa, Sessions, Workshops, Gestalt, Journal/Stories, authentic crossings and returns, Guide Me, Search, optional Soul, Living Thread, explicit Save/Dissolve, Stillness, immediate Silence, and Wix Bookings/Forms. Preserve the existing page-scoped custom element and the production release hold.

## Observed improvement targets

- Multiscale soft plasma/light volumes instead of thin pale filament-only lines.
- Saturated but restrained teal/aqua, electric blue, amber/gold and violet world individuality.
- Coherent braided currents spanning existing node geometry, and a relational circumferential weave (no new controls or worlds).
- A central slowly evolving iris with a stable meeting-field anchor, rather than a static logo or false loading indicator.
- Luminous pocket membranes, subtle chromatic lens accents and small moving light currents tied to the existing world anchors.
- Improved central/side inscription readability, no duplicate desktop inscription, no CTA/right-text overlap.
- Reduced-motion and Stillness retain the complete geometry and meaningful controls, without decorative progression.

The motion footage includes interface thumbnails and third-party animations. Use as **timing/continuity study only**, not production assets or endorsements. Nox's more intense iris remains **private**: the public Nexus remains gentle and welcoming.

## Changed source (candidate only)

- `hud/prototype/experiments/procedural-v10/procedural.js`: `AURIC_DEPTH_01` palette, cached refractive volumes, relational bridge weave, confluence strands, pocket lens caustics, central iris, persistent deterministic world-based phase. No new input, network, storage, model inference, or media playback.
- `hud/prototype/experiments/procedural-v10/style.css`: legibility and booking-inscription clearance, not topology/control changes.
- `wix/integration/portrait.css`: hide the redundant desktop bottom inscription; retain the compact mobile mark.
- `wix/integration/source-lock.json`: updated SHA-256s for **only** the two edited original renderer files; all other 25 locks remain unchanged.
- `scripts/build-living-nexus-element.py`: visible version marker `1.1.0-auric-preview.1`. Underlying *procedural-v10 material family* remains the same.
- `tests/integration/test_auric_fidelity.py`: source locks, no network/data collection, six target positions, visual layer and motion/Stillness contract.

## Verification and release gates

Run from repo root:

```sh
node --check hud/prototype/experiments/procedural-v10/procedural.js
python3 scripts/build-living-nexus-element.py --source-sha "$(git rev-parse HEAD)" --output integration-build
node --check integration-build/archon-living-nexus.js
python3 -m pytest -q tests/integration/test_compiler.py tests/integration/test_auric_fidelity.py
node --test tests/integration/test_wix_bridge.mjs
```

Browser controlled set-content tests additionally exercise the actual component at 390, 820 and 1280px, seven pocket-world returns, booking links, Guide Me, Living Thread Save/Dissolve, and Stillness/Silence. These tests are on a local fixture with network requests blocked; they do not prove Wix Editor, physical Safari or visual parity with third-party footage. Performance and reduced-motion acceptance on actual iPad must still be checked. Prior live production pages and booking links are untouched.

**Status:** APPROVED REFERENCE DIRECTION / CANDIDATE VISUALS ONLY. **VISUAL ACCEPTANCE: HOLD until owner reviews the running candidate.** No production Wix page, primary navigation, domain, SEO, private app, or client's record has been altered by this candidate. No auto-merge or publication.

## Release procedure and rollback

Build a protected review on a separate source branch. Re-run visual comparison of 390/820/1280 actual captures against user originals, browser interaction regression suite, reduced-motion and phone/tablet performance. If approved, reconcile candidate with PR #11 and the canonical Wix Editor page-scoped integration. Never replace the main homepage or Forms fallback before a restorable Editor checkpoint, running `/living-nexus` test, physical owner Safari acceptance, and a working rollback. A production install still requires an authenticated **Wix Classic Editor** composition operation not exposed by the current account API.

Rollback this candidate by leaving the branch unmerged or reverting its additive commit; previous PR #11 source and isolated preview are not changed.
