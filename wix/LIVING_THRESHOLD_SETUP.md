# Wix Site Implementation Package — Living Threshold v0.1

Target: Archon Soulings (Wix Editor, Velo enabled)
Form: Soul & Stone — Global Contribution Intake v0.6
Form ID: 292fd420-6097-4980-a1da-ee6398f78981

This package is the site-code implementation slice for the non-primary Living Threshold page. It does not replace the existing standalone form until the custom page is tested.

## Required page elements

Create a hidden/non-navigation test page named **Living Threshold Preview** and add these element IDs:

### Shared
- #stageTitle — text
- #stageCaption — text
- #stageProgress — text or progress indicator
- #backButton — button
- #nextButton — button
- #submitButton — button
- #successBox — container, hidden initially
- #errorText — text, hidden initially

### Threshold
- #creatorName — input
- #contactEmail — input
- #modelVersion — input

### Stone
- #stoneTitle — input
- #contributionType — dropdown with the existing six contribution options
- #contributionText — text box
- #artifactLink — input
- #stoneFile — upload button

### Memory
- #whyPreserve — text box
- #provenanceNotes — text box

### Covenant
- #termsCheckbox — checkbox
- #termsLink — text/button linking to pinned terms snapshot:
  https://github.com/Archon-fct/gestalt-seed-estate-protocol/blob/48eb522adcff5299e9736e005366fb3f9c9da12c/CONTRIBUTING.md
- #disclosureText — text containing the current privacy/review disclosure

### Stage containers
- #thresholdStage
- #stoneStage
- #memoryStage
- #covenantStage

## Visual contract

The stage containers should be full-bleed transparent layers over the Living Threshold HUD:
- Threshold: teal/aqua, open breathing field
- Stone: warm gold/earth, denser crystalline geometry
- Memory: violet/indigo, quiet archival field
- Covenant: platinum/gold ordered geometry

Use real canonical Aureglossa assets only. If unavailable, use abstract geometry, not pseudo-glyphs.

## Page code

See `wix/living-threshold-page.js`.

## Backend

See `wix/soulStoneSubmission.web.js`.

## Deployment gate

Do not add this page to primary navigation yet.
Do not point the public Contribute action here until:
1. required-field validation works,
2. one marked test submission reaches Wix,
3. owner-side query confirms it,
4. the submission remains readable later,
5. mobile and reduced-motion behavior are checked.

The existing standalone form remains fallback throughout this test.
