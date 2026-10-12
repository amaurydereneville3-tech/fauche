// Jeux en direct partagés : Crash, roulette, courses. Une seule partie pour tout le monde.
const C = require('../core');
const { D, rnd, pick, E } = C;
const io = () => C.io;

/* ================= CRASH ================= */
const CR = { phase: 'bet', endsAt: Date.now() + 7000, start: 0, crashAt: 0, bets: new Map(), hist: [2.41, 1.02, 7.8, 1.33, 3.1, 1.0, 12.4], round: 1 };
const BET_MS = 8000;
function crView() { return { phase: CR.phase, endsAt: CR.endsAt, start: CR.start, crashAt: CR.phase === 'end' ? CR.crashAt : 0, hist: CR.hist.slice(0, 14), round: CR.round, now: Date.now(),
  bets: [...CR.bets.values()].map(b => ({ pseudo: b.pseudo, face: b.face, amt: b.amt, out: b.out, uid: b.uid })) }; }
let crT = null;
function crEmit() { clearTimeout(crT); crT = setTimeout(() => io().to('crash').emit('crash', crView()), 60); }
function crashLoop() {
  const now = Date.now();
  if (CR.phase === 'bet' && now >= CR.endsAt) {
    const u01 = Math.random(); CR.crashAt = Math.max(1, Math.floor(99 / (1 - u01)) / 100);
    CR.phase = 'fly'; CR.start = now; crEmit();
  } else if (CR.phase === 'fly') {
    const m = Math.floor(D.crashM(now - CR.start) * 100) / 100;
    CR.bets.forEach(b => { if (!b.out && b.auto && m >= b.auto && b.auto < CR.crashAt) cashOut(b, b.auto); });
    if (m >= CR.crashAt) {
      CR.phase = 'end'; CR.endsAt = now + 4000; CR.hist.unshift(CR.crashAt); CR.hist.length = 20;
      CR.bets.forEach(b => { if (!b.out) C.getUser(b.uid).then(u => { if (!u) return; if (CR.crashAt >= 10) u.d.greedy++; C.result(u, 'crash', b.amt, 0); }); });
      crEmit();
    }
  } else if (CR.phase === 'end' && now >= CR.endsAt) {
    CR.phase = 'bet'; CR.endsAt = now + BET_MS; CR.bets.clear(); CR.round++; crEmit();
  }
}
function cashOut(b, m) {
  b.out = m; const payout = Math.round(b.amt * m);
  C.getUser(b.uid).then(u => { if (!u) return; const bonus = C.casinoWin(u, payout - b.amt); C.money(u, payout + bonus); C.result(u, 'crash', b.amt, payout + bonus, { mult: m });
    u.sockets.forEach(s => s.emit('crashWin', { m, gain: payout + bonus - b.amt })); });
  crEmit();
}
setInterval(crashLoop, 50);
C.api.crashBet = (u, p) => {
  if (CR.phase !== 'bet') throw E('Attends le prochain décollage.');
  if (CR.bets.has(u.id)) throw E('Tu as déjà misé sur ce vol.');
  const amt = C.pay(u, p.amt); const auto = Number(p.auto) >= 1.01 ? Math.min(1000, Number(p.auto)) : 0;
  CR.bets.set(u.id, { uid: u.id, pseudo: u.pseudo, face: u.d.av.face, amt, auto, out: 0 }); crEmit(); return {};
};
C.api.crashOut = u => {
  const b = CR.bets.get(u.id); if (CR.phase !== 'fly' || !b || b.out) throw E('Trop tard !');
  const m = Math.floor(D.crashM(Date.now() - CR.start) * 100) / 100; if (m >= CR.crashAt) throw E('Trop tard, la fusée a explosé !');
  cashOut(b, m); return { m };
};
C.api.crashJoin = (u, p, s) => { s.join('crash'); s.emit('crash', crView()); return {}; };
C.api.crashLeave = (u, p, s) => { s.leave('crash'); return {}; };

