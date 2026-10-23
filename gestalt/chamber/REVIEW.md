# Cinematic chamber review — 21 October 2026

Status: implemented and hosted for owner review; not production-approved.

## Visual direction

The original ten-realm entrance presents its living Canvas field with circular realm nodes and a side detail panel. The candidate gives that same field a physical frame: an engraved brass and dark-metal dial, six opening iris blades, restrained teal underlight, a central reveal, numbered realm seals, and a record folio beneath the mechanism. The public realm data and original field rendering remain intact.

The original procedural material remains authoritative. The new layer provides theatrical framing and sequencing; it does not replace the field with a flat mock image or import game artwork. Sound consists of generated sine partials and remains optional.

## Verified browser behavior

Observed in the actual hosted candidate using the available cloud Chromium browser. The responsive widths below are real iframe viewports, not physical device or Safari tests.

| Viewport CSS px | Document client / scroll width | Horizontal overflow | Realm controls | Overlapping realm bounds | Authored controls below 44 px |
| --- | --- | --- | --- | --- | --- |
| 390 | 375 / 375 | None | 10 | None | None |
| 820 | 805 / 805 | None | 10 | None | None |
| 1280 | 1265 / 1265 | None | 10 | None | None |

The 15 px difference is the iframe scrollbar. Wix's injected banner close control remains below 44 px and is reported separately by the review frame; it was not hidden or changed. These dimensions are not a complete accessibility audit.

- Opening the iris changed `aria-expanded` to true, visibly retracted the blades and raised field opacity to 0.83. The source sets a roughly 1.7 second reveal; frame rate and perceived timing were not instrumented.
- Selecting every one of the ten native selector options updated the title, status, description and destination to the original realm record. Exactly one seal was pressed. External URLs were inspected; all ten destinations were not individually followed in this pass.
- ArrowRight moved selection/focus to Soul & Stone; End selected Builder Commons; Home selected Gestalt Seed. Enter on Read selected realm moved focus to the record panel.
- Escape closed the iris, silenced the sound UI and returned focus to the central control.
- Explicit sound activation reached the enabled UI state. Stillness turned sound off, disabled sound activation and produced a computed mechanism transition duration of 0s. Reload preserved Stillness and did not restore sound.
- The final console inspection filtered for chamber-related warnings/errors returned none. The unfiltered log contained browser-extension metadata errors; these were not candidate script errors. This does not establish that every external platform script is error-free.

## Corrections made from rendered testing

At 390 px, the rotated decorative mechanism originally caused document width 394 px against a 375 px client area. `overflow: clip` on the chamber removed the decorative overflow. The brand link was 37 px tall; its minimum height is now 44 px. Both corrections were deployed and the three responsive measurements above were repeated.

## Source and deployment checks

- `node --check` passed for the chamber module and original field module.
- Original field module, realm module and realm JSON match the production snapshot byte for byte.
- System reduced-motion handling was inspected in source: the media preference overrides the saved motion preference, stops field animation and disables transition durations. Live system preference switching was not available in this browser session.
- Source checks cover immediate gain-zero/oscillator stop, async sound-enable cancellation, hidden-page silence and pagehide silence. Actual audio quality/volume and device audio behavior were not measured.
- The initial deployment preserved all 73 original files on the existing preview site. Only the seven new files beneath `gestalt/chamber-20261021/` were added.
- The correction deployment changed only candidate CSS and the responsive review HTML. Read-back reported no other changed files.
- Wix inserts its own site script into HTML. Authored HTML was compared after removing that known injection and trailing whitespace; non-HTML candidate files matched exactly. Do not describe the served HTML as byte-identical.
- No production site deployment, checkout, purchase, contribution submission, agreement acceptance or GitHub merge occurred.

## Remaining acceptance

Owner visual judgment is still required, especially whether the level of cinematic depth satisfies the intended direction. Actual iPhone/iPad Safari, touch behavior, system reduced-motion switching, screen-reader narration, full Tab sequence, small-screen label legibility, measured contrast, performance and audio quality remain unverified. No physical device or Safari pass is claimed.

Production promotion must be separately reviewed. Neither these checks nor a future successful automated run constitutes owner approval.

## Motion correction after owner review — 21 October 2026, Mountain time

The owner approved the appearance but reported no movement on iPad Safari. Their screenshot showed the closed iris. Source inspection found an explicit presentation-layer pause, `still: () => still() || !open`, which froze the original renderer whenever the iris was closed. This was deliberate in the first implementation but did not meet the expected living arrival experience.

Removed the closed-iris pause while preserving user Stillness, system reduced motion, background-page and offscreen suspension. Increased the closed field opacity from 0.20 to 0.38 so the gentle swirling is visible; the open field remains 0.83. Added a version query to CSS and the chamber module so a refreshed page loads the correction. No geometry, realm data, renderer implementation or destination changed.

The same hosted review path was updated. Snapshot read-back verified all three authored changes and reported zero changes to other preview files. The exact original renderer and realm data remain unchanged.

Actual Chromium test after deployment: with the iris closed and Stillness off, two 660 × 660 screenshots differed in 44,790 pixels by more than three channel values (mean absolute channel difference 0.86286). With Stillness on, the corresponding two screenshots were pixel-identical (zero difference). Opening and closing the iris still updated its state correctly. This is direct rendered-motion evidence, not merely a source check; it is not a frame-rate benchmark. `node --check` passed for the updated module.

Physical iPad Safari has not been retested by the agent. System reduced motion still intentionally suppresses animation. This correction does not change production approval status or imply an accessibility/performance acceptance pass.

To roll back only this correction, restore the three candidate files from commit `14d86ed626da41cb2c155586826338fd932017d7` under the same hosted prefix, using a fresh complete preview snapshot to preserve unrelated work.
