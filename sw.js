const CACHE_NAME = 'japan-trip-v8';
const ASSETS = ['/japan-trip-planner/', '/japan-trip-planner/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())  // 立刻接管，不等舊SW關閉
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())  // 立刻控制所有頁面
  );
});

self.addEventListener('fetch', e => {
  // API 請求不快取，直接過
  if (e.request.url.includes('srv790689.hstgr.cloud')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
