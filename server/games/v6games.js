// Jeux V6 : ballon, lingots, pousse-pièces, pierre-feuille-ciseaux, Dragon Tigre, machines à thème,
// caisses en duel, Grande Roue en direct, petits boulots arcade, roulette à cheval et roulette éclair.
const C = require('../core');
const { D, rnd, pick, shuffle, E } = C;
function open(u, g) { if (Date.now() < u.d.banUntil) throw E('Tu es interdit de casino encore ' + Math.ceil((u.d.banUntil - Date.now()) / 1000) + ' s.'); if (g && D.GLV[g] && C.LV(u) < D.GLV[g]) throw E('Ce jeu se débloque au niveau ' + D.GLV[g] + '.'); }
const cw = (u, pay, stake) => pay > stake ? pay + C.casinoWin(u, pay - stake) : pay;
const io = () => C.io;

/* ---------- Ballon ---------- */
C.api.blStart = (u, p) => { open(u, 'ballon'); if (u.s.bl) throw E('Termine ton ballon.'); const mode = D.BALMODES[+p.mode] ? +p.mode : 1; u.s.bl = { mode, bet: C.pay(u, p.amt), k: 0 }; return {}; };
C.api.blPump = u => { const g = u.s.bl; if (!g) throw E('Pas de ballon en cours.'); const M = D.BALMODES[g.mode];
  if (Math.random() < M.p) { u.s.bl = null; C.result(u, 'ballon', g.bet, 0, { mult: 0 }); return { pop: 1, k: g.k + 1 }; }
  g.k++; if (g.k >= D.BALMAX) return { k: g.k, ...C.api.blOut(u) }; return { k: g.k, m: D.balM(g.k, M) }; };
C.api.blOut = u => { const g = u.s.bl; if (!g || !g.k) throw E('Gonfle au moins une fois.'); u.s.bl = null; const m = D.balM(g.k, D.BALMODES[g.mode]); let pay = Math.round(g.bet * m); pay = cw(u, pay, g.bet);
  C.money(u, pay); C.result(u, 'ballon', g.bet, pay, { mult: m }); return { pay, m, done: 1 }; };

/* ---------- Empile les lingots ---------- */
C.api.lgStart = (u, p) => { open(u, 'lingots'); if (u.s.lg) throw E('Termine ta tour de lingots.'); const t = Date.now(); u.s.lg = { bet: C.pay(u, p.amt), lvl: 0, w: D.LGW0, x: 3, t0: t, ph: Math.random() * 6, last: 0, rows: [] };
  return { t0: t, ph: u.s.lg.ph, now: t }; };
C.api.lgTap = (u, p) => { const g = u.s.lg; if (!g) throw E('Pas de partie en cours.'); const el = Date.now() - g.t0; let ms = Math.floor(+p.ms); if (!(ms >= 0)) ms = el; ms = Math.max(el - 800, Math.min(ms, el + 400));
  const x = D.lgPos(ms, g.w, g.lvl, g.ph); let nx = x, nw = g.w;
  if (g.lvl > 0) { const a = Math.max(x, g.x), b = Math.min(x + g.w, g.x + g.w); nw = b - a; nx = a; }
  if (nw <= 0) { u.s.lg = null; C.result(u, 'lingots', g.bet, 0, { mult: 0 }); return { x, w: g.w, lose: 1, lvl: g.lvl }; }
  g.lvl++; g.w = nw; g.x = nx; g.rows.push([nx, nw]); g.t0 = g.t0 + ms; g.ph = Math.random() * 6;
  if (g.lvl >= D.LGTOP) return { x: nx, w: nw, lvl: g.lvl, ...C.api.lgOut(u) };
  return { x: nx, w: nw, lvl: g.lvl, m: D.LGMULT[g.lvl], t0: g.t0, ph: g.ph }; };
C.api.lgOut = u => { const g = u.s.lg; if (!g || g.lvl < D.LGMIN) throw E('Pose au moins ' + D.LGMIN + ' rangées avant d\'encaisser.'); u.s.lg = null; const m = D.LGMULT[g.lvl]; let pay = Math.round(g.bet * m); pay = cw(u, pay, g.bet);
  C.money(u, pay); C.result(u, 'lingots', g.bet, pay, { mult: m }); return { pay, m, done: 1 }; };

/* ---------- Pousse-pièces ---------- */
C.api.ppDrop = (u, p) => { open(u); const b = C.pay(u, p.amt); let r = Math.random(), m = 0; for (const [k, pr] of D.PPDIST) { if (r < pr) { m = k; break; } r -= pr; }
  let pay = Math.round(b * m); pay = cw(u, pay, b); if (pay) C.money(u, pay); C.result(u, 'pousse', b, pay, { mult: m });
  if (m >= 10) C.feed(`<b>${C.esc(u.pseudo)}</b> fait tomber un lingot au pousse-pièces : ×${m} !`); return { m, pay, lane: Math.max(0, Math.min(2, +p.lane || 0)) }; };

