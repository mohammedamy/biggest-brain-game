/**
 * EIS Mental Math — Service Worker
 * Provides offline caching for the game
 */

const CACHE_NAME = 'eis-brain-v7';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './css/responsive.css',
  './css/challenge.css',
  './js/config.js',
  './js/state.js',
  './js/audio.js',
  './js/ui.js',
  './js/preferences.js',
  './js/game.js',
  './js/challenge.js',
  './js/categories/calculate.js',
  './js/categories/memorize.js',
  './js/categories/analyze.js',
  './js/categories/visualize.js',
  './js/categories/weigh.js',
  './js/categories/countup.js',
  './js/categories/react.js',
  './js/leaderboard.js',
  './assets/eis-logo.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      }).catch(() => caches.match(event.request));
    })
  );
});
