// Cœur du jeu : joueurs en mémoire, argent, XP, missions, succès, notifications.
const db = require('./db');
const D = require('../public/data6');

const C = { io: null, users: new Map(), feedList: [], market: null, events: {} };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
class GameError extends Error {}
const E = m => new GameError(m);
const fr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
function eur(n) { const a = Math.abs(n); let t; if (a >= 1e9) t = (n / 1e9).toFixed(1).replace('.', ',') + ' Md'; else if (a >= 1e6) t = (n / 1e6).toFixed(a >= 1e7 ? 0 : 2).replace('.', ',') + ' M'; else t = fr.format(Math.round(n)); return t + ' €'; }
function parisNow() { const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()); const g = t => p.find(x => x.type === t).value; return { date: `${g('year')}-${g('month')}-${g('day')}`, h: +g('hour') % 24, m: +g('minute') }; }
function seeded(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }

function freshData() {
  return { cash: 1000, debt: 0, fdebts: [], lent: [], loanReq: [], items: [], boosts: { requin: 0, parrain: 0, flambeur: 0 }, cafeUntil: 0, xpBoostUntil: 0, suspectUntil: 0, boostLog: [], banUntil: 0,
    pos: [], slips: [], wins: 0, losses: 0, best: 0, played: 0, gp: {}, streakW: 0, streakL: 0, maxLoss: 0, bankrupt: 0, broke: false, liq: 0, greedy: 0, hungUp: 0, seized: 0, bestJob: 0,
    auctionsWon: 0, lotoBest: 0, pkWins: 0, chats: 0, xp: 0, ach: [], mis: null, daily: { chest: '', wheel: '' }, biz: [], lastCollect: Date.now(), albums: [], lastDaron: 0,
    av: { face: '🙂', acc: '', v2: null }, bio: '', pseudoAt: 0, bannedUntil: 0, wk: null, card: { col: 0, mot: 'lisse' }, theme: 'monaco', room: { wall: 0 }, loto: null, embrouille: false,
    pass: { xp: 0, claimed: [] }, wmis: null, wgames: [], hist: [], day: { date: '', net: 0, games: 0, best: 0 }, titleSel: '', tutoDone: false, bizLv: {}, freeCr: { b: 0, a: 0, o: 0 }, unlocks: [], pet: null, crates: 0,
    streak: { last: '', n: 0 }, vpRoyal: 0, heists: 0, heistOk: 0, jail: 0, tourBest: 0, tourWins: 0, street: { w: 0, l: 0 }, jackpots: 0, exPaid: 0, cp: null };
}

// ---------- Joueurs en mémoire ----------
async function getUser(id) {
  let u = C.users.get(id);
  if (u) return u;
  const row = await db.loadUser(id);
  if (!row) return null;
  u = { id: row.id, pseudo: row.pseudo, d: Object.assign(freshData(), row.data), sockets: new Set(), dirty: false, s: {} };
  C.users.set(id, u);
  if (!u.d.av.v2) u.d.av.v2 = D.avRandom(u.id);
  onLoad(u);
  return u;
}
function onLoad(u) { // remboursement des paris sportifs interrompus par un redémarrage
  const pend = u.d.slips.filter(s => !s.done);
  if (pend.length && !C.sport.knows(pend)) { pend.forEach(s => { s.done = true; s.res = 'refund'; u.d.cash += s.amt; }); markDirty(u); }
}
function markDirty(u) { u.dirty = true; }
async function saveUserNow(u) { if (!u.dirty) return; u.dirty = false; u.d.worth = worth(u); try { await db.saveUser(u.id, u.d, u.d.worth); } catch (e) { u.dirty = true; console.error('save', e.message); } }
setInterval(() => { C.users.forEach(u => { saveUserNow(u); if (!u.sockets.size && Date.now() - (u.lastSeen || 0) > 120000 && !u.dirty && !u.locked) C.users.delete(u.id); }); }, 15000);
async function withUser(id, fn) { const u = await getUser(id); if (!u) return null; const r = fn(u); markDirty(u); push(u); return r; }

