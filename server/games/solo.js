// Jeux solo : tout est tiré au sort par le serveur, le navigateur ne fait que l'animation.
const C = require('../core');
const { D, rnd, pick, shuffle, E } = C;
const casinoOpen = u => { if (Date.now() < u.d.banUntil) throw E('La sécurité t\'a sorti du casino. Reviens dans ' + Math.ceil((u.d.banUntil - Date.now()) / 1000) + ' s.'); };

/* Machine à sous */
function rollSym() { let r = Math.random() * 24; for (const x of D.SYM) { if ((r -= x.w) < 0) return x.s; } return '🍒'; }
C.api.slSpin = u => { casinoOpen(u); return {}; };
C.api.slots = (u, p) => {
  casinoOpen(u); const b = C.pay(u, p.amt); const jp = C.events.jackpotUntil > Date.now();
  const fin = [0, 1, 2].map(() => [rollSym(), rollSym(), rollSym()]); const mid = fin.map(r => r[1]); let mult = 0;
  if (mid[0] === mid[1] && mid[1] === mid[2]) mult = D.SYM.find(x => x.s === mid[0]).p3 * (jp ? 2 : 1);
  else { const pair = mid.find((s, i) => mid.indexOf(s) !== i); if (pair) mult = D.SYM.find(x => x.s === pair).p2; }
  let payout = b * mult; if (payout > b) payout += C.casinoWin(u, payout - b);
  if (payout) C.money(u, payout); C.result(u, 'sl', b, payout, { mult }); return { fin, mult, payout };
};

/* Mines */
const miMult = (k, n) => { let m = .97; for (let i = 0; i < k; i++) m *= (25 - i) / (25 - n - i); return m; };
C.api.miStart = (u, p) => { casinoOpen(u); if (u.s.mi) throw E('Termine ta partie en cours.'); const n = [1, 3, 5, 10, 20].includes(+p.n) ? +p.n : 3; const b = C.pay(u, p.amt);
  const pos = shuffle([...Array(25).keys()]).slice(0, n); u.s.mi = { n, bet: b, grid: Array.from({ length: 25 }, (_, i) => pos.includes(i)), rev: [] }; return { ok: 1 }; };
C.api.miPick = (u, p) => { const g = u.s.mi; if (!g) throw E('Pas de partie en cours.'); const i = +p.i; if (!(i >= 0 && i < 25) || g.rev.includes(i)) throw E('Case invalide.');
  if (g.grid[i]) { u.s.mi = null; C.result(u, 'mines', g.bet, 0); return { boom: 1, grid: g.grid }; }
  g.rev.push(i); const mult = miMult(g.rev.length, g.n); if (g.rev.length === 25 - g.n) { const r = C.api.miOut(u); return { ...r, auto: 1 }; } return { mult, next: miMult(g.rev.length + 1, g.n) }; };
C.api.miOut = u => { const g = u.s.mi; if (!g || !g.rev.length) throw E('Révèle au moins une case.'); const mult = miMult(g.rev.length, g.n), payout = Math.round(g.bet * mult); u.s.mi = null; C.money(u, payout); C.result(u, 'mines', g.bet, payout, { mult }); return { payout, mult, grid: g.grid }; };

/* Plinko */
C.api.plinko = (u, p) => { casinoOpen(u); const b = C.pay(u, p.amt); const path = [0]; let s = 0; for (let r = 0; r < 12; r++) { s += Math.random() < .5 ? 0 : 1; path.push(s); }
  const m = D.PLM[s], payout = Math.round(b * m * 100) / 100; u.s.plQueue = (u.s.plQueue || 0) + 1;
  setTimeout(() => { if (payout) C.money(u, payout); C.result(u, 'plinko', b, payout, { mult: m }); }, 13 * 115); return { path, m, payout }; };

/* Plus haut plus bas */
const HV = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], SU = ['♠', '♥', '♦', '♣'];
const newCard = () => ({ r: pick(HV), s: pick(SU) });
const hp = (c, up) => { const r = HV.indexOf(c.r); return up ? (12 - r) / 13 : r / 13; };
C.api.hlStart = (u, p) => { casinoOpen(u); if (u.s.hl) throw E('Termine ta partie en cours.'); const b = C.pay(u, p.amt); u.s.hl = { bet: b, card: newCard(), mult: 1, steps: 0, skips: 3 }; return u.s.hl; };
C.api.hlGuess = (u, p) => { const g = u.s.hl; if (!g) throw E('Pas de partie en cours.'); const up = !!p.up, pr = hp(g.card, up); if (!pr) throw E('Impossible.'); const prev = g.card, n = newCard(); g.card = n;
  const ok = up ? HV.indexOf(n.r) > HV.indexOf(prev.r) : HV.indexOf(n.r) < HV.indexOf(prev.r);
  if (ok) { g.mult *= .96 / pr; g.steps++; C.track(u, 'mult', 'hilo', g.steps); return { ...g, prev, ok: 1 }; }
  u.s.hl = null; C.result(u, 'hilo', g.bet, 0); return { ...g, prev, ok: 0 }; };
