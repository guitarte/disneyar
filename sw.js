// Offline support: the app shell and the last wait times keep working with no signal.
const CACHE = 'disneyar-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];
const LIB = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => {
    c.add(LIB).catch(() => {});   // not awaited: a slow CDN must not hold up install; the fetch handler caches it on first use anyway
    return Promise.allSettled(SHELL.map((u) => c.add(u)));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; };

self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isData = sameOrigin && /(waits|history)\.json$/.test(url.pathname);
  const isLib = url.hostname === 'cdn.jsdelivr.net' || url.hostname.startsWith('fonts.');
  if (isData) {            // freshest data first; the cached copy (ignoring the cache-busting query) when offline
    e.respondWith(fetch(req).then((res) => put(url.origin + url.pathname, res)).catch(() => caches.match(url.origin + url.pathname)));
  } else if (isLib) {      // pinned library and fonts never change
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
  } else if (sameOrigin) { // the app itself: network first so updates land, cache when offline
    e.respondWith(fetch(req).then((res) => put(req, res)).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))));
  }
});