// ---------- Valeur et statut ----------
function itemsValue(d) { return d.items.reduce((s, id) => s + ((D.itemInfo(id) || {}).pr || 0), 0); }
function bizValue(d) { return d.biz.reduce((s, id) => s + ((D.BIZ.find(b => b.id === id) || {}).pr || 0) * .7, 0); }
function posValue(p) { const px = C.market ? C.market.price(p.a) : p.entry; return Math.max(0, p.margin + p.margin * p.lev * p.side * (px / p.entry - 1)); }
function owed(d) { return d.debt + d.fdebts.reduce((s, x) => s + x.owed, 0); }
function escrow(u) { return C.escrow ? C.escrow(u) : 0; }
function worth(u) { const d = u.d; return Math.round(d.cash + itemsValue(d) + bizValue(d) + d.pos.reduce((s, p) => s + posValue(p), 0) + escrow(u) + d.lent.reduce((s, x) => s + x.owed, 0) - owed(d)); }
function tierIdx(u) { const w = worth(u); let i = 0; D.TIERS.forEach((t, k) => { if (w >= t.min) i = k; }); return i; }
const LV = u => D.levelOf(u.d.xp).l;

// ---------- Envoi au navigateur ----------
function pub(u) { const d = u.d; return { ...d, id: u.id, pseudo: u.pseudo, admin: C.isAdmin(u), happyUntil: C.events.happyUntil || 0, worth: worth(u), tier: tierIdx(u), lvl: LV(u), income: incomePerHour(d), pending: pending(d), now: Date.now() }; }
const pushT = new Map();
function push(u) { if (!u.sockets.size || pushT.has(u.id)) return; pushT.set(u.id, setTimeout(() => { pushT.delete(u.id); u.sockets.forEach(s => s.emit('me', pub(u))); }, 30)); }
function notify(u, n) { u.sockets.forEach(s => s.emit('notif', n)); if (!u.sockets.size && n.keep) { u.d.inbox = (u.d.inbox || []).slice(-9); u.d.inbox.push(n); markDirty(u); } }
function feed(html) { C.feedList.unshift(html); C.feedList.length = Math.min(C.feedList.length, 30); if (C.io) C.io.emit('feed', html); }

// ---------- Argent ----------
function int(n) { n = Math.floor(Number(n)); if (!Number.isFinite(n) || n < 1) throw E('Montant invalide.'); return n; }
function pay(u, amt) { amt = int(amt); if (u.d.cash < amt) throw E('Pas assez d\'argent. Passe à la banque !'); money(u, -amt); return amt; }
function money(u, delta) {
  const before = tierIdx(u);
  u.d.cash = Math.max(0, Math.round(u.d.cash + delta));
  if (delta > 0) u.d.best = Math.max(u.d.best, delta);
  markDirty(u); push(u);
  const after = tierIdx(u);
  if (after > before) { notify(u, { ic: '💳', from: 'Fauché', body: 'Nouvelle carte débloquée : ' + D.TIERS[after].name + ' !', big: 1 }); feed(`<b>${esc(u.pseudo)}</b> passe en carte ${D.TIERS[after].name}`); checkAch(u); }
  checkBroke(u);
}
function checkBroke(u) { const d = u.d; if (d.broke) { if (d.cash >= 10) d.broke = false; return; } if (d.cash < 10 && !d.items.length && !d.pos.length && !d.biz.length && !(u.s.busy)) { d.broke = true; d.bankrupt++; checkAch(u); feed(`<b>${esc(u.pseudo)}</b> a fait faillite`); u.sockets.forEach(s => s.emit('broke')); } }
function casinoWin(u, profit) {
  if (profit <= 0 || u.d.boosts.parrain <= 0) return 0;
  u.d.boosts.parrain--; const bonus = Math.round(profit * .5);
  if (Math.random() < .2) setTimeout(() => { const f = Math.round(u.d.cash * .05); money(u, -f); notify(u, { ic: '🕵️', from: 'Sécurité du casino', body: 'Fouille surprise : −' + eur(f) }); }, 1500);
  return bonus;
}

// ---------- XP, missions, succès ----------
function xp(u, n) { const b = LV(u); u.d.xp += Math.round(n * (u.d.xpBoostUntil > Date.now() ? 2 : 1) * (D.petOn(u.d, 'parrot') ? 1.2 : 1)); u.d.pass.xp += Math.round(n); const a = LV(u);
  if (a > b) { const g = Object.entries(D.GLV).filter(([k, l]) => l > b && l <= a).map(([k]) => k); notify(u, { ic: '⭐', from: 'Niveau ' + a, body: 'Nouveau titre : ' + D.title(a) + (g.length ? ' · nouveau jeu débloqué !' : ''), big: 1, snd: 'level', go: g.length ? 'game:' + g[0] : '' }); feed(`<b>${esc(u.pseudo)}</b> passe niveau ${a}`); } markDirty(u); }
