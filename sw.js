/* Darin Video AI: mở lại nhanh và dùng được khi mất mạng (giao diện). Luôn thử tải bản mới từ mạng trước. */
const V = 'darin-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;               // CDN, Google Fonts, API: để trình duyệt tự xử lý
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok && res.status === 200) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
