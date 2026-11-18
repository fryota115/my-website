// ファイルを更新したときはキャッシュ名のバージョンも変更してください。
const CACHE_PREFIX = 'my-website-task-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const BASE_PATH = '/my-website/';
const APP_FILES = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}style.css`,
  `${BASE_PATH}script.js`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}icons/apple-touch-icon.png`
];

self.addEventListener('install', event => {
  // 一式の保存が成功してから使用開始します。
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // このアプリのGETリクエストだけを処理します。
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(BASE_PATH)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(`${BASE_PATH}index.html`);
      }
    })());
    return;
  }

  if (!APP_FILES.includes(url.pathname)) return;
  // 同じバージョンのCSS・JSを使い、オフラインでも画面を表示します。
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(url.pathname) || fetch(event.request);
  })());
});
