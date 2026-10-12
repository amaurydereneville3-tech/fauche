// Fauché — serveur en ligne
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const db = require('./db');
const C = require('./core');

C.api = {};
C.hello = []; // chaque module ajoute ce qu'un joueur reçoit en se connectant

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h', setHeaders: (res, f) => { if (f.endsWith('.html') || f.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache'); } }));
app.get('/sante', (req, res) => res.send('ok'));

let SECRET = process.env.JWT_SECRET || null;
const tries = new Map();
function limited(ip) { const now = Date.now(); const t = (tries.get(ip) || []).filter(x => now - x < 60000); t.push(now); tries.set(ip, t); return t.length > 12; }
const PSEUDO = /^[A-Za-z0-9_\-]{3,16}$/;
const sign = id => jwt.sign({ id }, SECRET, { expiresIn: '60d' });

app.post('/api/register', async (req, res) => {
  try {
    if (limited(req.ip)) return res.status(429).json({ err: 'Trop d\'essais. Attends une minute.' });
    const { pseudo, pass, age } = req.body || {};
    if (!PSEUDO.test(pseudo || '')) return res.status(400).json({ err: 'Pseudo : 3 à 16 caractères (lettres, chiffres, _ ou -).' });
    if (typeof pass !== 'string' || pass.length < 6 || pass.length > 100) return res.status(400).json({ err: 'Mot de passe : 6 caractères minimum.' });
    if (age !== true) return res.status(400).json({ err: 'Tu dois avoir 18 ans ou plus pour jouer.' });
    if (await db.findByPseudo(pseudo.toLowerCase())) return res.status(409).json({ err: 'Ce pseudo est déjà pris.' });
    const hash = await bcrypt.hash(pass, 10);
    const id = await db.createUser(pseudo, hash, C.freshData());
    C.feed(`<b>${C.esc(pseudo)}</b> vient d'arriver au casino`); if (C.onRegister) await C.onRegister(id, pseudo);
    res.json({ token: sign(id), pseudo });
  } catch (e) { console.error(e); res.status(500).json({ err: 'Erreur serveur, réessaie.' }); }
});
app.post('/api/login', async (req, res) => {
  try {
    if (limited(req.ip)) return res.status(429).json({ err: 'Trop d\'essais. Attends une minute.' });
    const { pseudo, pass } = req.body || {};
    const row = await db.findByPseudo(String(pseudo || '').toLowerCase());
    if (!row || !(await bcrypt.compare(String(pass || ''), row.pass))) return res.status(401).json({ err: 'Pseudo ou mot de passe incorrect.' });
    res.json({ token: sign(row.id), pseudo: row.pseudo });
  } catch (e) { console.error(e); res.status(500).json({ err: 'Erreur serveur, réessaie.' }); }
});

const server = http.createServer(app);
const io = new Server(server, { pingInterval: 20000, pingTimeout: 20000 });
C.io = io;

io.use((socket, next) => {
  try { const t = socket.handshake.auth && socket.handshake.auth.token; const p = jwt.verify(t, SECRET); socket.uid = p.id; next(); }
  catch (e) { next(new Error('auth')); }
});

let onlineT = null;
function online() { const list = []; C.users.forEach(u => { if (u.sockets.size) list.push({ id: u.id, pseudo: u.pseudo, face: u.d.av.face, av: u.d.av.v2, acc: u.d.av.acc, lvl: C.LV(u), cr: C.isAdmin(u) }); }); return list; }
function broadcastOnline() { clearTimeout(onlineT); onlineT = setTimeout(() => io.emit('online', online()), 300); }
C.online = online;

io.on('connection', async socket => {
  const u = await C.getUser(socket.uid);
  if (!u) { socket.emit('logout'); return socket.disconnect(); }
  if (C.isBanned && C.isBanned(u)) { socket.emit('banned', { until: u.d.bannedUntil }); return socket.disconnect(); }
  u.sockets.add(socket); u.lastSeen = Date.now();
  socket.emit('me', C.pub(u));
  const hello = { feed: C.feedList, online: online() };
  C.hello.forEach(f => Object.assign(hello, f(u, socket)));
  socket.emit('hello', hello);
  if (u.d.inbox && u.d.inbox.length) { setTimeout(() => { (u.d.inbox || []).forEach(n => socket.emit('notif', n)); u.d.inbox = []; C.markDirty(u); }, 1500); }
  broadcastOnline();
  let calls = []; // limite : 30 actions par seconde
  socket.on('api', async (name, payload, cb) => {
    if (typeof cb !== 'function') return;
    const now = Date.now(); calls = calls.filter(t => now - t < 1000); calls.push(now);
    if (calls.length > 30) return cb({ ok: 0, err: 'Doucement !' });
    const fn = C.api[name];
    if (!fn) return cb({ ok: 0, err: 'Action inconnue.' });
    try { const r = await fn(u, payload || {}, socket); C.markDirty(u); C.push(u); cb({ ok: 1, r: r || {} }); }
    catch (e) { if (!(e instanceof C.GameError)) console.error(name, e); cb({ ok: 0, err: e instanceof C.GameError ? e.message : 'Erreur serveur.' }); }
  });
  socket.on('disconnect', () => { u.sockets.delete(socket); u.lastSeen = Date.now(); C.leave && C.leave.forEach(f => f(u, socket)); C.saveUserNow(u); broadcastOnline(); });
});

async function start() {
  await db.init();
  if (!SECRET) { SECRET = await db.kvGet('secret'); if (!SECRET) { SECRET = crypto.randomBytes(32).toString('hex'); await db.kvSet('secret', SECRET); } }
  ['live', 'poker', 'blackjack', 'solo', 'sport', 'business', 'shop', 'social', 'casino2', 'extras', 'account', 'v6games', 'v6social', 'push'].forEach(m => require('./games/' + m));
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log('Fauché en ligne sur le port ' + port));
}
start();
const stop = async () => { await Promise.all([...C.users.values()].map(u => C.saveUserNow(u))); require('./db').flushNow(); process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
