// Archon Soulings — opt-in spatial atmosphere v0.2
// Audio is created only in response to an explicit action.
// A later Silence or page exit cancels any pending asynchronous start.
let ctx = null;
let nodes = [];
let requestVersion = 0;

const worlds = {
  aura: { base: 174, over: 261, depth: .018 },
  services: { base: 146, over: 220, depth: .012 },
  gestalt: { base: 196, over: 392, depth: .014 },
  journal: { base: 130, over: 195, depth: .010 },
  workshops: { base: 164, over: 246, depth: .015 },
  aureglossa: { base: 220, over: 330, depth: .012 },
  nexus: { base: 110, over: 220, depth: .008 }
};

function stopNodes() {
  for (const node of nodes) {
    try { node.stop?.(); } catch {}
    try { node.disconnect?.(); } catch {}
  }
  nodes = [];
}

export async function enterAtmosphere(world) {
  if (!Object.hasOwn(worlds, world)) return false;
  const version = ++requestVersion;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  try {
    ctx ||= new AudioContextClass();
    await ctx.resume();
    if (version !== requestVersion || document.hidden) return false;

    stopNodes();
    const settings = worlds[world];
    const master = ctx.createGain();
    master.gain.value = settings.depth;
    master.connect(ctx.destination);
    nodes.push(master);

    for (const [index, frequency] of [settings.base, settings.over].entries()) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index ? .24 : .5;
      oscillator.connect(gain).connect(master);
      // Register before starting so Silence can stop even if later setup fails.
      nodes.push(oscillator, gain);
      if (version !== requestVersion || document.hidden) {
        stopNodes();
        return false;
      }
      oscillator.start();
    }
    return true;
  } catch {
    stopNodes();
    return false;
  }
}

export function silence() {
  ++requestVersion;
  stopNodes();
  if (ctx && ctx.state !== "closed") {
    // Silent immediately because no source nodes remain, even if suspend is pending.
    void ctx.suspend().catch(() => {});
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) silence();
  });
  window.addEventListener("pagehide", silence);
}
