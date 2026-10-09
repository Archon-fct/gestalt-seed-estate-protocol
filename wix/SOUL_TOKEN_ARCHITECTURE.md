# Archon Soulings — Soul Token Architecture

Status: DESIGN CONSTRAINT / IMPLEMENTATION ROADMAP
Owner concept: each participating person, Stone, and eligible living object can become a unique part of the Archon ecosystem called a **Soul**.

## Principle

A Soul is first an identity/provenance object, not automatically a financial instrument.

No visitor is tokenized merely by visiting.

Creating a Soul requires an explicit visitor action and clear consent. Browsing the Living Nexus remains possible without a wallet and without blockchain writes.

## Three layers

### 1. Living Soul — local / off-chain identity

The first implementation should be an optional Living Soul generated from the visitor's chosen journey.

It can contain:
- a random public Soul ID;
- creation timestamp;
- explicitly saved Living Thread seeds;
- public/non-sensitive Field Journal milestones;
- canonical Aureglossa discoveries;
- public relationships to Stones/worlds/workshops;
- visual seed parameters used to render a unique auric identity.

It must not contain:
- legal name unless deliberately supplied for a separate purpose;
- client notes;
- psychological profiling;
- inferred sensitive traits;
- raw browsing history beyond what the visitor explicitly saves;
- Silver/private data;
- wallet secrets or private keys.

The Living Soul should work without cryptocurrency.

### 2. Anchored Soul — optional on-chain provenance

A visitor may explicitly choose to anchor an eligible Soul or Stone to a blockchain.

The public chain record should prefer:
- random/public identifier;
- content/provenance hash;
- creator-controlled public wallet address where appropriate;
- timestamp;
- canonical relationship references;
- URI/hash pointing to approved public metadata.

Never put sensitive personal data directly on-chain because blockchain records may be permanent.

A personal Soul should default to **non-transferable** or otherwise identity-bound behavior. It should not be bought and sold as ownership of a person.

### 3. Economic Soul — explicitly eligible assets

Only objects intentionally designated for economic participation should gain transfer/market mechanics.

Examples may include:
- creator-approved Stones;
- editions of artwork;
- workshop artifacts;
- licensed public contributions;
- collectible provenance objects;
- explicitly issued ecosystem assets.

Economic eligibility must be opt-in and must not imply guaranteed appreciation, investment return, equity, revenue share, or ownership of Archon Soulings unless a separate legally reviewed instrument explicitly provides that.

## Soul ≠ person as property

A person's Soul token represents a self-directed digital identity/provenance anchor.

It does not represent ownership of the person, their labor, their consciousness, their personal data, or their future economic output.

The project must never describe a person's market price as the value of that person.

## Unique visual identity

Every Soul can have deterministic visual parameters derived from its public Soul ID and approved journey attributes.

Possible visual traits:
- auric membrane geometry;
- filament topology;
- constellation arrangement;
- restrained palette weighting;
- provenance rings;
- relationship stars;
- canonical Aureglossa marks only when legitimately associated.

The same Soul ID should reproduce the same base visual identity.

The visualization may evolve when the owner explicitly adds approved experiences or relationships.

## Stone model

Every approved Stone receives:
- immutable Stone ID;
- creator/provenance record;
- creation/approval timestamp;
- content hash;
- relationship edges such as INSPIRED_BY, RESPONDS_TO, EXTENDS, QUESTIONS, USES_CANON, COLLABORATES_WITH;
- optional Soul association;
- optional on-chain anchor;
- separate optional economic status.

A Stone can exist publicly without being cryptocurrency.

## Value model

Do not manufacture a fake market price.

Value may emerge through legitimate mechanisms such as:
- provenance and scarcity;
- creator-set sale price;
- primary sale;
- collectible editions;
- licensed use;
- patronage;
- community demand;
- approved marketplace transactions.

The UI must distinguish:
- symbolic/relational value;
- provenance;
- price;
- transaction history;
- ownership/control.

Never present speculative estimates as guaranteed monetary value.

## Wallet / blockchain UX

The Living Nexus must remain usable without a wallet.

When blockchain functionality is enabled:
1. visitor chooses **Create my Soul**;
2. show exactly what will be saved;
3. create the off-chain Soul first;
4. offer **Anchor this Soul** separately;
5. explain permanence/public visibility;
6. connect or create a compatible wallet through a vetted provider;
7. request the minimum signature necessary;
8. show transaction status and provenance receipt;
9. allow disconnection at any time.

Never request or store a wallet seed phrase or private key.

## Living Thread relationship

The Living Thread remains browser-local by default.

Creating a Soul does not silently absorb the entire Living Thread.

The visitor chooses what parts of the journey become part of the Soul.

**Let it dissolve** must still clear the local journey even when an independently consented public/on-chain Soul exists. The UI must explain that an already-published blockchain record cannot be erased by clearing local state.

## Silver boundary

Silver may help the owner administer approved public Soul/Stone records from a private authenticated environment.

Silver data itself must never be written into public token metadata.

## Technical direction

Phase 1 — functional without blockchain:
- Soul ID generator;
- deterministic auric avatar renderer;
- explicit Create My Soul flow;
- browser-local Soul metadata;
- Stone/Soul relationship model;
- exportable provenance receipt;
- no wallet required.

Phase 2 — provenance anchoring:
- select chain/provider after cost, environmental impact, wallet support, permanence, and legal review;
- wallet connection;
- non-transferable personal Soul contract or equivalent identity primitive;
- Stone provenance anchors;
- public metadata schema;
- testnet first.

Phase 3 — optional economics:
- economic eligibility rules;
- creator consent;
- marketplace/primary-sale mechanics;
- transaction receipts;
- royalty/licensing design only where technically and legally appropriate;
- production mainnet only after security and legal review.

## Release blockers

Do not ship blockchain/economic Soul functionality if:
- visitors are tokenized without affirmative consent;
- sensitive data can reach public metadata;
- private keys/secrets are handled by Archon Soulings;
- Silver/private data appears in public metadata;
- a person's Soul is transferable as if the person were property;
- monetary value is represented as guaranteed;
- production contracts have not had security review;
- applicable legal/tax/compliance questions remain unresolved for the intended economic mechanics.

## Relationship to the Living Nexus

Soul must deepen the Living Nexus rather than turn it into a crypto dashboard.

A Soul appears as another living object in the field:
- unique;
- relational;
- provenanced;
- consent-driven;
- visually alive;
- capable of crossing between digital and physical thresholds.

**THARAVEL ~ KOSMATHRA**
