// Living Field Adaptive Quality Controller v0.1
// Progressive enhancement only. Does not change navigation, store private data, or make network calls.
// Import from the existing HUD after functional and visual acceptance.
export function createLivingFieldQualityController({
  root = document.documentElement,
  onQualityChange = () => {},
  storage = null
} = {}) {
  const allowed = new Set(['still', 'low', 'balanced', 'high']);
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let override = null;
  let current = null;
  let raf = 0;
  let frames = [];
  let last = 0;
  let running = false;
  const nav = navigator;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  function baseline() {
    if (mq.matches) return 'still';
    if (connection?.saveData) return 'low';
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;
    return cores <= 2 || memory <= 2 ? 'low' : cores >= 8 && memory >= 8 ? 'high' : 'balanced';
  }
  function apply(next) {
    if (!allowed.has(next)) return;
    if (next === current) return;
    current = next;
    root.dataset.livingQuality = next;
    onQualityChange(next);
  }
  function choose() {
    // System reduced motion is a hard ceiling, including user overrides.
    apply(mq.matches ? 'still' : (override || baseline()));
  }
  function tick(now) {
    if (!running) return;
    if (last) {
      const delta = now - last;
      if (delta > 0 && delta < 1000) frames.push(delta);
      if (frames.length > 120) frames.shift();
      if (frames.length >= 90 && !override && current === 'high') {
        const sorted = [...frames].sort((a,b)=>a-b);
        if (sorted[Math.floor(sorted.length * .9)] > 32) apply('balanced');
      }
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(raf); raf=0; last=0; }
    else if (running && !raf) raf=requestAnimationFrame(tick);
  }
  function setOverride(value) {
    override = value === null ? null : allowed.has(value) ? value : override;
    choose();
  }
  function start() {
    if (running) return;
    running=true; choose();
    document.addEventListener('visibilitychange',visibility);
    if (mq.addEventListener) mq.addEventListener('change',choose);
    else mq.addListener(choose);
    visibility();
  }
  function stop() {
    running=false;cancelAnimationFrame(raf);raf=0;last=0;frames=[];
    document.removeEventListener('visibilitychange',visibility);
    if (mq.removeEventListener) mq.removeEventListener('change',choose);
    else mq.removeListener(choose);
  }
  return { start, stop, setOverride, get quality(){return current;} };
}
