// Service worker : permet d'installer Fauché comme une appli et de recevoir les notifications. Toujours le réseau d'abord.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || e.request.url.includes('/socket.io/')) return; e.respondWith(fetch(e.request).catch(() => new Response('<h1 style="font-family:sans-serif;color:#f2c14e;background:#0f0a12;padding:40px">Pas de connexion. Réessaie dans un instant.</h1>', { headers: { 'content-type': 'text/html; charset=utf-8' } }))); });
self.addEventListener('push', e => { let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Fauché', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Fauché', { body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', data: { url: d.url || '/' } })); });
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => { for (const c of l) { if ('focus' in c) return c.focus(); } return clients.openWindow(e.notification.data.url || '/'); })); });
