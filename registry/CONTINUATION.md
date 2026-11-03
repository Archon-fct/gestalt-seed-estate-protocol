# Durable intake continuation candidate

Source-only implementation, 3 November 2026. It is not deployed, scheduled, or live-tested. No collection, access grant, submission, notification, or publication was changed for this work.

## Purpose

The authorized operator importer copies confirmed Soul & Stone submissions into `GestaltStoneReview` and receipt/change events into `GestaltStoneEvents`. It is not the visitor form or public gallery. Previously each invocation restarted the oldest 20 pages without returning or storing a continuation. A stable 2,001-row synthetic source could leave the final row outside every invocation.

The candidate stores a minimal job in a separately provisioned private `GestaltIntakeJobs` collection. Each successful page advances that checkpoint only after its required review and event writes have been confirmed. The next invocation loads the saved cursor. Existing review decisions are not overwritten.

## Operator contract and prerequisites

1. Keep exactly one authorized runner active for this job. `singleRunner: true` acknowledges this operating restriction. It is **not a lock**, security control, authentication grant, or proof that another runner is absent. No recurring schedule or distributed worker is installed.
2. An authorized owner must separately provision and review the job collection described in `intake-job.collection.json`. This change does not create it or change permissions. The script stops before reading submissions if any required collection or privacy check fails.
3. All three collections must return legacy `ADMIN` permissions for read/insert/update/remove and the newer `PRIVILEGED` item permissions with an explicit empty `specialPermissions` array. The script rejects any special override, including legitimate ones needing human review. It never clears them. Missing or omitted permission fields fail closed.
4. Existing authenticated Wix execution must already be authorized to read the form, manage/read collection definitions and permissions, and read/write the private CMS records. Do not grant additional access just to make a test pass. This source has no credentials.
5. Keep the function in the authorized operator environment, never browser code or a public endpoint. In that environment, assign the checked-in function expression to `reconcile` and call `await reconcile({singleRunner:true,maxPages:1})` for a deliberately bounded invocation. A no-argument call now refuses to run. After independent live acceptance, the configured page budget can be 1 through 20; the default is 20.

Collection checks are a point-in-time configuration gate. They do not conceal data from site administrators, prove all backend authorization, prevent later permission changes, or establish privacy of uploaded media. Actual site roles and elevated backend paths require a separate access review.

## State and recovery

- Job ID: `soul-stone-intake-v1`.
- Job fields: schema version, query/config fingerprint, monotonically increasing transition sequence, sweep generation, state, opaque cursor, page count, and cursor hashes for cycle detection. No submission IDs, text, names, or files are copied into the job. Opaque tokens still remain private.
- Primary reads use `consistentRead=true`. Initial inserts are create-only. Checkpoint PUT uses a server-side condition on `jobVersion`, `configSha256`, and `sequence`, followed by exact primary-read verification.
- An uncertain checkpoint write is read back once. It is not blindly repeated. If the full intended state cannot be verified, stop. A later invocation reads persisted state anew.
- Review/event operations are not a transaction. A failed page can have partial writes, and the returned `created` list can contain records committed before a later failure. The checkpoint stays at the previous page, enabling idempotent replay and repair of a missing receipt event.
- Every returned review record is checked for source identity and a matching stored text digest, including reuse after uncertain writes. When the stored metadata fingerprint matches the current source, immutable content must match too. Newly created content must match on readback; steward-decision fields may differ. Existing deterministic event IDs are accepted only when their semantic fields agree. Conflicting source-change events, including a second different change with the same revision ID, stop progress for review rather than being silently swallowed. This change does not redesign historical event IDs.
- Missing/malformed page envelopes, row validation errors, bad cursors, repeated cursor hashes, configuration changes, and state conflicts stop continuation. Diagnostics use bounded codes, not raw transport bodies. Raw cursors are not returned in the report.
- On a blocked result, inspect the reason in the authorized private environment and repair the underlying issue. Do not skip/quarantine rows or edit the checkpoint to hide errors. There is no automatic row-discard policy.
- If a saved cursor has expired or is unusable, the script stops. Only a deliberate call with `restartSweep:true` resets to the beginning, incrementing the generation. It does not delete imports or rewrite decisions. A schema/config mismatch is a separate migration decision and cannot be reset by this option.
- After a successful traversal, the **next invocation** starts a fresh full sweep. This catches some late confirmations and finite ordering changes after the source settles. It does not establish a continuously consistent snapshot.

