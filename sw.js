const CACHE_NAME = 'japan-trip-v14';
const ASSETS = ['/japan-trip-planner/', '/japan-trip-planner/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // API 請求不快取
  if (e.request.url.includes('srv790689.hstgr.cloud')) {
    e.respondWith(fetch(e.request));
    return;
  }

  const url = new URL(e.request.url);
  const isHtml = url.pathname.endsWith('/') || url.pathname.endsWith('.html');

  if (isHtml) {
    // HTML：網路優先 → 同時更新快取 → 斷網才 fallback
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 其他資源：快取優先
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