/* ---------- Pierre-feuille-ciseaux ---------- */
const beats = (a, b) => (a - b + 3) % 3 === 1; // 0 pierre, 1 feuille, 2 ciseaux
C.api.rpsBot = (u, p) => { open(u); const m = +p.m; if (!(m >= 0 && m < 3)) throw E('Choix invalide.'); const b = C.pay(u, p.amt), h = Math.random() * 3 | 0;
  const res = m === h ? 'draw' : beats(m, h) ? 'win' : 'lose'; const pay = res === 'win' ? Math.round(b * 1.96) : res === 'draw' ? b : 0; if (pay) C.money(u, pay); C.result(u, 'rps', b, pay); return { h, res, pay }; };
const RPS = new Map(); let rpsId = 1;
C.api.rpsInvite = async (u, p) => { open(u); const to = await C.getUser(+p.to); if (!to || to.id === u.id) throw E('Joueur introuvable.'); if (!to.sockets.size) throw E('Ce joueur n\'est pas en ligne.');
  const m = +p.m; if (!(m >= 0 && m < 3)) throw E('Choisis pierre, feuille ou ciseaux.'); const amt = C.pay(u, p.amt); const id = 'r' + (rpsId++);
  const inv = { id, from: u.id, fromP: u.pseudo, to: to.id, amt, m, t: Date.now() }; RPS.set(id, inv);
  to.sockets.forEach(s => s.emit('event', { type: 'rps', id, from: u.pseudo, av: u.d.av.v2, amt }));
  setTimeout(() => { if (RPS.get(id) === inv) { RPS.delete(id); C.withUser(u.id, x => { C.money(x, amt); C.notify(x, { ic: '✊', from: 'Pierre-feuille-ciseaux', body: to.pseudo + ' n\'a pas répondu. Mise rendue.' }); }); } }, 60000);
  return { id }; };
C.api.rpsAnswer = async (u, p) => { const inv = RPS.get(p.id); if (!inv || inv.to !== u.id) throw E('Ce défi n\'existe plus.'); RPS.delete(inv.id); const a = await C.getUser(inv.from);
  if (!p.yes) { if (a) { C.money(a, inv.amt); C.notify(a, { ic: '✊', from: u.pseudo, body: 'Refuse ton défi. Mise rendue.' }); } return { refused: 1 }; }
  const m = +p.m; if (!(m >= 0 && m < 3)) throw E('Choix invalide.'); C.pay(u, inv.amt);
  const res = m === inv.m ? 'draw' : beats(m, inv.m) ? 'win' : 'lose'; const pot = inv.amt * 2, prize = Math.round(pot * .98);
  if (res === 'draw') { C.money(u, inv.amt); if (a) C.money(a, inv.amt); }
  else if (res === 'win') { C.money(u, prize); } else if (a) C.money(a, prize);
  const ic = ['Pierre', 'Feuille', 'Ciseaux'];
  C.result(u, 'rps', inv.amt, res === 'win' ? prize : res === 'draw' ? inv.amt : 0); if (a) { C.result(a, 'rps', inv.amt, res === 'lose' ? prize : res === 'draw' ? inv.amt : 0);
    a.sockets.forEach(s => s.emit('rpsRes', { vs: u.pseudo, me: inv.m, him: m, res: res === 'win' ? 'lose' : res === 'lose' ? 'win' : 'draw', amt: inv.amt, prize })); }
  if (res !== 'draw') C.feed(`<b>${C.esc(res === 'win' ? u.pseudo : inv.fromP)}</b> gagne un pierre-feuille-ciseaux à ${C.eur(pot)} contre ${C.esc(res === 'win' ? inv.fromP : u.pseudo)}`);
  return { me: m, him: inv.m, res, prize, amt: inv.amt, vs: inv.fromP, ic }; };

/* ---------- Dragon Tigre ---------- */
const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const rcard = () => ({ r: pick(RANKS), s: pick(SUITS) }), rv = c => RANKS.indexOf(c.r) + 1;
C.api.dtPlay = (u, p) => { open(u, 'dt'); const bets = {}; let tot = 0; for (const k in (p.bets || {})) { if (!D.DTPAY[k]) throw E('Mise invalide.'); const a = C.int(p.bets[k]); bets[k] = a; tot += a; } if (!tot) throw E('Pose au moins un jeton.'); C.pay(u, tot);
  const d = rcard(), t = rcard(), w = rv(d) > rv(t) ? 'd' : rv(t) > rv(d) ? 't' : 'tie'; let pay = 0;
  if (w === 'tie') { pay += (bets.tie || 0) * D.DTPAY.tie + Math.round(((bets.d || 0) + (bets.t || 0)) / 2); } else pay += (bets[w] || 0) * D.DTPAY[w];
  pay = cw(u, pay, tot); if (pay) C.money(u, pay); C.result(u, 'dt', tot, pay); return { d, t, w, pay, tot }; };

