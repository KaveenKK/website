const CACHE_NAME = 'nevengi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/images/glowinglogonowback.webp',
  '/images/mascot.webp',
  '/images/coach tranforamtion.png',
  '/images/18plus.webp',
  '/images/followers.webp',
  '/images/niche.webp',
  '/images/accountability.webp',
  '/images/advice.webp',
  '/images/socialmediacontent.webp',
  '/images/colombian.gif',
  '/images/mentorship.gif',
  '/images/manthink.jpg',
  '/images/mylogo_nevengi_circle.webp',
  '/images/companyoffer.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 