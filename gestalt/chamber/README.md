# Gestalt Seed — cinematic chamber

Review candidate prepared 21 October 2026. This is a presentation layer for the existing ten-realm Gestalt entrance, inspired by the tactile mechanisms, controlled light and gradual reveals of Fireproof Games' *The Room*. All artwork and sound added here are original procedural CSS/SVG/Web Audio work. This is a browser chamber, not a reproduction of the game or a full 3D puzzle game.

[Open the hosted chamber](https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/gestalt/chamber-20261021/index.html) · [Responsive review frame](https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/gestalt/chamber-20261021/review.html)

## Experience

- The living auric field swirls gently on arrival. Open the engraved iris for the brighter reveal.
- Select any of the ten realm seals to read its record and follow its original destination.
- Use the direct realm selector or keyboard without solving a puzzle.
- Sound starts off. Explicit activation enables short generated crystal tones; Silence, Stillness, Escape or leaving the page stops them.
- Stillness preserves the existing preference key and respects system reduced motion.

## Preservation

`baseline/` contains the exact six authored files downloaded from the current ten-realm production site on 21 October, not a reconstruction from screenshots. `site/field.mjs`, `site/realms.mjs` and `site/realms.json` are byte-identical to that baseline. Realm statuses, descriptions and destination URLs are unchanged.

The production entrance and Soul & Stone contribution portal were not modified. This candidate adds no contributions, canon records, payment flows, wallet operations or private Silver/Nox data. Existing contribution terms and review processes remain at their original destination. Inner Sanctum PR #14 is outside this change.

## Files and review

- `site/`: seven files deployed under the isolated preview path.
- `baseline/`: rollback/reference snapshot; not deployed by this change.
- `REVIEW.md`: actual browser observations, source checks and remaining acceptance gaps.
- `evidence.json`: responsive measurements and deployment receipts.
- `sha256.json`: reproducible local file checksums.

Serve `site/` with an ordinary static HTTP server for local review; JavaScript modules require HTTP rather than opening the HTML directly from disk. No build or third-party dependencies are required.

## Release and rollback

The live preview is unlinked and marked `noindex,nofollow`; it is publicly accessible to anyone with its URL. It is not a private deployment or an access-control boundary.

Production promotion requires owner visual acceptance and actual Safari/device checks. A green source or browser check does not authorize replacement of the public entrance.

To withdraw this preview, take a fresh snapshot of its Wix preview site, remove only the seven files beneath `gestalt/chamber-20261021/`, and redeploy all remaining current files. Do not restore an old whole-site ZIP over unrelated changes. Production needs no rollback because it was not changed.

Inspiration reference: https://www.fireproofgames.com/games/the-room
