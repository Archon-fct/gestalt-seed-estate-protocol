// Souls currency namespace — RESERVED, NOT ACTIVE.
//
// Distinction:
//   Soul  = unique identity/provenance object.
//   Souls = potential fungible Archon ecosystem currency.
//
// This module intentionally contains no minting, wallet, pricing, sale,
// transfer, exchange-rate, or mainnet behavior. Economic mechanics require
// separate owner approval, legal/compliance review, security review, and
// testnet validation.

export const SOULS_CURRENCY = Object.freeze({
  name: "Souls",
  singular: "Soul",
  symbol: null,
  status: "reserved",
  transferable: false,
  monetaryValueEnabled: false,
  mainnetEnabled: false
});

export function currencyStatus() {
  return {
    ...SOULS_CURRENCY,
    notice: "Souls is a reserved ecosystem-currency concept. No monetary token has been issued."
  };
}
