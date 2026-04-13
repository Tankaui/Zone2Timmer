// 每次有修改 index.html，這裡的版號就一定要跟著改
const CACHE_NAME = 'zone2-cache-v45.8.5'; 
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // 強制新的 Service Worker 立刻安裝，不要等待舊的頁面關閉
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 新增 activate 事件：這是用來清理垃圾的關鍵
self.addEventListener('activate', event => {
  event.waitUntil(
    // 讓新的 Service Worker 立刻取得頁面的控制權
    clients.claim().then(() => {
      // 檢查所有的快取，只要名字跟當前的 CACHE_NAME 不一樣，就全部刪除
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('清除舊快取:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取裡有，就拿快取的；沒有再去網路抓
        if (response) return response;
        return fetch(event.request);
      })
  );
});
