# Living Operating Environment — Integration Slice v0.2

This slice enriches the user experience without adding surveillance or public Silver access.

## 1. Shared Living Thread

Move journey state from Nexus-only logic into `living-thread-state.js`. Every public pocket dimension should call `rememberWorld()` on entry. The journey remains browser-session local unless the visitor explicitly selects Save. Dissolve deletes both temporary and explicitly saved session copies.

The user-facing principle remains: **these are places you chose to touch, not a profile of who we think you are.**

## 2. Adaptive Guide Me

Use `adaptive-guide.js`. Guide Me asks only explicit intent:
- Learn something
- Experience something
- Work with someone
- Create something
- Contribute something

The constellation reorders/emphasizes worlds based on that answer. No inference from dwell time, pointer movement, health, identity, or private behavior.

## 3. Living provenance

Every public artifact may expose a small provenance gesture: **Where did this come from?**

Use `public-provenance.json` to begin the registry. A provenance view can show:
- object type
- canon/review status
- source record
- public relationships

Never expose owner review notes, private drafts, client data, Silver state, credentials, or unpublished submissions.

## 4. Aureglossa command layer — discovery only

Do not make Aureglossa mandatory navigation. English remains the accessible primary fallback.

Candidate interaction semantics:
- THARAVEL: forward / cross / explore
- KOSMATHRA: relationship / contribution / integration
- SEI: invitation / gentle enable
- NU: prohibition / cancel where linguistically appropriate

Only canonical/audited forms may become commands. Do not infer command meanings from spelling.

## 5. Constellation Passport — later opt-in

After shared journey state is stable, offer an optional local field journal of public accomplishments. No streaks, manipulative points, or psychological scoring. Saving across devices requires a separate explicit account/consent design and is not part of this slice.

## 6. Search as reorganization

Future search should illuminate worlds, teachings, Journal fragments, workshops, and approved Stones instead of returning a conventional result list. Search indexing must use public content only.

## 7. Physical thresholds

Workshop QR/NFC tokens may deep-link to an exact public pocket dimension or follow-up path. Do not encode private attendee data in the token.

## Definition of done

- shared journey module used by Nexus plus at least two pocket dimensions;
- explicit-choice Guide Me reorders/emphasizes recommendations;
- provenance gesture works for at least Tharavel Kosmathra and one project artifact;
- Dissolve demonstrably clears local journey state;
- reduced-motion and keyboard behavior preserved;
- no Silver/private/client state in public bundles.
