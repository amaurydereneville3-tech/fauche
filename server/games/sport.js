// Paris sportifs en direct (mêmes matchs pour tout le monde) et loto de 20 h.
const C = require('../core');
const db = require('../db');
const { D, rnd, pick, shuffle, E } = C;

/* ================= SPORT ================= */
const L1 = ['PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Lens', 'Rennes', 'Nice', 'Nantes', 'Brest', 'Lorient', 'Strasbourg', 'Toulouse', 'Auxerre', 'Le Havre', 'Angers'];
const BK = ['Paris Basket', 'Monaco', 'ASVEL', 'Bourg', 'Cholet', 'Nanterre', 'Le Mans', 'Dijon'];
const LIVE_MS = 90000;
function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
let mid = 1; const M = []; const SLIPS = new Map(); let sid = 1;
function busy() { return new Set(M.filter(m => m.state !== 'ft').flatMap(m => [m.h, m.a])); }
function genMatch(kick) {
  const used = busy(); const foot = Math.random() < .75;
  const pool = shuffle((foot ? L1 : BK).filter(x => !used.has(x))); const h = pool[0], a = pool[1];
  if (foot) { const lh = rnd(.7, 2.1), la = rnd(.5, 1.7); const c = [0, 0, 0]; for (let i = 0; i < 3000; i++) { const x = poisson(lh), y = poisson(la); c[x > y ? 0 : x === y ? 1 : 2]++; }
    const hg = poisson(lh), ag = poisson(la); const ev = [...Array(hg)].map(() => ({ t: rnd(1, 90), w: 0 })).concat([...Array(ag)].map(() => ({ t: rnd(1, 90), w: 1 }))).sort((x, y) => x.t - y.t);
    return { id: mid++, sp: '⚽ Ligue 1', foot: 1, h, a, lbl: [h, 'Nul', a], odds: c.map(n => Math.max(1.05, +(1 / ((n / 3000) * 1.07)).toFixed(2))), kick, state: 'up', min: 0, score: [0, 0], ev, fin: [hg, ag], out: hg > ag ? 0 : hg === ag ? 1 : 2, len: 90 }; }
  const d = rnd(-1.6, 1.6), ph = 1 / (1 + Math.exp(-d)), hw = Math.random() < ph, base = Math.round(rnd(68, 92)), diff = Math.round(rnd(1, 16));
  return { id: mid++, sp: '🏀 Betclic Élite', foot: 0, h, a, lbl: [h, a], odds: [ph, 1 - ph].map(p => Math.max(1.05, +(1 / (p * 1.06)).toFixed(2))), kick, state: 'up', min: 0, score: [0, 0], fin: hw ? [base + diff, base] : [base, base + diff], out: hw ? 0 : 1, len: 48 };
}
const now0 = Date.now(); for (let i = 0; i < 7; i++) M.push(genMatch(now0 + 60000 + i * 70000));
const mView = m => ({ id: m.id, sp: m.sp, h: m.h, a: m.a, lbl: m.lbl, odds: m.odds, kick: m.kick, state: m.state, min: Math.floor(m.min), score: m.score, len: m.len });
function sView() { return { matches: M.map(mView), now: Date.now() }; }
let lastEmit = 0;
setInterval(() => {
  const now = Date.now(); let changed = false;
  M.forEach(m => {
    if (m.state === 'up' && now >= m.kick) { m.state = 'live'; changed = true; }
    if (m.state === 'live') { const p = Math.min(1, (now - m.kick) / LIVE_MS); m.min = p * m.len;
      const sc = m.foot ? [m.ev.filter(e => e.w === 0 && e.t <= m.min).length, m.ev.filter(e => e.w === 1 && e.t <= m.min).length] : m.fin.map(x => Math.round(x * p));
      if (sc.join() !== m.score.join()) { m.score = sc; changed = true; }
      if (p >= 1) { m.state = 'ft'; m.score = m.fin; m.end = now; changed = true; settle(m); } }
  });
  for (let i = M.length - 1; i >= 0; i--) if (M[i].state === 'ft' && now - M[i].end > 60000) { const old = M.splice(i, 1)[0]; FT.set(old.id, old); M.push(genMatch(Math.max(now + 60000, ...M.map(x => x.kick)) + 70000)); changed = true; }
  if (changed || now - lastEmit > 5000) { lastEmit = now; C.io && C.io.to('sport').emit('sport', sView()); }
}, 1000);
const FT = new Map();
const matchById = id => M.find(m => m.id === id) || FT.get(id);
function settle(m) {
  SLIPS.forEach((s, id) => {
    if (!s.sels.some(x => x.mid === m.id)) return;
    const ms = s.sels.map(x => matchById(x.mid)); if (ms.some(x => !x || x.state !== 'ft')) return;
    const ok = s.sels.every(x => matchById(x.mid).out === x.k); const payout = ok ? Math.round(s.amt * s.odds) : 0; SLIPS.delete(id);
    C.withUser(s.uid, u => { const e = u.d.slips.find(x => x.id === id); if (e) { e.done = true; e.res = ok ? 'win' : 'lose'; e.payout = payout; e.scores = s.sels.map(x => matchById(x.mid).fin); }
      if (payout) C.money(u, payout); C.result(u, 'sport', s.amt, payout); C.notify(u, { ic: ok ? '✅' : '❌', from: 'Paris sportifs', body: ok ? 'Pari gagné ! +' + C.eur(payout - s.amt) : 'Pari perdu : ' + s.sels.map(x => { const mm = matchById(x.mid); return mm.h + ' ' + mm.fin.join('-') + ' ' + mm.a; }).join(', '), keep: 1 }); });
  });
}
C.sport = { knows: pend => pend.every(s => SLIPS.has(s.id)) };
C.api.sportJoin = (u, p, s) => { s.join('sport'); return sView(); };
C.api.sportLeave = (u, p, s) => { s.leave('sport'); return {}; };
C.api.sportBet = (u, p) => {
  const sels = Array.isArray(p.sels) ? p.sels : []; if (!sels.length || sels.length > 8) throw E('Ticket invalide.');
  const seen = new Set(); let odds = 1; const out = [];
  for (const [id, k] of sels) { const m = M.find(x => x.id === +id); if (!m || m.state !== 'up' || Date.now() > m.kick - 2000) throw E('Ce match a déjà commencé.'); if (seen.has(m.id)) throw E('Un seul choix par match.'); seen.add(m.id);
    if (!(k >= 0 && k < m.odds.length)) throw E('Choix invalide.'); odds *= m.odds[k]; out.push({ mid: m.id, k: +k, odds: m.odds[k], label: m.lbl[k], match: m.h + ' – ' + m.a }); }
  const amt = C.pay(u, p.amt); const id = 's' + Date.now().toString(36) + (sid++);
  odds = Math.round(odds * 100) / 100; SLIPS.set(id, { uid: u.id, sels: out, amt, odds });
  u.d.slips.unshift({ id, sels: out, amt, odds, done: false, t: Date.now() }); u.d.slips = u.d.slips.slice(0, 15); return { id };
};

