const CACHE_NAME = 'nevengi-v3';
const urlsToCache = [
  // Main site files
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
  '/coach_dashboard.html',
  // React chat build files
  '/powerhouses-react/build/index.html',
  '/powerhouses-react/build/asset-manifest.json',
  '/powerhouses-react/build/robots.txt',
  '/powerhouses-react/build/logo512.png',
  '/powerhouses-react/build/logo192.png',
  '/powerhouses-react/build/manifest.json',
  '/powerhouses-react/build/favicon.ico',
  '/powerhouses-react/build/static/js/main.bec1f3d7.js',
  '/powerhouses-react/build/static/js/453.ef9f2792.chunk.js',
  '/powerhouses-react/build/static/css/main.17c42e5c.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bypass API/auth
  if (
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/api/') ||
    url.searchParams.has('code') ||
    url.searchParams.has('token') ||
    url.searchParams.has('state') ||
    event.request.headers.get('Authorization') ||
    url.pathname.includes('discord.com') ||
    url.pathname.includes('oauth2')
  ) {
    return fetch(event.request);
  }

  // SPA fallback for React chat
  if (
    url.pathname.startsWith('/powerhouses-react/build/') &&
    !url.pathname.match(/\.[a-zA-Z0-9]+$/) // not a file with extension
  ) {
    event.respondWith(
      caches.match('/powerhouses-react/build/index.html').then(response => response || fetch(event.request))
    );
    return;
  }

  // Default: cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
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