// Pour Down - Service Worker
// Offline çalışma ve PWA için gerekli.
// Versiyonu değiştirdiğinde eski cache temizlenir.

const CACHE_VERSION = 'pourdown-v1';
const CACHE_NAME = `pourdown-cache-${CACHE_VERSION}`;

// Cache'lenecek dosyalar
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-192-maskable.png',
    './icon-512-maskable.png',
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
];

// Kurulum: dosyaları cache'le
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // addAll tek bir dosya bile başarısız olursa hepsi düşer.
                // Bu yüzden tek tek ekliyoruz, font başarısız olursa oyun yine çalışsın.
                return Promise.all(
                    ASSETS_TO_CACHE.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn('[SW] Cache eklenemedi:', url, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Aktivasyon: eski cache'leri temizle
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('pourdown-cache-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: önce cache, yoksa network (cache-first stratejisi)
// Oyun statik olduğu için cache-first ideal.
self.addEventListener('fetch', (event) => {
    // Sadece GET isteklerini cache'le
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Cache'de yoksa network'ten al, başarılıysa cache'e ekle
                return fetch(event.request).then((networkResponse) => {
                    // Sadece başarılı ve same-origin/CORS yanıtları cache'le
                    if (networkResponse && networkResponse.status === 200 &&
                        (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Network başarısız ve cache'de yok - offline durumu
                    // Ana sayfa istemi ise ana HTML'i döndür
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
