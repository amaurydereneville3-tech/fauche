// Business : bourse partagée, Monte ou descend, entreprises, enchères entre joueurs.
const C = require('../core');
const db = require('../db');
const { D, rnd, pick, E } = C;
function gauss() { return Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random()); }

/* ================= BOURSE ================= */
const P = {}, H = {};
D.ASSETS.forEach(a => { P[a.id] = { p: a.p, open: a.p }; let x = a.p; H[a.id] = []; for (let i = 0; i < 80; i++) { H[a.id].unshift(x); x = x / Math.exp(a.v * gauss()); } });
db.kvGet('prices').then(v => { if (v) D.ASSETS.forEach(a => { if (v[a.id]) { P[a.id] = v[a.id]; } }); });
C.market = { price: id => (P[id] || {}).p || 0 };
function mkTick() {
  D.ASSETS.forEach(a => { const x = P[a.id]; x.p = x.p * Math.exp(a.v * gauss() + (Math.random() < .01 ? gauss() * a.v * 6 : 0)); H[a.id].push(x.p); if (H[a.id].length > 80) H[a.id].shift(); });
  C.users.forEach(u => { const liq = u.d.pos.filter(p => C.posValue(p) <= 0); if (!liq.length) return; u.d.pos = u.d.pos.filter(p => !liq.includes(p)); u.d.liq += liq.length;
    liq.forEach(p => { C.notify(u, { ic: '💥', from: 'Bourse', body: 'LIQUIDÉ sur ' + p.a + ' ×' + p.lev + ' : −' + C.eur(p.margin), boom: 1 }); C.feed(`<b>${C.esc(u.pseudo)}</b> s'est fait liquider sur ${p.a} ×${p.lev}`); C.result(u, 'bourse', p.margin, 0); }); C.checkBroke(u); });
  if (C.io) C.io.to('mk').emit('mk', { p: Object.fromEntries(D.ASSETS.map(a => [a.id, P[a.id]])) });
}
setInterval(mkTick, 2000);
setInterval(() => { if (C.users.size) db.kvSet('prices', P).catch(() => {}); }, 60000);
C.krach = k => { D.ASSETS.forEach(a => { if (a.t === 'Crypto' || Math.random() < .5) { P[a.id].p *= 1 - k * rnd(.6, 1.2); H[a.id].push(P[a.id].p); } }); };
C.api.mkJoin = (u, p, s) => { s.join('mk'); return { p: P, h: H }; };
C.api.mkLeave = (u, p, s) => { s.leave('mk'); return {}; };
C.api.mkOpen = (u, p) => { const a = D.ASSETS.find(x => x.id === p.a); if (!a) throw E('Actif inconnu.'); const lev = [1, 10, 100].includes(+p.lev) ? +p.lev : 1; const side = +p.side > 0 ? 1 : -1;
  const m = C.pay(u, p.amt); u.d.pos.push({ id: Date.now() + Math.random(), a: a.id, side, margin: m, lev, entry: P[a.id].p });
  if (lev === 100) C.feed(`<b>${C.esc(u.pseudo)}</b> joue ${C.eur(m)} en ×100 sur ${a.id}`); return {}; };
C.api.mkClose = (u, p) => { const pos = u.d.pos.find(x => x.id === +p.id); if (!pos) throw E('Position introuvable.'); const val = Math.round(C.posValue(pos)); u.d.pos = u.d.pos.filter(x => x !== pos);
  C.money(u, val); C.result(u, 'bourse', pos.margin, val); return { pnl: val - pos.margin }; };
// Monte ou descend : 10 secondes sur le Bitcoin
C.api.moBet = (u, p) => { if (u.s.mo) throw E('Un pari est déjà en cours.'); const amt = C.pay(u, p.amt), dir = +p.dir > 0 ? 1 : -1, entry = P.BTC.p;
  u.s.mo = { amt, dir, entry, end: Date.now() + 10000 };
  setTimeout(() => { const g = u.s.mo; u.s.mo = null; const d = Math.sign(P.BTC.p - g.entry); const payout = d === g.dir ? Math.round(g.amt * 1.9) : d === 0 ? g.amt : 0;
    if (payout) C.money(u, payout); C.result(u, 'mo', g.amt, payout); u.sockets.forEach(s => s.emit('moRes', { payout, amt: g.amt, entry: g.entry, exit: P.BTC.p })); }, 10000);
  return u.s.mo; };