/* ================= LOTO ================= */
let TICKETS = null; // { date: [{uid, nums}] }
const drawn = new Set();
async function tickets() { if (!TICKETS) TICKETS = (await db.kvGet('lototickets')) || {}; return TICKETS; }
function nextDraw() { const p = C.parisNow(); if (p.h < 20) return p.date; const d = new Date(p.date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
async function draw(date) {
  if (drawn.has(date)) return; drawn.add(date);
  const nums = shuffle([...Array(30).keys()].map(i => i + 1)).slice(0, 5).sort((a, b) => a - b);
  await db.kvSet('lotores:' + date, nums); const T = await tickets(); const list = T[date] || []; delete T[date]; await db.kvSet('lototickets', T);
  C.io.emit('lotoDraw', { date, nums });
  for (const t of list) await C.withUser(t.uid, u => { const k = t.nums.filter(n => nums.includes(n)).length, g = D.LOTO_GAIN[k] || 0;
    if (u.d.loto && u.d.loto.date === date) u.d.loto.res = { nums, k, g }; u.d.lotoBest = Math.max(u.d.lotoBest, k);
    if (g) { C.money(u, g); if (g >= 5000) C.feed(`<b>${C.esc(u.pseudo)}</b> trouve ${k} numéros au loto !`); } C.result(u, 'loto', D.LOTO_PRICE, g); C.checkAch(u);
    C.notify(u, { ic: '🎱', from: 'Loto du soir', body: `Tirage : ${nums.join(' · ')}. ${k} bon${k > 1 ? 's' : ''} numéro${k > 1 ? 's' : ''}${g ? ' : +' + C.eur(g) : ''}`, keep: 1 }); });
}
setInterval(async () => { const T = await tickets(); const p = C.parisNow(); for (const date of Object.keys(T)) { if (date < p.date || (date === p.date && p.h >= 20)) await draw(date); } }, 20000);
C.api.lotoInfo = async () => ({ next: nextDraw() });
C.api.lotoBuy = async (u, p) => {
  const nums = [...new Set((p.nums || []).map(Number))].filter(n => n >= 1 && n <= 30); if (nums.length !== 5) throw E('Coche exactement 5 numéros.');
  if (u.d.loto && !u.d.loto.res) throw E('Tu as déjà un ticket pour le prochain tirage.');
  C.pay(u, D.LOTO_PRICE); const date = nextDraw(); const T = await tickets(); (T[date] = T[date] || []).push({ uid: u.id, nums }); await db.kvSet('lototickets', T);
  u.d.loto = { date, nums: nums.sort((a, b) => a - b), res: null, seen: false }; return { date };
};
C.api.lotoSeen = u => { if (u.d.loto && u.d.loto.res) u.d.loto.seen = true; return {}; };
