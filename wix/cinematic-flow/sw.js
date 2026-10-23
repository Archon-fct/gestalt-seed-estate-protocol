const CACHE = 'archon-flow-review-20261023-v2';
const SHELL = ['./index.html', './archon-living-nexus.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('archon-flow-review-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 const scope = new URL(self.registration.scope);
 if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
 const name = url.pathname.slice(scope.pathname.length);
 if (!['','index.html','archon-living-nexus.js','manifest.json','icon-192.png','icon-512.png'].includes(name)) return;
 // Only this public review shell is cached. Booking, forms, shop and account traffic bypass it.
 event.respondWith(fetch(event.request).catch(() => caches.match(new URL(name || 'index.html', scope).href).then(cached => cached || Response.error())));
});