C.api.hlSkip = u => { const g = u.s.hl; if (!g || !g.skips) throw E('Plus de passes.'); g.skips--; const prev = g.card; g.card = newCard(); return { ...g, prev }; };
C.api.hlOut = u => { const g = u.s.hl; if (!g || !g.steps) throw E('Rien à encaisser.'); const payout = Math.round(g.bet * g.mult); u.s.hl = null; C.money(u, payout); C.result(u, 'hilo', g.bet, payout, { mult: g.steps }); return { payout, mult: g.mult }; };

/* 421 */
function dScore(d) { const s = [...d].sort((a, b) => b - a); if (s.join('') === '421') return { v: 1000, l: '421 !', m: 10 };
  if (s[0] === s[2]) return { v: s[0] === 1 ? 900 : 800 + s[0] * 10, l: 'Brelan de ' + s[0], m: s[0] === 1 ? 6 : 4 };
  if (s[0] - s[1] === 1 && s[1] - s[2] === 1) return { v: 700 + s[0], l: 'Suite ' + s.slice().reverse().join('-'), m: 3 };
  return { v: s[0] * 100 + s[1] * 10 + s[2], l: s.join('-'), m: 2 }; }
const die = () => 1 + Math.random() * 6 | 0;
C.api.diStart = (u, p) => { casinoOpen(u); if (u.s.di) throw E('Termine ta partie en cours.'); const b = C.pay(u, p.amt); u.s.di = { bet: b, d: [die(), die(), die()], rolls: 1 }; return { d: u.s.di.d, rolls: 1, score: dScore(u.s.di.d) }; };
C.api.diRoll = (u, p) => { const g = u.s.di; if (!g || g.rolls >= 3) throw E('Plus de lancers.'); const keep = Array.isArray(p.keep) ? p.keep : []; g.d = g.d.map((v, i) => keep[i] ? v : die()); g.rolls++; return { d: g.d, rolls: g.rolls, score: dScore(g.d) }; };
C.api.diStop = u => { const g = u.s.di; if (!g) throw E('Pas de partie en cours.'); u.s.di = null; const target = dScore(g.d).v; let keep = [0, 0, 0], dd = [1, 1, 1]; const seq = [];
  for (let r = 0; r < 3; r++) { dd = dd.map((v, i) => keep[i] ? v : die()); seq.push({ d: [...dd], keep: [...keep] }); if (dScore(dd).v > target) break;
    const c = {}; dd.forEach(v => c[v] = (c[v] || 0) + 1); const pair = +Object.keys(c).find(k => c[k] >= 2);
    if (pair) keep = dd.map(v => v === pair ? 1 : 0); else { const seen = new Set(); keep = dd.map(v => ([4, 2, 1].includes(v) && !seen.has(v) && seen.add(v)) ? 1 : 0); } }
  const ps = dScore(g.d), ds = dScore(dd); let payout = 0; if (ps.v > ds.v) payout = g.bet * ps.m; else if (ps.v === ds.v) payout = g.bet;
  if (payout > g.bet) payout += C.casinoWin(u, payout - g.bet); if (payout) C.money(u, payout); C.result(u, 'd421', g.bet, payout);
  return { seq, player: ps, dealer: ds, payout, bet: g.bet }; };

/* Tickets à gratter */
const GPRIZE = [[1000, .0001], [100, .0015], [20, .008], [5, .03], [2, .08], [1, .12]];
C.api.gratte = (u, p) => { casinoOpen(u); const t = D.TICKETS.find(x => x.id === p.t); if (!t) throw E('Ticket inconnu.'); C.pay(u, t.pr);
  let r = Math.random(), mult = 0; for (const [m, pr] of GPRIZE) { if (r < pr) { mult = m; break; } r -= pr; }
  const vals = [1, 2, 5, 20, 100, 1000].map(m => m * t.pr), cells = [], cnt = {};
  if (mult) { for (let i = 0; i < 3; i++) cells.push(mult * t.pr); cnt[mult * t.pr] = 3; }
  while (cells.length < 9) { const v = pick(vals); if ((cnt[v] || 0) >= 2) continue; cnt[v] = (cnt[v] || 0) + 1; cells.push(v); }
  const payout = mult * t.pr; grDone(u);
  u.s.gr = { payout, pr: t.pr, t: setTimeout(() => grDone(u), 90000) }; return { cells: shuffle(cells), mult, payout }; };
function grDone(u) { const g = u.s.gr; if (!g) return; u.s.gr = null; clearTimeout(g.t); if (g.payout) C.money(u, g.payout); C.result(u, 'gratte', g.pr, g.payout); }
C.api.grDone = u => { grDone(u); return {}; };

/* Bonneteau */
C.api.bnStart = (u, p) => { casinoOpen(u); if (u.s.bn) throw E('Choisis d\'abord un gobelet.'); const b = C.pay(u, p.amt); const ball = Math.random() * 3 | 0; const pos = [0, 1, 2]; const swaps = [];
  for (let s = 0; s < 9; s++) { const a = Math.random() * 3 | 0, c = (a + 1 + (Math.random() * 2 | 0)) % 3; swaps.push([a, c]); const ia = pos.indexOf(a), ib = pos.indexOf(c); [pos[ia], pos[ib]] = [pos[ib], pos[ia]]; }
  u.s.bn = { bet: b, ball }; return { ball, swaps }; };
