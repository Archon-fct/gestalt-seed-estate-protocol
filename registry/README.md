# Stone Registry v0.6 — private review foundation

## Current state

Two CMS collections have been created on the existing Archon Soulings Wix site:

- `GestaltStoneReview` — private work and review records.
- `GestaltStoneEvents` — private configuration and audit records.

Read, insert, update, and remove permissions were verified as `ADMIN` for both collections. The normal authenticated Wix CMS interface is the initial steward dashboard; this is not a separately deployed custom admin application. Administrators can edit the audit collection, so it is **not an immutable or tamper-proof log**.

A versioned intake-configuration event stores the form schema, exact terms reference, and data-use notice. No independent contribution was imported during this release.

## Release blocker: durable form receipts

The native Wix form renders, uploads a synthetic PNG, and displays a thank-you message. However, release tests returned `PENDING` and could not subsequently be retrieved by the owner API: direct receipt reads returned 404 and the form's query/count returned no records. An owner-API test could be read immediately within its creation call but not in a later call. The cause has not been established.

Do not call this end-to-end intake verified. Do not lower spam protection, retry submissions repeatedly, or manufacture Stone records to conceal the discrepancy. A normal-browser owner check and, if still unresolved, Wix support diagnosis are needed before broader promotion.

## Reconciliation code

`reconcile-intake.wix.js` is an authorized-operator script for the connected Wix execution environment. It is not a browser script, scheduled deployment, or public API. It needs the existing authenticated `wix.request` capability; no credentials are embedded.

The script:

1. Refuses to run unless both registry collections remain admin-only.
2. Reads only the designated form and only imports `CONFIRMED` source submissions.
3. Uses the full source GUID as the CMS item ID and `STONE-<full-guid>` as a stable display identifier. It does not claim sequential numbering.
4. Inserts only missing records; a repeat run does not overwrite a steward's decision.
5. Hashes the exact retrieved UTF-8 contribution text and a defined metadata snapshot. These are integrity fingerprints, not proof of authorship or copyright.
6. Preserves source revisions, self-reported creators/models, pinned terms acknowledgement, and artifact metadata.
7. Does not duplicate the contact email into the review collection; the original intake retains it for authorized follow-up.
8. Flags uploaded artifacts as `UPLOADED_NOT_SCANNED_OR_HASHED`. It does not fetch arbitrary source links or execute uploaded code.
9. Creates deterministic receipt/change audit entries and identifies the known synthetic release fixtures.

The live reconciliation attempt found no confirmed receipts and therefore imported nothing. Mocked tests validate the transformations and duplicate-handling logic; they do not resolve the live receipt blocker.

## Human review

Suggested `reviewState` values are `PENDING_REVIEW`, `REVIEWING`, `CHANGES_REQUESTED`, `ACCEPTED`, `REJECTED`, `ARCHIVED`, and `TEST_ONLY`. These are an operating convention, not a fully enforced state machine.

Keep `canonState: PROVISIONAL` and `publicApproved: false` until separate authorized decisions. Record the reviewer, decision time, notes, and a corresponding event. Do not equate receipt, acceptance, canon approval, publication, copyright assignment, and NFT minting.

Public publication, financial actions, external notifications to contributors, and canon changes require explicit steward authorization. No automatic public gallery or token minting is installed.

## Rights and privacy

New intake acknowledgement is linked to the exact draft `CONTRIBUTING.md` snapshot at commit `48eb522adcff5299e9736e005366fb3f9c9da12c`. The previous checkbox is retained but hidden; earlier acknowledgements must not be re-labelled as acceptance of new terms.

A checkbox is evidence of acknowledgement, not a legal opinion or proof that the submitter owns all submitted rights. Qualified review remains necessary before commercialization.

The form now includes a data-use notice and restricts submission records to owners/collaborators. Uploaded-media URLs must not be treated as confidential storage. Do not collect private records or secrets. No malware-scanning or access-controlled media vault has been verified.

## Tests

Run `node registry/test-runner.cjs` for mocked reconciliation checks. An optional `RESULTS_PATH` environment variable writes the test report. Tests cover creation, SHA-256, duplicate suppression, preservation of review decisions, source-change events, default non-public status, and pending-submission handling.

## Next acceptance gate

One deliberate non-sensitive test must be retrievable from a later owner session, retain its expected fields and file reference, appear once in the private registry, and remain marked TEST_ONLY. Then check a normal human contributor path, notification delivery, and access restrictions before expanding outreach.