/* ---------- Machines à thème (même moteur que la Machine Dorée, sans jackpot commun) ---------- */
const GTW = D.GSYM.reduce((a, x) => a + x.w, 0);
function gRoll() { let r = Math.random() * GTW; for (const x of D.GSYM) { if ((r -= x.w) < 0) return x.s; } return '🍒'; }
const gGrid = () => Array.from({ length: 5 }, () => [gRoll(), gRoll(), gRoll()]);
C.api.tslotSpin = (u, p) => { const th = p.th; if (!D.TSLOTS[th]) throw E('Machine inconnue.'); open(u, th); const b = C.pay(u, p.amt), lb = b / 10, spins = [];
  const one = free => { const g = gGrid(), e = D.gEval(g, lb); let win = e.total * (free ? 2 : 1); if (e.jack) win += lb * D.TSJACK; spins.push({ grid: g, win: Math.round(win), hits: e.hits, sc: e.sc, jack: e.jack ? lb * D.TSJACK : 0, free }); return e.sc; };
  const sc = one(false); let fs = sc >= 3 ? D.GFS[Math.min(5, sc)] : 0, n = 0; while (fs > 0 && n < 80) { const s2 = one(true); fs--; n++; if (s2 >= 3) fs += D.GFS[Math.min(5, s2)]; }
  let total = spins.reduce((a, s) => a + s.win, 0); total = cw(u, total, b); if (total) C.money(u, total); C.result(u, th, b, total, { mult: Math.round(total / b) }); return { spins, total, bet: b }; };

/* ---------- Caisses en duel ---------- */
function pickLoot(c) { const tw = c.loot.reduce((a, l) => a + l[3], 0); let r = Math.random() * tw; for (const l of c.loot) { if ((r -= l[3]) < 0) return l; } return c.loot[0]; }
const lootVal = l => l[0] === 'cash' ? l[1] : Math.round(D.itemInfo(l[1]).pr * .7);
const BATTLERS = ['Kevin', 'Tata Josiane', 'Gégé', 'Le Croupier', 'Ton ex', 'Le Daron', 'Hugo du 3e'];
C.api.crBattle = (u, p) => { open(u, 'battle'); const c = D.CRATES.find(x => x.id === p.c); if (!c) throw E('Caisse inconnue.'); C.pay(u, c.pr); u.d.crates++;
  const mine = pickLoot(c), his = pickLoot(c), a = lootVal(mine), b = lootVal(his), opp = pick(BATTLERS); let pay = 0, res;
  if (a > b) { pay = a + b; res = 'win'; } else if (a < b) { res = 'lose'; } else { pay = a; res = 'draw'; }
  if (pay) C.money(u, pay); C.checkAch(u); C.result(u, 'battle', c.pr, pay); if (res === 'win' && pay >= c.pr * 5) C.feed(`<b>${C.esc(u.pseudo)}</b> écrase ${opp} en caisses en duel : ${C.eur(pay)}`);
  return { mine, his, a, b, res, pay, opp }; };

/* ---------- Petits boulots arcade ---------- */
C.api.arcStart = (u, p) => { const j = D.ARC[p.id]; if (!j) throw E('Boulot inconnu.'); u.s.arc = { id: p.id, t: Date.now() }; return { dur: j.dur }; };
C.api.arcEnd = (u, p) => { const g = u.s.arc; if (!g) throw E('Pas de boulot en cours.'); u.s.arc = null; const j = D.ARC[g.id], el = Math.min((Date.now() - g.t) / 1000, j.dur + 3);
  const sc = Math.max(0, Math.min(Math.floor(+p.score || 0), Math.floor(el * j.rate) + 1)); const pay = Math.round(sc * j.pay * (1 + C.LV(u) * .04) * (D.petOn(u.d, 'dog') ? 1.5 : 1));
  u.d.bestJob = Math.max(u.d.bestJob, sc); if (pay) C.money(u, pay); C.result(u, 'job', 0, pay); return { pay, score: sc }; };

