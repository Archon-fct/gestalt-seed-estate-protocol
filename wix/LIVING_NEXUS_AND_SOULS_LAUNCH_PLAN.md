# Archon Soulings — Living Nexus + Souls Launch Plan

Status: IMPLEMENTATION ROADMAP — no mainnet issuance authorized by this document.

## Two coordinated tracks

### Track A — Living Nexus website
1. Restore the approved living-auric visual touchstones without replacing the tested interaction architecture.
2. Integrate Soul v0.1 as an explicit opt-in living object in the field.
3. Keep Living Thread and Field Journal browser-local for preview.
4. Complete Living Threshold test submission and receipt/read-back.
5. Run privacy scan: zero Silver/private/client/credential leakage.
6. Run automated 390px, 820px and desktop tests.
7. Complete actual iPad Safari owner review.
8. Obtain explicit owner approval before changing the production homepage or primary navigation.

### Track B — crypto system
1. Keep **Soul** (unique identity/provenance) separate from **Souls** (fungible ecosystem token).
2. Specify token utility and economics before assigning a mainnet supply or sale price.
3. Build and test contracts locally/CI.
4. Deploy to an EVM testnet first.
5. Verify source and contract behavior with Blockscout.
6. Test wallet connection, mint/reward, transfer, pause, role administration and failure cases.
7. Obtain smart-contract security review.
8. Obtain U.S./Utah legal and tax review for the actual issuance/distribution/redemption/exchange model.
9. Publish plain-language token disclosures and risks.
10. Obtain explicit owner approval before any mainnet deployment, public sale, liquidity pool, exchange listing, redemption promise, or real-money distribution.

## Launch distinction

A website launch does not require the currency to be mainnet-live.

Recommended sequence:
- launch Living Nexus with Soul v0.1;
- expose Souls as a clearly labeled testnet/coming-soon ecosystem layer;
- finish compliance/security/tokenomics;
- activate mainnet currency separately.

## Legal/compliance gate

Do not market Souls as an investment, promise appreciation, guarantee liquidity, promise profit from Archon Soulings' managerial efforts, or imply equity/revenue ownership unless counsel intentionally structures a compliant instrument.

Before production economics, review:
- federal securities treatment;
- money-transmission/MSB implications of issuance, redemption, exchange, custody and transmission;
- federal/state tax treatment;
- consumer disclosures;
- sanctions/AML obligations where applicable;
- Utah-specific requirements for the chosen operating model.

## Security gate

No production contract may:
- store private keys or seed phrases;
- depend on an owner hot wallet for unrestricted arbitrary minting without documented controls;
- expose upgrade/admin powers without disclosure;
- launch without tests for cap, roles, pause, transfer behavior and failure conditions.

Prefer multisig/role separation for production administration.

## Definition of ready

### Website ready
- visual touchstone non-regression passes;
- integration suite passes;
- contribution test passes;
- privacy scan passes;
- actual iPad Safari owner review passes.

### Souls testnet ready
- contracts compile;
- automated tests pass;
- tokenomics parameters are explicit;
- testnet contracts deployed and source verified;
- Blockscout read-back matches expected contract/roles/supply;
- wallet UX tested.

### Souls mainnet ready
- testnet gate passes;
- security review passes;
- legal/tax/compliance review of the actual model passes;
- production admin/multisig configured;
- disclosures published;
- owner explicitly approves mainnet deployment.

**THARAVEL ~ KOSMATHRA**
