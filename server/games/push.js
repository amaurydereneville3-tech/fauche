// Notifications sur le téléphone (web push) : coffre du jour, prêts, duels, classement… même appli fermée.
const webpush = require('web-push');
const C = require('../core');
const db = require('../db');
const { E } = C;
let READY = false, PUB = '';
(async () => { try {
  let k = process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE ? { publicKey: process.env.VAPID_PUBLIC, privateKey: process.env.VAPID_PRIVATE } : await db.kvGet('vapid');
  if (!k) { k = webpush.generateVAPIDKeys(); await db.kvSet('vapid', k); }
  webpush.setVapidDetails('mailto:contact@fauche.app', k.publicKey, k.privateKey); PUB = k.publicKey; READY = true; } catch (e) { console.error('push', e.message); } })();
async function pushTo(u, title, body, url = '/') { if (!READY || !(u.d.push || []).length) return; const payload = JSON.stringify({ title, body, url });
  const keep = []; for (const s of u.d.push) { try { await webpush.sendNotification(s, payload, { TTL: 3600 }); keep.push(s); } catch (e) { if (e.statusCode !== 404 && e.statusCode !== 410) keep.push(s); } }
  if (keep.length !== u.d.push.length) { u.d.push = keep; C.markDirty(u); } }
C.pushTo = pushTo;
C.api.pushKey = () => { if (!READY) throw E('Notifications indisponibles pour le moment.'); return { key: PUB }; };
C.api.pushSub = async (u, p) => { const s = p.sub; if (!s || typeof s.endpoint !== 'string' || !s.keys) throw E('Abonnement invalide.'); u.d.push = (u.d.push || []).filter(x => x.endpoint !== s.endpoint).slice(-2); u.d.push.push({ endpoint: s.endpoint, keys: s.keys });
  const L = (await db.kvGet('pushers')) || {}; L[u.id] = 1; await db.kvSet('pushers', L); pushTo(u, 'Fauché', 'Notifications activées ! On te prévient quand il se passe un truc. 👑'); return {}; };
C.api.pushOff = async u => { u.d.push = []; const L = (await db.kvGet('pushers')) || {}; delete L[u.id]; await db.kvSet('pushers', L); return {}; };
const _notify = C.notify;
C.notify = (u, n) => { _notify(u, n); if (!u.sockets.size && n.keep) pushTo(u, n.from || 'Fauché', String(n.body || '').replace(/<[^>]+>/g, '')); };
let lastRemind = '';
setInterval(async () => { const p = C.parisNow(); if (p.h !== 18 || p.m > 3 || lastRemind === p.date) return; lastRemind = p.date;
  const L = (await db.kvGet('pushers')) || {}; for (const id of Object.keys(L)) { const u = await C.getUser(+id); if (!u || u.sockets.size) continue;
    if (u.d.daily.chest !== p.date) pushTo(u, '🎁 Ton coffre du jour t\'attend', 'Ouvre-le avant minuit' + (u.d.streak && u.d.streak.n ? ' pour garder ta série de ' + u.d.streak.n + ' jours 🔥' : ' !')); } }, 60000);