/* ---------- Grande Roue (en direct, pour tout le monde) ---------- */
const WS = { phase: 'bet', endsAt: Date.now() + 18000, seg: null, segs: [], bonus: null, bets: new Map(), hist: [], round: 1, spinAt: 0 };
const WS_BET = 18000, WS_SPIN = 7000, WS_BONUS = 6500, WS_RES = 5000;
function wsView() { const players = []; WS.bets.forEach(b => players.push({ pseudo: b.pseudo, av: b.av, total: b.total, win: b.win })); return { phase: WS.phase, endsAt: WS.endsAt, segs: WS.phase === 'bet' ? [] : WS.segs, bonus: WS.phase === 'bet' || WS.phase === 'spin' ? null : WS.bonus, hist: WS.hist.slice(0, 12), players, round: WS.round, spinAt: WS.spinAt, now: Date.now() }; }
const wsEmit = () => io() && io().to('ws').emit('ws', wsView());
function wsDraw() { const segs = []; let mult = 1; for (let k = 0; k < 4; k++) { const i = Math.random() * D.WSEG.length | 0; segs.push(i); if (D.WSEG[i] !== 'top') break; mult *= 2; } if (D.WSEG[segs.at(-1)] === 'top') segs.push(D.WSEG.findIndex(x => x !== 'top')); const key = D.WSEG[segs.at(-1)];
  let bonus = null; if (key === 'coin') { const a = pick(D.WCOIN), b = pick(D.WCOIN), side = Math.random() < .5 ? 0 : 1; bonus = { type: 'coin', a, b, side, m: side ? b : a }; }
  else if (key === 'hunt') { const grid = shuffle([...D.WBIG, ...D.WBIG.slice(0, 2)]).slice(0, 12), i = Math.random() * 12 | 0; bonus = { type: 'hunt', grid, i, m: grid[i] }; }
  else if (key === 'pach') { const slots = shuffle([...D.WBIG]), i = Math.random() * 10 | 0; bonus = { type: 'pach', slots, i, m: slots[i] }; }
  return { segs, key, mult, bonus }; }
setInterval(() => { const now = Date.now();
  if (WS.phase === 'bet' && now >= WS.endsAt) { const r = wsDraw(); WS.segs = r.segs; WS.key = r.key; WS.mult = r.mult; WS.bonus = r.bonus; WS.phase = 'spin'; WS.spinAt = now; WS.endsAt = now + WS_SPIN * r.segs.length; wsEmit(); }
  else if (WS.phase === 'spin' && now >= WS.endsAt) { if (WS.bonus) { WS.phase = 'bonus'; WS.endsAt = now + WS_BONUS; wsEmit(); } else wsPay(now); }
  else if (WS.phase === 'bonus' && now >= WS.endsAt) wsPay(now);
  else if (WS.phase === 'res' && now >= WS.endsAt) { WS.phase = 'bet'; WS.endsAt = now + WS_BET; WS.bets.clear(); WS.round++; WS.segs = []; WS.bonus = null; wsEmit(); } }, 200);
function wsPay(now) { const key = WS.key, mult = WS.mult; WS.hist.unshift({ k: key, m: WS.bonus ? WS.bonus.m * mult : (D.WPAY[key] ? D.WPAY[key] * mult : 0) }); WS.hist.length = Math.min(WS.hist.length, 20);
  WS.phase = 'res'; WS.endsAt = now + WS_RES;
  WS.bets.forEach(b => C.getUser(b.uid).then(u => { if (!u) return; const a = b.bets[key] || 0; let payout = 0;
    if (a) payout = WS.bonus ? a * (WS.bonus.m + 1) * mult : Math.round(a * D.WPAY[key] * mult); payout = cw(u, Math.round(payout), b.total); b.win = payout;
    if (payout) C.money(u, payout); C.result(u, 'wshow', b.total, payout, { mult: payout / b.total }); u.sockets.forEach(s => s.emit('wsRes', { key, payout, total: b.total })); wsEmit(); }));
  if (WS.bonus && WS.bonus.m * mult >= 40 && C.sysChat) C.sysChat(`🎡 La Grande Roue tombe sur ${D.WNAME[key]} ×${WS.bonus.m * mult} !`);
  wsEmit(); }
C.api.wsBet = (u, p) => { open(u, 'wshow'); if (WS.phase !== 'bet') throw E('La roue tourne, attends le prochain tour.'); const bets = {}; let total = 0;
  for (const k in (p.bets || {})) { if (!D.WKEYS.includes(k)) throw E('Mise invalide.'); const a = C.int(p.bets[k]); bets[k] = a; total += a; } if (!total) throw E('Pose au moins un jeton.'); C.pay(u, total);
  let b = WS.bets.get(u.id); if (!b) { b = { uid: u.id, pseudo: u.pseudo, av: u.d.av.v2, bets: {}, total: 0, win: 0 }; WS.bets.set(u.id, b); } for (const k in bets) b.bets[k] = (b.bets[k] || 0) + bets[k]; b.total += total; wsEmit(); return { mine: b.bets }; };
C.api.wsJoin = (u, p, s) => { s.join('ws'); const b = WS.bets.get(u.id); s.emit('ws', wsView()); return { mine: b ? b.bets : {} }; };
C.api.wsLeave = (u, p, s) => { s.leave('ws'); return {}; };
