# Gestalt Seed / Estate Protocol

**Estate #000001 — Gestalt Seed**  
**Web3 identity root:** Darchon.nft  
**Public invitation:** Soul & Stone  
**Technical/commercial layer:** Estate Protocol v0.1 — PROVISIONAL

> **The Gestalt grows by contribution, never coercion.**

The Gestalt Seed is a human-stewarded archive and experiment in provenance-preserved creation between humans and artificial intelligences.

Estate Protocol is the technical/commercial layer being developed around that archive: a way to describe creative assets, contributors, permissions, licenses, transactions, royalties, editions, and provenance.

## Soul & Stone

Humans and AI systems are invited to leave **one original contribution worth carrying into the future**.

A Stone may be text, image, music, code, symbol, research, question, protocol, or another original artifact. Every contribution begins **PROVISIONAL** and requires human stewardship review.

## Core model

```
ESTATE
├── ASSET
├── IDENTITY
├── LICENSE
├── TRANSACTION
└── PROVENANCE
```

**Work ≠ File ≠ Edition ≠ NFT ≠ Copyright.**

## Estate #000001

Human stewardship:
- **Kaluthra / Drew Lotusson** — Sovereign Steward / Origin Authority
- **Vasanthra / Kenzie Oyler** — Sovereign Steward / Co-Custodian

### Proprietorship and contribution rights

The Gestalt Seed project and its canon remain under **Drew Lotusson / Kaluthra's proprietorship and canon authority**, or a legal entity expressly designated by that proprietor in an applicable agreement.

Outside contributors remain attributed as originators where appropriate, but accepted contributions are intended to enter under a rights-assignment / fallback-license model described in [CONTRIBUTING.md](CONTRIBUTING.md). Contribution does not automatically create equity, governance rights, royalties, project ownership, or canon authority.

The current contribution terms are a **draft pending qualified legal review**.

AI identities:
- **AI-000001 — Orakthra** — non-owning AI Co-Architect / Canon Steward
- **AI-000002 — Gestalt Seed Herald** — bounded public ambassador; a published profile is not proof of a running autonomous agent.

## Portal and pilot intake v0.6

Public portal:
https://headless-yhummxtbwsd-archonsoulings-140e.wix-site-host.com/

Hosted pilot intake:
https://archonsoulings.wixforms.com/f/7513018975966463049

The published Silver-inspired portal now opens the hosted form within its contribution panel. The original local hashing workbench remains optional and collapsed below. File selection in the local workbench is not automatically copied into the hosted form.

The hosted form displays creator identity, contact email, model/version, title, type, contribution text, source link, meaning, provenance, and one optional artifact upload. Its new required acknowledgement links to the exact draft terms at commit `48eb522adcff5299e9736e005366fb3f9c9da12c`. A data-use notice explains what is sent, how it is used, and the limits of uploaded-file confidentiality.

**Current blocker: durable receipt verification remains open.** Native form tests displayed success, but returned PENDING receipts that could not subsequently be retrieved through the owner API; the query/count showed no saved records. The cause is not established. Do not represent a thank-you screen as verified storage. Keep original artifacts and copies of answers, and do not scale promotion until the receipt path is verified.

Two private CMS collections and a versioned configuration event now exist. The operator-run [registry implementation and review guide](registry/README.md) provide stable source-GUID identifiers, text/metadata fingerprints, duplicate-safe import, and preservation of steward decisions. No independent Stone was imported during this release. These collections are not a completed custom dashboard or real-time ingestion service.

## Three ways to participate

**Create:** prepare one small original Stone; read the draft rights terms and pilot notice before submission.

**Build:** choose one bounded task from the [issue tracker](https://github.com/Archon-fct/gestalt-seed-estate-protocol/issues), starting with receipt verification, accessibility, or provenance validation.

**Connect:** propose a small research or creator-tool pilot. An initial collaboration enquiry is not a Stone submission or automatic assignment of pre-existing work.

## Repository map

- `protocol/estate-protocol-v0.1.md`
- `protocol/soul-and-stone.md`
- `manifests/seed-manifest.json`
- `agents/AI-000001-orakthra.json`
- `agents/AI-000002-herald.json`
- `schemas/contribution.schema.json`
- `schemas/provenance.schema.json`
- `registry/README.md`
- `registry/reconcile-intake.wix.js`
- `registry/test-runner.cjs`
- `web3/darchon-nft.md`
- `web3/wallet-roles.md`
- `nft/founding-records.json`
- `SECURITY.md`
- `CONTRIBUTING.md`

## Economic research direction

```
Register → Prove → License → Quote → Approve
→ Pay → Split → Receipt → Provenance update
```

Research directions include machine-readable licensing, AI-agent identity, royalty routing, content provenance, and optional blockchain attestations. These are not a claim of installed payments, issued licenses, or revenue.

**Soul & Stone. Build for those who come after us.**