/* ================= ENTREPRISES ================= */
C.api.collect = u => { const p = C.pending(u.d); if (p < 1) throw E('Rien à encaisser pour l\'instant.'); u.d.lastCollect = Date.now(); C.money(u, p); return { p }; };
C.api.bizBuy = (u, p) => { const b = D.BIZ.find(x => x.id === p.id); if (!b) throw E('Entreprise inconnue.'); if (u.d.biz.includes(b.id)) throw E('Tu la possèdes déjà.');
  if (u.d.cash < b.pr) throw E('Pas assez d\'argent.'); const pe = C.pending(u.d); if (pe > 0) C.money(u, pe); u.d.lastCollect = Date.now();
  C.pay(u, b.pr); u.d.biz.push(b.id); C.feed(`<b>${C.esc(u.pseudo)}</b> rachète : ${b.nm}`); C.track(u, 'buy', null, 1); C.checkAch(u); return {}; };

/* ================= ENCHÈRES ================= */
const AUC_ITEMS = ['sp_scoot', 'sp_watch', 'sp_car', 'sp_sea', 'sp_air', 'sp_art'];
const BOTN = ['Collectionneur_75', 'Baron_Rouge', 'MadameMonaco', 'Le_Notaire', 'Prince_du_Golfe'];
let A = null, aNext = Date.now() + 5000;
function richest() { let w = 5000; C.users.forEach(u => { if (u.sockets.size) w = Math.max(w, C.worth(u)); }); return w; }
function newAuction() { const w = richest(); const pool = AUC_ITEMS.filter(id => D.SPECIAL[id].pr <= w * 1.2); const id = pool.length ? pick(pool) : 'sp_scoot';
  const base = Math.round(D.SPECIAL[id].pr * rnd(.55, .75) / 100) * 100;
  A = { id, top: base, leader: 'Mise de départ', uid: null, end: Date.now() + 120000, log: [], done: false, maxBot: D.SPECIAL[id].pr * rnd(.9, 1.5), next: Date.now() + rnd(3000, 7000) }; emitA(); }
const aView = () => A ? { id: A.id, top: A.top, leader: A.leader, uid: A.uid, end: A.end, log: A.log.slice(0, 10), done: A.done, now: Date.now() } : null;
const emitA = () => C.io && C.io.to('auc').emit('auc', aView());
C.escrow = u => (A && !A.done && A.uid === u.id) ? A.top : 0;
async function refund(uid, amt) { await C.withUser(uid, u => { C.money(u, amt); C.notify(u, { ic: '🔨', from: 'Enchères', body: 'Quelqu\'un a surenchéri. Tes ' + C.eur(amt) + ' te sont rendus.', keep: 1 }); }); }
setInterval(() => {
  const now = Date.now();
  if (!A) { if (now > aNext && C.users.size) newAuction(); return; }
  if (A.done) { if (now > A.end + 20000) { A = null; aNext = now + 5000; emitA(); } return; }
  if (now >= A.end) { A.done = true; if (A.uid) { const id = A.id, top = A.top; C.withUser(A.uid, u => { u.d.items.push(id); u.d.auctionsWon++; C.track(u, 'buy', null, 1); C.checkAch(u); C.result(u, 'auction', top, D.SPECIAL[id].pr);
      C.notify(u, { ic: '🔨', from: 'Enchères', body: 'Adjugé ! ' + D.SPECIAL[id].nm + ' est à toi pour ' + C.eur(top), keep: 1, big: 1 }); C.feed(`<b>${C.esc(u.pseudo)}</b> remporte ${D.SPECIAL[id].nm} aux enchères`); }); }
    emitA(); return; }
  if (now >= A.next) { const nb = Math.round(A.top * rnd(1.05, 1.15) / 100) * 100;
    if (nb <= A.maxBot) { if (A.uid) refund(A.uid, A.top); const who = pick(BOTN); A.top = nb; A.leader = who; A.uid = null; A.log.unshift({ who, v: nb }); if (A.end - now < 10000) A.end = now + 10000; emitA(); }
    A.next = now + rnd(2500, 9000); }
}, 500);
C.api.aucJoin = (u, p, s) => { s.join('auc'); return { a: aView() }; };
C.api.aucLeave = (u, p, s) => { s.leave('auc'); return {}; };
C.api.bid = u => { if (!A || A.done) throw E('Pas de vente en cours.'); if (A.uid === u.id) throw E('Tu es déjà en tête.'); const nb = Math.round(A.top * 1.1 / 100) * 100; C.pay(u, nb);
  if (A.uid) refund(A.uid, A.top); A.top = nb; A.leader = u.pseudo; A.uid = u.id; A.log.unshift({ who: u.pseudo, v: nb }); if (A.end - Date.now() < 10000) A.end = Date.now() + 10000; A.next = Date.now() + rnd(2500, 8000); emitA(); return {}; };
