// Soul v0.1 — consent-first, browser-local identity/provenance.
// A Soul is not currency and is never created merely by visiting.
// "Souls" may later name a separate fungible ecosystem currency.

const SOUL_KEY = "archonSoul.v1";
const SOUL_VERSION = 1;

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "soul_" + bytesToHex(bytes);
}

function seedNumber(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function deriveAura(id) {
  const seed = seedNumber(id);
  const palettes = ["gold-teal", "indigo-pearl", "violet-gold", "teal-pearl", "indigo-teal"];
  return {
    palette: palettes[seed % palettes.length],
    membrane: 3 + (seed % 5),
    filaments: 5 + ((seed >>> 4) % 8),
    rotation: (seed >>> 9) % 360,
    pulseMs: 6200 + ((seed >>> 14) % 5200)
  };
}

export function loadSoul() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SOUL_KEY) || "null");
    return value && value.version === SOUL_VERSION ? value : null;
  } catch {
    return null;
  }
}

export function createSoul({ journey = [], marks = [], relationships = [] } = {}) {
  if (loadSoul()) return loadSoul();
  const id = randomId();
  const soul = {
    version: SOUL_VERSION,
    id,
    createdAt: new Date().toISOString(),
    aura: deriveAura(id),
    journey: [...new Set(journey)].slice(0, 24),
    marks: [...new Set(marks)].slice(0, 48),
    relationships: [...new Set(relationships)].slice(0, 96),
    chain: null,
    economic: false
  };
  sessionStorage.setItem(SOUL_KEY, JSON.stringify(soul));
  return soul;
}

export function updateSoulSelection({ journey, marks, relationships } = {}) {
  const soul = loadSoul();
  if (!soul) return null;
  if (Array.isArray(journey)) soul.journey = [...new Set(journey)].slice(0, 24);
  if (Array.isArray(marks)) soul.marks = [...new Set(marks)].slice(0, 48);
  if (Array.isArray(relationships)) soul.relationships = [...new Set(relationships)].slice(0, 96);
  sessionStorage.setItem(SOUL_KEY, JSON.stringify(soul));
  return soul;
}

export function soulReceipt(soul = loadSoul()) {
  if (!soul) return null;
  return {
    schema: "archon.soul.receipt.v1",
    soulId: soul.id,
    createdAt: soul.createdAt,
    aura: soul.aura,
    journey: soul.journey,
    marks: soul.marks,
    relationships: soul.relationships,
    chain: soul.chain,
    economic: false,
    notice: "This Soul is a consent-created identity/provenance object, not ownership of a person and not a financial asset."
  };
}

export function dissolveLocalSoul() {
  sessionStorage.removeItem(SOUL_KEY);
}