## Completion and bounds

`hasMore:true` means continuation or investigation remains. `resumeBlocked:true` means this invocation did not establish a safe next checkpoint. `pagesProcessed` counts only verified checkpoint advances. `sweepComplete:true` means the current traversal reached a provider response explicitly saying there is no next page and its final checkpoint was verified. `snapshotComplete` is always false.

Each invocation requests at most 20 pages of up to 100 rows. Cursor strings are opaque and bounded at the documented 16,000 characters. Persisted cycle history is capped at 1,000 pages per sweep, after which the job stops without claiming completion. This is an application safety budget, not a Wix pagination limit. Large traversals need a separately reviewed design; repeatedly resetting them is not a progress guarantee. HTTP-call latency, quotas, execution duration, and real collection item-size limits remain integration acceptance checks.

## Verified Wix contracts and remaining uncertainty

The official method schema was inspected on 3 November 2026:

- [Query Submissions By Namespace](https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/query-submissions-by-namespace): up to 100 results; required namespace filter; cursor continuation without filter/sort; cursor maximum 16,000 characters; `hasNext` indicates a following page. The API-spec `publicUrl` confirms the current `/forms/v4/submissions/namespace/query` route. Both `createdDate` and `id` are sortable, so the initial query includes an ID tie-breaker. The ID field does **not** declare range operators, so no speculative `(createdDate,id)` keyset filter was introduced.
- [Get Data Item](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/get-data-item): `consistentRead=true` reads the primary instance. This is not locking.
- [Insert Data Item](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/insert-data-item): a custom existing ID causes create-only insertion to fail. Existence alone does not verify content.
- [Update Data Item](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/update-data-item): PUT replaces the payload; `condition.filter` applies a server-side condition. Official examples use raw data-field names such as `stock`, hence `sequence`, not `data.sequence`. The complete owned checkpoint payload is supplied; unknown fields block rather than being silently removed.
- [Get Data Collection](https://dev.wix.com/docs/api-reference/business-solutions/cms/collection-management/data-collections/get-data-collection) and [Get Permissions](https://dev.wix.com/docs/api-reference/business-solutions/cms/collection-management/data-permissions/get-permissions): separate legacy collection permissions and privileged/special overrides. Get Collection alone does not enumerate all overrides. Get Permissions requires Manage Data Collections and does not expand that permission itself.

No Forms-specific snapshot isolation, cross-session cursor lifetime/expiry, or concurrent-writer atomic CAS/linearizability guarantee was found in the reviewed official documentation. Conditional PUT plus readback is defense in depth under the single-runner restriction, not a distributed mutex. There is no transaction spanning review, event, and checkpoint items. Strict response gates can reject legitimately omitted fields until an actual authorized integration confirms and documents normalization. Text-based not-found/duplicate error classification is inherited in bounded, sanitized form and must be checked against the actual execution wrapper's error shapes.

No production compatibility claim is made. The source-only patch is suitable for review; deployment acceptance remains open. Admin edits/deletion/rollback of checkpoint or event records are not detected as tampering. Fingerprints authenticate neither authorship nor the service. Existing GUID case-alias and broader source-schema/provenance concerns are not solved by pagination.

## Offline evidence

Run with Node's built-ins only:

```sh
node registry/test-runner.cjs
node --test registry/tests/*.test.cjs
```

The regression runner preserves seven original scenarios. The continuation suite covers static/pending backlogs, shorter pages, persisted resume, late confirmation, partial and uncertain writes, event conflicts, exact checkpoint readback, malformed state and envelopes, privacy gates, cursor bounds/cycles, bounded sweep stopping, and mutable ordering countermodels. The mock has no network fallback and uses fabricated records only.

The mutable-source mock uses offset-like opaque cursors as a counterexample, not a claim about Wix's implementation. Finite insertion/deletion/reordering can still be missed during one traversal; tests show later fresh sweeps repair those examples after changes stop. Continuous-change convergence, provider availability, durable-session cursor acceptance, authorization, and real failure semantics are not established by this model.
