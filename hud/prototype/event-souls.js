// Event Souls v0.1 — anonymous, browser-local provenance of meaningful interactions.
// Event Souls are NOT currency, do not identify a person, and do not mint Souls tokens.

const KEY = "archonEventSouls.v1";
const MAX_EVENTS = 128;

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function randomEventId() {
  const bytes = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return "event_" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

const WEIGHTS = Object.freeze({
  WORLD_ENTERED: 1,
  JOURNEY_SAVED: 2,
  PROVENANCE_EXPLORED: 3,
  PRACTICE_COMPLETED: 4,
  SOUL_CREATED: 5,
  STONE_APPROVED: 12,
  WORKSHOP_VERIFIED: 16
});

export function recordEventSoul(type, { world = null, relation = null, publicRef = null } = {}) {
  if (!Object.prototype.hasOwnProperty.call(WEIGHTS, type)) return null;
  const event = {
    schema: "archon.event-soul.v1",
    id: randomEventId(),
    occurredAt: new Date().toISOString(),
    type,
    world,
    relation,
    publicRef,
    growthWeight: WEIGHTS[type],
    economic: false,
    chain: null
  };
  const events = read();
  events.push(event);
  localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  return event;
}

export function eventSouls() {
  return read();
}

export function estateGrowthSnapshot() {
  const events = read();
  return {
    eventCount: events.length,
    growthWeight: events.reduce((sum, event) => sum + (Number(event.growthWeight) || 0), 0),
    monetaryValue: null,
    notice: "Growth weight is provenance/participation accounting only. It is not money, a token balance, or a promise of future value."
  };
}

export function dissolveLocalEventSouls() {
  localStorage.removeItem(KEY);
}
