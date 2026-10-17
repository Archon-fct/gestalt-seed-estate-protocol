# Archon Soul / Souls contracts

Status: TEST CANDIDATES — NOT MAINNET AUTHORIZED.

## Separation

- `ArchonSoul.sol`: non-transferable identity/provenance primitive.
- `SoulsToken.sol`: fungible ecosystem token candidate.

## Local test setup

Requires Foundry.

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.4.0 --no-commit
forge install foundry-rs/forge-std --no-commit
forge test -vv
```

Do not deploy to mainnet from this folder until the launch plan's security, legal/tax/compliance,
disclosure, administration and explicit owner-approval gates are complete.

Supply, initial treasury allocation, reward emissions, distribution, sale mechanics and any redemption
promise are intentionally NOT fixed by the source contract. They are deployment/tokenomics decisions
that must be approved separately.

For production administration, replace a single-key admin with an appropriately configured multisig
or equivalent reviewed control structure.