C.api.bnPick = (u, p) => { const g = u.s.bn; if (!g) throw E('Pas de partie.'); u.s.bn = null; const cheat = Math.random() < .12; const win = !cheat && +p.cup === g.ball; const payout = win ? Math.round(g.bet * 2.8) : 0;
  if (payout) C.money(u, payout); C.result(u, 'bonneteau', g.bet, payout); return { win, cheat, ball: g.ball, payout }; };

/* Machine à pince */
const PZIC = ['🧸', '⌚', '🎧', '💍', '🕶️', '👟', '💎', '🎮'];
const pzFill = price => [12, 28, 44, 60, 76, 90].map(x => ({ x, ic: pick(PZIC), v: price * pick([2, 3, 4, 6, 10, 20]) }));
C.api.pzPrizes = (u, p) => { const price = D.PZPRICE.includes(+p.price) ? +p.price : 100; u.s.pz = { price, prizes: pzFill(price) }; return u.s.pz; };
C.api.pzGo = (u, p) => { casinoOpen(u); const g = u.s.pz; if (!g) throw E('Choisis un prix d\'essai.'); C.pay(u, g.price); const x = Math.max(0, Math.min(100, +p.x || 0));
  const near = g.prizes.map((q, i) => ({ q, i, d: Math.abs(q.x - x) })).sort((a, b) => a.d - b.d)[0];
  const grab = near.d < 7 && Math.random() < .4, slip = grab && Math.random() < .62; let payout = 0, prize = null;
  if (grab && !slip) { payout = near.q.v; prize = near.q; g.prizes[near.i] = { ...near.q, ic: pick(PZIC), v: g.price * pick([2, 3, 4, 6, 10, 20]) }; }
  setTimeout(() => { if (payout) C.money(u, payout); C.result(u, 'pince', g.price, payout); }, 2200);
  return { i: near.i, near: near.d < 7, grab, slip, payout, prize, prizes: g.prizes }; };

/* Duel pile ou face : contre un vrai joueur ou contre le croupier */
const DUELS = new Map(); let did = 1;
function flip(a, aSide) { const res = Math.random() < .5 ? 0 : 1; return { res, aWins: res === aSide }; }
C.api.duelBot = (u, p) => { casinoOpen(u); const b = C.pay(u, p.amt); const side = +p.side ? 1 : 0; const f = flip(u, side); const payout = f.aWins ? b * 2 : 0;
  setTimeout(() => { if (payout) C.money(u, payout); C.result(u, 'duel', b, payout); }, 2300); return { res: f.res, win: f.aWins, payout }; };
C.api.duelAsk = async (u, p) => { const to = await C.getUser(+p.to); if (!to || to.id === u.id) throw E('Joueur introuvable.'); if (!to.sockets.size) throw E(to.pseudo + ' n\'est pas connecté.');
  const amt = C.int(p.amt), side = +p.side ? 1 : 0; C.pay(u, amt); const id = did++;
  DUELS.set(id, { id, from: u.id, fromP: u.pseudo, to: to.id, amt, side, t: setTimeout(() => { if (DUELS.has(id)) { DUELS.delete(id); C.money(u, amt); C.notify(u, { ic: '🪙', from: 'Duel', body: to.pseudo + ' n\'a pas répondu. Mise rendue.' }); } }, 45000) });
  to.sockets.forEach(s => s.emit('duelAsk', { id, from: u.pseudo, amt, side: side ? 'Face' : 'Pile' })); return { id }; };
C.api.duelAnswer = async (u, p) => { const dl = DUELS.get(+p.id); if (!dl || dl.to !== u.id) throw E('Ce défi n\'existe plus.'); DUELS.delete(dl.id); clearTimeout(dl.t); const a = await C.getUser(dl.from);
  if (!p.yes) { C.money(a, dl.amt); C.notify(a, { ic: '🪙', from: 'Duel', body: u.pseudo + ' refuse ton défi. Mise rendue.' }); return { refused: 1 }; }
  C.pay(u, dl.amt); const f = flip(a, dl.side); const winner = f.aWins ? a : u, loser = f.aWins ? u : a;
  setTimeout(() => { C.money(winner, dl.amt * 2); C.result(winner, 'duel', dl.amt, dl.amt * 2); C.result(loser, 'duel', dl.amt, 0); C.feed(`<b>${C.esc(winner.pseudo)}</b> bat ${C.esc(loser.pseudo)} en duel (${C.eur(dl.amt)})`); }, 2300);
  const payload = { res: f.res, a: a.pseudo, b: u.pseudo, amt: dl.amt, winner: winner.pseudo };
  a.sockets.forEach(s => s.emit('duelFlip', { ...payload, win: winner === a })); return { ...payload, win: winner === u }; };