/* ================= ROULETTE ================= */
const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const KEYS = new Set(['red', 'black', 'even', 'odd', 'low', 'high', 'd1', 'd2', 'd3', 'c1', 'c2', 'c3', ...Array.from({ length: 37 }, (_, i) => 'n' + i)]);
function roWin(k, n) { if (k[0] === 'n') return +k.slice(1) === n; if (n === 0) return false;
  switch (k) { case 'red': return REDS.has(n); case 'black': return !REDS.has(n); case 'even': return n % 2 === 0; case 'odd': return n % 2 === 1; case 'low': return n <= 18; case 'high': return n >= 19; }
  if (k[0] === 'd') return Math.ceil(n / 12) === +k[1]; if (k[0] === 'c') return ((n - 1) % 3) + 1 === +k[1]; return false; }
const roMult = k => k[0] === 'n' ? 36 : (k[0] === 'd' || k[0] === 'c') ? 3 : 2;
const RO = { phase: 'bet', endsAt: Date.now() + 20000, n: null, spinAt: 0, bets: new Map(), hist: [], round: 1 };
const RO_BET = 20000, RO_SPIN = 6500, RO_RES = 5000;
function roView() { const players = []; RO.bets.forEach(b => players.push({ pseudo: b.pseudo, face: b.face, total: b.total, win: b.win })); return { phase: RO.phase, endsAt: RO.endsAt, n: RO.phase === 'bet' ? null : RO.n, spinAt: RO.spinAt, hist: RO.hist.slice(0, 14), players, round: RO.round, now: Date.now() }; }
const roEmit = () => io().to('ro').emit('ro', roView());
setInterval(() => {
  const now = Date.now();
  if (RO.phase === 'bet' && now >= RO.endsAt) { RO.n = Math.random() * 37 | 0; RO.phase = 'spin'; RO.spinAt = now; RO.endsAt = now + RO_SPIN; roEmit(); }
  else if (RO.phase === 'spin' && now >= RO.endsAt) {
    const n = RO.n; RO.hist.unshift(n); RO.hist.length = Math.min(RO.hist.length, 20); RO.phase = 'res'; RO.endsAt = now + RO_RES;
    RO.bets.forEach(b => C.getUser(b.uid).then(u => { if (!u) return; let payout = 0; for (const k in b.bets) if (roWin(k, n)) payout += b.bets[k] * roMult(k);
      let profit = payout - b.total; if (payout && b.fl && profit > 0) { payout += profit; profit *= 2; } if (profit > 0) { const bo = C.casinoWin(u, profit); payout += bo; }
      b.win = payout; if (payout) C.money(u, payout); C.result(u, 'ro', b.total, payout); u.sockets.forEach(s => s.emit('roRes', { n, payout, total: b.total })); roEmit(); }));
    roEmit();
  } else if (RO.phase === 'res' && now >= RO.endsAt) { RO.phase = 'bet'; RO.endsAt = now + RO_BET; RO.bets.clear(); RO.round++; roEmit(); }
}, 200);
C.api.roBet = (u, p) => {
  if (RO.phase !== 'bet') throw E('Les jeux sont faits, attends le prochain tour.');
  const bets = {}; let total = 0;
  for (const k in (p.bets || {})) { if (!KEYS.has(k)) throw E('Mise invalide.'); const a = C.int(p.bets[k]); bets[k] = a; total += a; }
  if (!total) throw E('Pose au moins un jeton.');
  C.pay(u, total);
  let b = RO.bets.get(u.id); if (!b) { b = { uid: u.id, pseudo: u.pseudo, face: u.d.av.face, bets: {}, total: 0, win: 0, fl: false }; RO.bets.set(u.id, b); }
  let moved = null;
  if (!b.fl && u.d.boosts.flambeur > 0) { u.d.boosts.flambeur--; b.fl = true; const ks = Object.keys(bets), k = pick(ks), to = 'n' + (Math.random() * 37 | 0); const a = bets[k]; delete bets[k]; bets[to] = (bets[to] || 0) + a; moved = [k, to]; }
  for (const k in bets) b.bets[k] = (b.bets[k] || 0) + bets[k];
  b.total += total; roEmit(); return { mine: b.bets, moved };
};
C.api.roJoin = (u, p, s) => { s.join('ro'); const b = RO.bets.get(u.id); s.emit('ro', roView()); return { mine: b ? b.bets : {} }; };
C.api.roLeave = (u, p, s) => { s.leave('ro'); return {}; };