function weekKey() { const p = parisNow(); const d = new Date(p.date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
function weekMissions(u) { const w = weekKey(); if (!u.d.wmis || u.d.wmis.week !== w) { const r = seeded('w' + w + u.id); const pool = [...D.WMIS]; const list = []; while (list.length < 3) list.push(pool.splice(r() * pool.length | 0, 1)[0].id); u.d.wmis = { week: w, list: list.map(id => ({ id, p: 0, c: false })) }; u.d.wgames = [w]; markDirty(u); } return u.d.wmis.list; }
function dkeyParis() { return parisNow().date; }
function todayMissions(u) { const d = dkeyParis(); if (!u.d.mis || u.d.mis.date !== d) { const r = seeded('m' + d + u.id); const pool = [...D.MISSIONS]; const list = []; while (list.length < 3) list.push(pool.splice(r() * pool.length | 0, 1)[0].id); u.d.mis = { date: d, list: list.map(id => ({ id, p: 0, c: false })) }; markDirty(u); } return u.d.mis.list; }
function track(u, type, g, v) { todayMissions(u).forEach(m => { const M = D.MISSIONS.find(x => x.id === m.id); if (!M || M.type !== type || m.c) return; if (M.g && M.g !== g) return; const was = m.p >= M.n; m.p = type === 'mult' ? Math.max(m.p, v) : m.p + v; if (!was && m.p >= M.n) notify(u, { ic: '🎯', from: 'Mission accomplie', body: M.t + ' · récompense à récupérer', go: 'missions' }); });
  weekMissions(u).forEach(m => { const M = D.WMIS.find(x => x.id === m.id); if (!M || m.c) return; const was = m.p >= M.n;
    if (M.type === 'div') m.p = Math.max(0, (u.d.wgames || []).length - 1); else { if (M.type !== type) return; if (M.g && M.g !== g) return; if (M.gs && !M.gs.includes(g)) return; m.p = type === 'mult' ? Math.max(m.p, v) : m.p + v; }
    if (!was && m.p >= M.n) notify(u, { ic: '🏅', from: 'Mission de la semaine', body: M.t + ' · récompense à récupérer', go: 'missions' }); }); markDirty(u); }
const ACHF = {
  first: d => d.played >= 1, win10: d => d.wins >= 10, win100: d => d.wins >= 100, streak5: d => d.streakW >= 5, gold: (d, u) => tierIdx(u) >= 1, plat: (d, u) => tierIdx(u) >= 2, black: (d, u) => tierIdx(u) >= 3,
  boss: d => d.biz.length >= 3, col: d => d.albums.length >= 1, auc: d => d.auctionsWon >= 1, loto: d => d.lotoBest >= 4, job50: d => d.bestJob >= 50, lvl10: (d, u) => LV(u) >= 10, pkwin: d => d.pkWins >= 1, social: d => d.chats >= 20,
  broke: d => d.bankrupt >= 1, broke3: d => d.bankrupt >= 3, loss1k: d => d.maxLoss >= 1000, loss1m: d => d.maxLoss >= 1e6, cursed: d => d.streakL >= 5, owe3: d => new Set(d.fdebts.map(x => x.to)).size >= 3,
  liq: d => d.liq >= 1, greedy: d => d.greedy >= 1, hung: d => d.hungUp >= 1, seized: d => d.seized >= 1,
  royal: d => d.vpRoyal >= 1, heist: d => d.heistOk >= 1, champ: d => d.tourWins >= 1, pet: d => !!d.pet, crate1: d => d.crates >= 1, streak7: d => d.streak.n >= 7, jackpot: d => d.jackpots >= 1, jail: d => d.jail >= 1, crate10: d => d.crates >= 10, ex: d => d.exPaid >= 1 };
function checkAch(u) { D.ACH.forEach(a => { if (!u.d.ach.includes(a.id) && ACHF[a.id] && ACHF[a.id](u.d, u)) { u.d.ach.push(a.id); xp(u, 40); notify(u, { ic: a.ic, from: a.sh ? 'Succès honteux débloqué' : 'Succès débloqué', body: a.nm }); if (a.sh) feed(`<b>${esc(u.pseudo)}</b> débloque « ${a.nm} »`); } }); }
function result(u, game, stake, payout, extra = {}) {
  const d = u.d, net = payout - stake; d.played++; C.stat && C.stat(u, game); d.gp[game] = (d.gp[game] || 0) + 1;
  d.hist.unshift({ g: game, s: Math.round(stake), p: Math.round(payout), t: Date.now() }); if (d.hist.length > 60) d.hist.length = 60;
  const dk = dkeyParis(); if (d.day.date !== dk) d.day = { date: dk, net: 0, games: 0, best: 0 }; d.day.net += net; d.day.games++; d.day.best = Math.max(d.day.best, net);
  weekMissions(u); if (!d.wgames.includes(game)) d.wgames.push(game);
  u.sockets.forEach(s => s.emit('res', { game, stake: Math.round(stake), pay: Math.round(payout) }));
  xp(u, 6 + Math.min(30, Math.round(Math.log10(stake + 1) * 5))); track(u, 'play', game, 1);
  if (extra.mult) track(u, 'mult', game, extra.mult);
  if (net > 0) { d.wins++; d.streakW++; d.streakL = 0; xp(u, 6); track(u, 'win', game, 1); track(u, 'profit', null, net); if (net >= 1000) feed(`<b>${esc(u.pseudo)}</b> gagne ${eur(net)} ${D.GN[game] || ''}`);
    let bonus = 0; if (game === D.luckyGame(dk)) bonus += Math.round(net * .1); if ((C.events.happyUntil || 0) > Date.now() && game !== 'job') bonus += net; if (D.petOn(d, 'cat') && game !== 'job') bonus += Math.round(net * .05); if (D.petOn(d, 'pig')) d.pet.bank = (d.pet.bank || 0) + Math.round(net * .03);
    if (bonus > 0) setTimeout(() => { money(u, bonus); notify(u, { ic: (C.events.happyUntil || 0) > Date.now() ? '🍾' : game === D.luckyGame(dk) ? '🔮' : '🐈‍⬛', from: (C.events.happyUntil || 0) > Date.now() ? 'Happy hour ×2' : 'Bonus de chance', body: '+' + eur(bonus) }); }, 1200);
    if (stake > 0 && net >= Math.max(20000, stake * 25) && C.sysChat) C.sysChat(`🔥 ${u.pseudo} vient de gagner ${eur(net)} ${D.GN[game] || ''} (×${(payout / stake).toFixed(1).replace('.', ',')}) !`); }
  else if (net < 0) { d.wins += 0; d.losses++; d.streakL++; d.streakW = 0; d.maxLoss = Math.max(d.maxLoss, -net);
    if (-net >= Math.max(1000, (d.cash - net) * .25)) { u.sockets.forEach(s => s.emit('bigloss', { game, amt: -net, mult: extra.mult || 0 })); C.events.maybeDaron && C.events.maybeDaron(u); } }
  checkAch(u); markDirty(u); push(u);
}

// ---------- Revenus passifs ----------
const CAP_H = 8;
function incomePerHour(d) { return ((d.sabotUntil || 0) > Date.now() ? .5 : 1) * d.biz.reduce((s, id) => { const b = D.BIZ.find(x => x.id === id); return s + (b ? D.bizInc(b, (d.bizLv || {})[id]) : 0); }, 0) + d.items.reduce((s, id) => s + ((D.SHOP.find(x => x.id === id) || {}).rent || 0), 0); }
function pending(d) { const h = Math.min(CAP_H, (Date.now() - d.lastCollect) / 3600000); return Math.floor(h * incomePerHour(d)); }

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function card(u) { return { face: u.d.av.face, acc: u.d.av.acc }; }
C.adminId = null;
C.isAdmin = u => !!u && C.adminId != null && u.id === C.adminId;
const avOf = u => u.d.av.v2;

module.exports = Object.assign(C, { D, rnd, pick, shuffle, E, GameError, eur, parisNow, seeded, freshData, getUser, markDirty, saveUserNow, withUser, worth, tierIdx, LV, pub, push, notify, feed,
  int, pay, money, checkBroke, casinoWin, xp, track, todayMissions, weekMissions, weekKey, checkAch, result, incomePerHour, pending, esc, card, avOf, itemsValue, owed, posValue, dkeyParis, ACHF });
