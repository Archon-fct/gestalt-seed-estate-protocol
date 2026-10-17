// Page code for the existing Wix Editor site's /living-nexus page ONLY.
// Element ID: #livingNexus. Tag: archon-living-nexus.
// No credentials, owner API calls, global snippets, or visitor network requests.
// API contracts: Wix custom-element/handle-events and wix-location-frontend/query.
import wixLocationFrontend from 'wix-location-frontend';

const WORLDS = new Set(['nexus', 'aura', 'aureglossa', 'sessions', 'workshops', 'gestalt', 'journal', 'threshold']);
const BASE = 'https://www.archonsoulings.com/living-nexus';

$w.onReady(() => {
  const element = $w('#livingNexus');
  let current = 'nexus';
  const applyRoute = () => {
    const requested = wixLocationFrontend.query.world;
    const world = typeof requested === 'string' && WORLDS.has(requested) ? requested : 'nexus';
    current = world;
    element.setAttribute('world', world);
  };
  element.setAttribute('route-base', BASE);
  element.on('nexus-route', event => {
    const world = event.detail?.world;
    if (typeof world !== 'string' || !WORLDS.has(world) || world === current) return;
    current = world;
    if (world === 'nexus') wixLocationFrontend.queryParams.remove(['world']);
    else wixLocationFrontend.queryParams.add({ world });
  });
  wixLocationFrontend.onChange(applyRoute);
  applyRoute();
});