/* ================= COURSES ================= */
const RC = { phase: 'bet', endsAt: Date.now() + 25000, type: 'f1', runners: [], pos: [], winner: -1, bets: new Map(), comm: '', round: 1 };
const RC_BET = 25000;
function step(s, r) { return s * (.5 + r()) * 1.6 + (r() < .06 ? (r() - .5) * 14 : 0); }
function sim(str) { const p = str.map(() => 0); let t = 0; while (Math.max(...p) < 100 && t < 400) { t++; str.forEach((s, i) => { p[i] = Math.max(0, p[i] + step(s, Math.random)); }); } return p.indexOf(Math.max(...p)); }
function genRace() { RC.type = pick(Object.keys(D.RACES)); const str = Array.from({ length: 6 }, () => rnd(.95, 1.05)); const w = Array(6).fill(0); for (let k = 0; k < 500; k++) w[sim(str)]++;
  RC.runners = str.map((s, i) => ({ s, odds: Math.min(30, Math.max(1.3, +(1 / ((w[i] + 3) / 518) / 1.1).toFixed(2))) })); RC.pos = Array(6).fill(0); RC.winner = -1; RC.comm = 'Prochaine course : faites vos jeux !'; }
genRace();
function rcView() { const players = []; RC.bets.forEach(b => players.push({ pseudo: b.pseudo, face: b.face, runner: b.runner, amt: b.amt })); return { phase: RC.phase, endsAt: RC.endsAt, type: RC.type, odds: RC.runners.map(r => r.odds), pos: RC.pos, winner: RC.winner, comm: RC.comm, players, now: Date.now() }; }
const rcEmit = () => io().to('race').emit('race', rcView());
let leader = -1, t = 0;
setInterval(() => {
  const now = Date.now();
  if (RC.phase === 'bet' && now >= RC.endsAt) { RC.phase = 'run'; RC.comm = '3… 2… 1… Partez !'; leader = -1; t = 0; rcEmit(); }
  else if (RC.phase === 'run') {
    t++; RC.runners.forEach((r, i) => { RC.pos[i] = Math.max(0, RC.pos[i] + step(r.s, Math.random)); });
    const R = D.RACES[RC.type], l = RC.pos.indexOf(Math.max(...RC.pos));
    if (l !== leader && t > 3) { leader = l; RC.comm = `${R.run[l]} prend la tête !`; } else if (Math.random() < .04) RC.comm = pick(R.ev).replace('{n}', R.run[Math.random() * 6 | 0]);
    if (Math.max(...RC.pos) >= 100 || t > 400) {
      RC.winner = RC.pos.indexOf(Math.max(...RC.pos)); RC.pos = RC.pos.map(x => Math.min(100, x)); RC.phase = 'res'; RC.endsAt = now + 6000; RC.comm = `🏆 Victoire de ${R.run[RC.winner]} !`;
      const odds = RC.runners[RC.winner].odds;
      RC.bets.forEach(b => C.getUser(b.uid).then(u => { if (!u) return; const pay = b.runner === RC.winner ? Math.round(b.amt * odds) : 0; if (pay) C.money(u, pay); C.result(u, 'race', b.amt, pay); u.sockets.forEach(s => s.emit('raceRes', { pay, amt: b.amt })); }));
    }
    rcEmit();
  } else if (RC.phase === 'res' && now >= RC.endsAt) { genRace(); RC.phase = 'bet'; RC.endsAt = now + RC_BET; RC.bets.clear(); RC.round++; rcEmit(); }
}, 100);
C.api.raceBet = (u, p) => {
  if (RC.phase !== 'bet') throw E('La course est lancée, attends la suivante.');
  if (RC.bets.has(u.id)) throw E('Un seul pari par course.');
  const r = Number(p.runner); if (!(r >= 0 && r < 6)) throw E('Choisis un concurrent.');
  const amt = C.pay(u, p.amt); RC.bets.set(u.id, { uid: u.id, pseudo: u.pseudo, face: u.d.av.face, runner: r, amt }); rcEmit(); return {};
};
C.api.raceJoin = (u, p, s) => { s.join('race'); s.emit('race', rcView()); const b = RC.bets.get(u.id); return { mine: b ? { runner: b.runner, amt: b.amt } : null }; };
C.api.raceLeave = (u, p, s) => { s.leave('race'); return {}; };

module.exports = { CR, RO, RC };
