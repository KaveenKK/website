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
  '/images/companyoffer.png',
  '/user_dashboard.html',
  '/coach_dashboard.html'
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
  const url = new URL(event.request.url);
  
  // For OAuth flows, completely bypass the service worker
  if (url.pathname.includes('/auth/') || 
      url.pathname.includes('/api/') ||
      url.searchParams.has('code') ||
      url.searchParams.has('token') ||
      url.searchParams.has('state') ||
      event.request.headers.get('Authorization') ||
      url.pathname.includes('discord.com') ||
      url.pathname.includes('oauth2')) {
    // Unregister the service worker during OAuth flow
    if (url.searchParams.has('code')) {
      self.registration.unregister();
    }
    return fetch(event.request);
  }

  // For all other requests, try cache first, then network
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

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clear cache on activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 