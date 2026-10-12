// Jeux V4/V5 : tout est tiré au sort ici, le navigateur ne fait que l'animation.
const C = require('../core');
const db = require('../db');
const { D, rnd, pick, shuffle, E } = C;
const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const deck = (n = 1) => { const d = []; for (let k = 0; k < n; k++) for (const s of SUITS) for (const r of RANKS) d.push({ r, s }); return shuffle(d); };
function open(u, g) { if (Date.now() < u.d.banUntil) throw E('Tu es interdit de casino encore ' + Math.ceil((u.d.banUntil - Date.now()) / 1000) + ' s.'); if (g && D.GLV[g] && C.LV(u) < D.GLV[g]) throw E('Ce jeu se débloque au niveau ' + D.GLV[g] + '.'); }
const sumO = o => Object.values(o).reduce((a, b) => a + b, 0);
function chipBets(p, keys, u) { const bets = {}; let tot = 0; for (const k in (p || {})) { if (!keys.includes(k)) throw E('Mise invalide.'); const a = C.int(p[k]); bets[k] = a; tot += a; } if (!tot) throw E('Pose au moins un jeton.'); C.pay(u, tot); return { bets, tot }; }
const cw = (u, pay, stake) => pay > stake ? pay + C.casinoWin(u, pay - stake) : pay;

/* ---------- Vidéo poker ---------- */
C.api.vpDeal = (u, p) => { open(u); if (u.s.vp) throw E('Termine ta main en cours.'); const b = C.pay(u, p.amt); const dk = deck(); u.s.vp = { bet: b, deck: dk, hand: dk.splice(0, 5) }; return { hand: u.s.vp.hand, e: D.vpEval(u.s.vp.hand) }; };
C.api.vpDraw = (u, p) => { const g = u.s.vp; if (!g) throw E('Distribue d\'abord.'); u.s.vp = null; const held = Array.isArray(p.held) ? p.held : [];
  g.hand = g.hand.map((c, i) => held[i] ? c : g.deck.shift()); const e = D.vpEval(g.hand), m = e >= 0 ? D.VPT[e][1] : 0; const pay = cw(u, g.bet * m, g.bet);
  if (e === 0) { u.d.vpRoyal++; C.feed(`<b>${C.esc(u.pseudo)}</b> sort une QUINTE FLUSH ROYALE au vidéo poker !`); C.sysChat && C.sysChat(`👑 ${u.pseudo} vient de sortir une quinte flush royale au vidéo poker !`); }
  if (pay) C.money(u, pay); C.result(u, 'vp', g.bet, pay); return { hand: g.hand, e, m, pay, bet: g.bet }; };

/* ---------- Baccarat ---------- */
C.api.bacPlay = (u, p) => { open(u); const { bets: B, tot } = chipBets(p.bets, ['p', 'b', 't'], u); if (!u.s.bacShoe || u.s.bacShoe.length < 20) u.s.bacShoe = deck(6); const sh = u.s.bacShoe;
  const P = [sh.pop()], Bk = [sh.pop()]; P.push(sh.pop()); Bk.push(sh.pop()); let p0 = D.bTot(P), b0 = D.bTot(Bk);
  if (p0 < 8 && b0 < 8) { let p3 = null; if (p0 <= 5) { P.push(sh.pop()); p3 = D.bv(P[2]); } const bt = D.bTot(Bk);
    const draw = p3 === null ? bt <= 5 : (bt <= 2 || (bt === 3 && p3 !== 8) || (bt === 4 && p3 >= 2 && p3 <= 7) || (bt === 5 && p3 >= 4 && p3 <= 7) || (bt === 6 && (p3 === 6 || p3 === 7))); if (draw) Bk.push(sh.pop()); }
  const pt = D.bTot(P), bt = D.bTot(Bk), w = pt > bt ? 'p' : bt > pt ? 'b' : 't'; let pay = 0; if (w === 'p') pay += (B.p || 0) * 2; if (w === 'b') pay += Math.round((B.b || 0) * 1.95); if (w === 't') pay += (B.t || 0) * 9 + (B.p || 0) + (B.b || 0);
  pay = cw(u, pay, tot); if (pay) C.money(u, pay); C.result(u, 'bac', tot, pay); return { p: P, b: Bk, w, pay, tot }; };

/* ---------- Keno ---------- */
C.api.kenoPlay = (u, p) => { open(u); const picks = [...new Set((p.picks || []).map(Number))].filter(n => n >= 1 && n <= D.KN); if (!picks.length || picks.length > 10) throw E('Coche de 1 à 10 numéros.');
  const b = C.pay(u, p.amt); const drawn = shuffle([...Array(D.KN).keys()].map(i => i + 1)).slice(0, D.KD); const h = picks.filter(n => drawn.includes(n)).length, m = (D.KPAY[picks.length] || {})[h] || 0;
  const pay = cw(u, Math.round(b * m), b); if (pay) C.money(u, pay); C.result(u, 'keno', b, pay); return { drawn, h, m, pay }; };

/* ---------- Dés ---------- */
C.api.diceRoll = (u, p) => { open(u); const t = Math.round(+p.target); if (!(t >= 2 && t <= 98)) throw E('Seuil invalide.'); const over = !!p.over, chance = over ? 100 - t : t, mult = 99 / chance;
  const b = C.pay(u, p.amt), r = Math.floor(Math.random() * 10000) / 100, win = over ? r > t : r < t, pay = win ? Math.floor(b * mult) : 0;
  if (pay) C.money(u, pay); C.result(u, 'dice', b, pay, win ? { mult: Math.round(mult) } : {}); return { r, win, pay }; };

/* ---------- Limbo ---------- */
C.api.limboPlay = (u, p) => { open(u); let t = Math.round(+p.target * 100) / 100; if (!(t >= 1.01 && t <= 1000)) throw E('Cible entre ×1,01 et ×1000.');
  const b = C.pay(u, p.amt), r = Math.max(1, Math.floor(99 / (1 - Math.random())) / 100), win = r >= t, pay = win ? Math.floor(b * t) : 0;
  if (pay) C.money(u, pay); C.result(u, 'limbo', b, pay, win ? { mult: t } : {}); return { r, win, pay }; };

/* ---------- La Tour ---------- */
C.api.towStart = (u, p) => { open(u); if (u.s.tw) throw E('Termine ton ascension.'); const mode = D.TMODES[+p.mode] ? +p.mode : 1, M = D.TMODES[mode]; const b = C.pay(u, p.amt);
  u.s.tw = { mode, bet: b, floor: 0, traps: Array.from({ length: D.FLOORS }, () => shuffle([...Array(M.n).keys()]).slice(0, M.b)) }; return { ok: 1 }; };
C.api.towPick = (u, p) => { const g = u.s.tw; if (!g) throw E('Pas de partie.'); const M = D.TMODES[g.mode], i = +p.i; if (!(i >= 0 && i < M.n)) throw E('Case invalide.');
  if (g.traps[g.floor].includes(i)) { u.s.tw = null; C.result(u, 'tower', g.bet, 0); return { dead: 1, traps: g.traps }; }
  g.floor++; if (g.floor >= D.FLOORS) { const r = C.api.towOut(u); return { ...r, top: 1 }; } return { floor: g.floor }; };
C.api.towOut = u => { const g = u.s.tw; if (!g || !g.floor) throw E('Monte au moins un étage.'); u.s.tw = null; const m = D.twM(g.floor, D.TMODES[g.mode]), pay = Math.round(g.bet * m);
  C.money(u, pay); C.result(u, 'tower', g.bet, pay, { mult: g.floor }); return { pay, m, traps: g.traps, floor: g.floor }; };

/* ---------- Roue géante ---------- */
C.api.wheelSpin = (u, p) => { open(u); const { bets: B, tot } = chipBets(p.bets, D.WTYPES.map((_, j) => String(j)), u); const i = Math.random() * 54 | 0, j = D.WSEGS[i], t = D.WTYPES[j];
  const pay = cw(u, (B[j] || 0) * (t.pay + 1), tot); if (pay) C.money(u, pay); C.result(u, 'wheel', tot, pay); return { i, j, pay, tot }; };

/* ---------- Machine Dorée + jackpot commun ---------- */
const GTW = D.GSYM.reduce((a, x) => a + x.w, 0);
function gRoll() { let r = Math.random() * GTW; for (const x of D.GSYM) { if ((r -= x.w) < 0) return x.s; } return '🍒'; }
const gGrid = () => Array.from({ length: 5 }, () => [gRoll(), gRoll(), gRoll()]);
C.jackpot = 50000; db.kvGet('jackpot').then(v => { if (v) C.jackpot = v; });
let jkT = null; function jkEmit() { if (jkT) return; jkT = setTimeout(() => { jkT = null; C.io && C.io.emit('jackpot', C.jackpot); db.kvSet('jackpot', C.jackpot).catch(() => {}); }, 1500); }
setInterval(() => { if (C.users.size) { C.jackpot += Math.round(2 + Math.random() * 4); jkEmit(); } }, 3000);
C.hello.push(() => ({ jackpot: C.jackpot }));
C.api.goldSpin = (u, p) => { open(u); const b = C.pay(u, p.amt); C.jackpot += Math.round(b * .03); jkEmit(); const lb = b / 10, spins = [];
  const one = free => { const g = gGrid(), e = D.gEval(g, lb); let win = e.total * (free ? 2 : 1), jack = 0; if (e.jack) { jack = C.jackpot; win += jack; C.jackpot = 50000; jkEmit(); u.d.jackpots++;
      C.feed(`<b>${C.esc(u.pseudo)}</b> décroche le JACKPOT de ${C.eur(jack)} à la Machine Dorée !`); C.sysChat && C.sysChat(`🎰 JACKPOT ! ${u.pseudo} rafle ${C.eur(jack)} à la Machine Dorée !`); }
    spins.push({ grid: g, win: Math.round(win), hits: e.hits, sc: e.sc, jack, free }); return e.sc; };
  const sc = one(false); let fs = sc >= 3 ? D.GFS[Math.min(5, sc)] : 0, n = 0; while (fs > 0 && n < 80) { const s2 = one(true); fs--; n++; if (s2 >= 3) fs += D.GFS[Math.min(5, s2)]; }
  let total = spins.reduce((a, s) => a + s.win, 0); total = cw(u, total, b); if (total) C.money(u, total); C.checkAch(u); C.result(u, 'gold', b, total, { mult: Math.round(total / b) }); return { spins, total, bet: b, jackpot: C.jackpot }; };

/* ---------- Bonanza Megaways ---------- */
const MTW = D.MSYM.reduce((a, x) => a + x.w, 0);
function mRoll() { let r = Math.random() * MTW; for (const x of D.MSYM) { if ((r -= x.w) < 0) return x.s; } return '🍒'; }
const mGrid = () => Array.from({ length: 6 }, () => Array.from({ length: 2 + Math.floor(Math.random() * 6) }, mRoll));
C.api.megaSpin = (u, p) => { open(u, 'mega'); const b = C.pay(u, p.amt), spins = [];
  const one = (ci0) => { let g = mGrid(), ci = ci0, tot = 0; const steps = [{ grid: g.map(c => [...c]), hit: null, win: 0, mul: D.MMULT[Math.min(ci, 6)] }]; const sc = g.flat().filter(x => x === '🎁').length;
    for (let k = 0; k < 30; k++) { const e = D.mEval(g, b); if (!e.win) break; const mul = D.MMULT[Math.min(ci, 6)], w = Math.round(e.win * mul); tot += w; steps[steps.length - 1].hit = e.hit; steps[steps.length - 1].win = w;
      const fresh = []; g = g.map((col, r) => { const keep = col.filter((x, i) => !e.hit[r][i]), n = col.length - keep.length; fresh.push([...Array(n).fill(1), ...keep.map(() => 0)]); return [...Array(n)].map(mRoll).concat(keep); });
      ci++; steps.push({ grid: g.map(c => [...c]), fresh, hit: null, win: 0, mul: D.MMULT[Math.min(ci, 6)] }); }
    spins.push({ steps, tot, sc }); return { sc, ci }; };
  const f = one(0); let fsN = f.sc >= 4 ? 10 : 0, ci = 0, n = 0; while (fsN > 0 && n < 60) { const r = one(ci); ci = Math.min(6, Math.max(ci, r.ci)); fsN--; n++; if (r.sc >= 4) fsN += 5; }
  let total = spins.reduce((a, s) => a + s.tot, 0); total = cw(u, total, b); if (total) C.money(u, total); C.result(u, 'mega', b, total, { mult: Math.round(total / b) }); return { spins, total, bet: b }; };

/* ---------- Tournoi éclair (contre 7 bots, record du jour entre joueurs) ---------- */
const SYM3 = D.SYM, TW3 = SYM3.reduce((a, x) => a + x.w, 0);
function roll3() { let r = Math.random() * TW3; for (const x of SYM3) { if ((r -= x.w) < 0) return x.s; } return '🍒'; }
function tSpin() { const r = [roll3(), roll3(), roll3()]; let m = 0; if (r[0] === r[1] && r[1] === r[2]) m = SYM3.find(x => x.s === r[0]).p3; else { const q = r.find((s, i) => r.indexOf(s) !== i); if (q) m = SYM3.find(x => x.s === q).p2; } return { r, pts: m * 100 }; }
const BOTN = ['Gégé', 'Ginette', 'Dédé', 'Mimi', 'Jacky', 'Nono', 'Lulu', 'Bébert', 'Josiane', 'Kevin'];
let TOP = null; async function topDay() { const k = 'tour:' + C.dkeyParis(); if (!TOP || TOP.k !== k) TOP = { k, list: (await db.kvGet(k)) || [] }; return TOP; }
C.api.tourStart = async (u) => { open(u); if (u.s.to) throw E('Tournoi déjà en cours.'); C.pay(u, D.TOUR.fee);
  u.s.to = { i: 0, score: 0, mine: Array.from({ length: D.TOUR.spins }, tSpin), bots: shuffle([...BOTN]).slice(0, 7).map(nm => { let c = 0; return { nm, cum: Array.from({ length: D.TOUR.spins }, () => c += tSpin().pts) }; }) };
  return { bots: u.s.to.bots.map(b => ({ nm: b.nm, cum: b.cum })) }; };
C.api.tourSpin = async (u) => { const g = u.s.to; if (!g) throw E('Inscris-toi d\'abord.'); const s = g.mine[g.i++]; g.score += s.pts; const out = { r: s.r, pts: s.pts, score: g.score, i: g.i };
  if (g.i >= D.TOUR.spins) { u.s.to = null; const all = [...g.bots.map(b => b.cum[D.TOUR.spins - 1]), g.score].sort((a, b) => b - a); const rank = all.indexOf(g.score) + 1, prize = rank <= 3 ? D.TOUR.prizes[rank - 1] : 0;
    u.d.tourBest = Math.max(u.d.tourBest, g.score); if (rank === 1) { u.d.tourWins++; C.feed(`<b>${C.esc(u.pseudo)}</b> remporte un tournoi éclair !`); } if (prize) C.money(u, prize); C.checkAch(u); C.result(u, 'tourney', D.TOUR.fee, prize);
    const T = await topDay(); T.list.push({ pseudo: u.pseudo, score: g.score }); T.list.sort((a, b) => b.score - a.score); T.list = T.list.slice(0, 20); db.kvSet(T.k, T.list).catch(() => {});
    Object.assign(out, { done: 1, rank, prize }); }
  return out; };
C.api.tourTop = async () => ({ list: (await topDay()).list });

/* ---------- Braquage ---------- */
C.api.heStart = (u, p) => { open(u); if (u.s.he) throw E('Un braquage est déjà en cours.'); const t = D.HEISTS[+p.i]; if (!t) throw E('Cible inconnue.'); C.pay(u, t.cost); u.d.heists++;
  u.s.he = { i: +p.i, alert: 0, tries: 0, hits: 0, phase: 'lock' }; return heLock(u); };
function heLock(u) { const h = u.s.he, t = D.HEISTS[h.i]; h.zx = rnd(5, 95 - t.zone); h.ph = rnd(0, 6); h.t0 = Date.now(); return { zx: h.zx, ph: h.ph, zone: t.zone, speed: t.speed, alert: h.alert, tries: h.tries, hits: h.hits }; }
function heCaught(u, txt) { const h = u.s.he, t = D.HEISTS[h.i]; u.s.he = null; u.d.jail++; u.d.banUntil = Date.now() + 120000; C.feed(`<b>${C.esc(u.pseudo)}</b> s'est fait arrêter pendant un braquage`); C.sysChat && C.sysChat(`🚔 ${u.pseudo} vient de se faire arrêter en plein braquage. On lui apporte des oranges ?`);
  C.checkAch(u); C.result(u, 'heist', t.cost, 0); return { caught: 1, txt }; }
C.api.hePick = (u, p) => { const h = u.s.he; if (!h || h.phase !== 'lock') throw E('Pas de coffre à crocheter.'); const t = D.HEISTS[h.i]; const ms = Math.max(0, Math.min(+p.ms || 0, Date.now() - h.t0 + 400));
  const pos = D.needle(ms, t.speed, h.ph), ok = pos >= h.zx && pos <= h.zx + t.zone; h.tries++; if (ok) h.hits++; else h.alert = Math.min(2, h.alert + 1);
  if (h.tries >= 3 || h.hits >= 2) { h.lockFail = h.hits < 2; h.loot = Math.round(rnd(...t.loot) * (h.lockFail ? .4 : 1) / 10) * 10; h.phase = 'run'; h.turn = 0; return { ok, pos, phase: 'run', lockFail: h.lockFail, ...heTurnInfo(u) }; }
  return { ok, pos, ...heLock(u) }; };
function heTurnInfo(u) { const h = u.s.he; h.police = Math.random() < .5 ? 0 : 1; const side = Math.random() < .7 ? h.police : 1 - h.police; return { alert: h.alert, turn: h.turn, hint: side }; }
C.api.heTurn = (u, p) => { const h = u.s.he; if (!h || h.phase !== 'run') throw E('Pas de fuite en cours.'); const bad = +p.c === h.police; if (bad) h.alert++;
  if (h.alert >= 3) return { bad, ...heCaught(u, 'Barrage de police au carrefour. Le Chauffeur lève les mains en premier.') };
  h.turn++; if (h.turn >= 3) { h.phase = 'split'; return { bad, alert: h.alert, phase: 'split', loot: h.loot, lockFail: h.lockFail }; } return { bad, ...heTurnInfo(u) }; };
C.api.heSplit = (u, p) => { const h = u.s.he; if (!h || h.phase !== 'split') throw E('Rien à partager.'); const t = D.HEISTS[h.i];
  if (p.all && Math.random() < .5) return heCaught(u, 'Ton équipe n\'a pas apprécié. La Hackeuse a envoyé ton adresse à la police.');
  const gain = Math.round(h.loot * (p.all ? 1 : .7)); u.s.he = null; u.d.heistOk++; C.money(u, gain); C.feed(`<b>${C.esc(u.pseudo)}</b> réussit le braquage de ${t.nm.toLowerCase()} !`);
  if (gain >= 100000) C.sysChat && C.sysChat(`💼 ${u.pseudo} vient de braquer ${t.nm.toLowerCase()} : ${C.eur(gain)} dans le sac !`); C.checkAch(u); C.result(u, 'heist', t.cost, gain + t.cost);
  return { gain, txt: p.all ? 'Tu as tout gardé… et ton équipe ne t\'adresse plus la parole.' : 'Chacun prend sa part. L\'équipe te respecte.' }; };

/* ---------- La Poule ---------- */
C.api.chStart = (u, p) => { open(u, 'chicken'); if (u.s.ch) throw E('Termine ta traversée.'); const mode = D.CHMODES[+p.mode] ? +p.mode : 0; u.s.ch = { mode, bet: C.pay(u, p.amt), lane: 0 }; return { ok: 1 }; };
C.api.chStep = u => { const g = u.s.ch; if (!g) throw E('Pas de traversée.'); if (Math.random() < D.CHMODES[g.mode].p) { u.s.ch = null; C.result(u, 'chicken', g.bet, 0); return { dead: g.lane + 1 }; }
  g.lane++; if (g.lane >= D.LANES) return { ...C.api.chOut(u), lane: D.LANES }; return { lane: g.lane }; };
C.api.chOut = u => { const g = u.s.ch; if (!g || !g.lane) throw E('Avance d\'au moins une voie.'); u.s.ch = null; const m = D.chM(g.lane, D.CHMODES[g.mode]), pay = Math.round(g.bet * m); C.money(u, pay); C.result(u, 'chicken', g.bet, pay, { mult: g.lane }); return { pay, m, done: 1 }; };

/* ---------- Tirs au but ---------- */
C.api.penStart = (u, p) => { open(u, 'pen'); if (u.s.pe) throw E('Termine ta série.'); const mode = D.PKMODES[+p.mode] ? +p.mode : 1; u.s.pe = { mode, bet: C.pay(u, p.amt), goals: 0 }; return { ok: 1 }; };
C.api.penShot = (u, p) => { const g = u.s.pe; if (!g) throw E('Pose d\'abord le ballon.'); const z = +p.z; if (!(z >= 0 && z < 5)) throw E('Zone invalide.'); const saves = shuffle([0, 1, 2, 3, 4]).slice(0, D.PKMODES[g.mode].k);
  if (saves.includes(z)) { u.s.pe = null; C.result(u, 'pen', g.bet, 0); return { saved: 1, saves }; } g.goals++; if (g.goals >= D.PMAX) return { saves, goals: g.goals, ...C.api.penOut(u) }; return { saves, goals: g.goals }; };
C.api.penOut = u => { const g = u.s.pe; if (!g || !g.goals) throw E('Marque au moins un but.'); u.s.pe = null; const m = D.peM(g.goals, D.PKMODES[g.mode]), pay = Math.round(g.bet * m); C.money(u, pay); C.result(u, 'pen', g.bet, pay, { mult: g.goals }); return { pay, m, done: 1 }; };

/* ---------- Sic Bo ---------- */
C.api.sicboPlay = (u, p) => { open(u, 'sicbo'); const { bets: B, tot } = chipBets(p.bets, D.SBKEYS, u); const d = [0, 0, 0].map(() => 1 + Math.random() * 6 | 0); let pay = 0; for (const k in B) pay += B[k] * D.sbPay(k, d);
  pay = cw(u, pay, tot); if (pay) C.money(u, pay); C.result(u, 'sicbo', tot, pay); return { d, pay, tot }; };

/* ---------- Casino Hold'em ---------- */
C.api.hoDeal = (u, p) => { open(u, 'holdem'); if (u.s.ho) throw E('Termine ta main.'); const a = C.pay(u, p.amt), dk = deck(); u.s.ho = { a, dk, me: [dk.pop(), dk.pop()], dl: [dk.pop(), dk.pop()], board: [dk.pop(), dk.pop(), dk.pop()] };
  return { me: u.s.ho.me, board: u.s.ho.board }; };
C.api.hoFold = u => { const g = u.s.ho; if (!g) throw E('Pas de main.'); u.s.ho = null; while (g.board.length < 5) g.board.push(g.dk.pop()); C.result(u, 'holdem', g.a, 0); return { board: g.board, dl: g.dl, dlB: D.best7([...g.dl, ...g.board]) }; };
C.api.hoCall = u => { const g = u.s.ho; if (!g) throw E('Pas de main.'); C.pay(u, g.a * 2); u.s.ho = null; g.board.push(g.dk.pop(), g.dk.pop());
  const me = D.best7([...g.me, ...g.board]), dl = D.best7([...g.dl, ...g.board]), qual = dl[0] > 1 || (dl[0] === 1 && dl[1] >= 4), aa = D.AA[me[0]] || 1, A = g.a, Cl = A * 2; let pay = 0, res;
  if (!qual) { pay = A * (1 + aa) + Cl; res = 'nq'; } else { const c = D.hcmp(me, dl); if (c > 0) { pay = A * (1 + aa) + Cl * 2; res = 'win'; } else if (c === 0) { pay = A + Cl; res = 'push'; } else res = 'lose'; }
  pay = cw(u, pay, A + Cl); if (pay) C.money(u, pay); C.result(u, 'holdem', A + Cl, pay); return { board: g.board, dl: g.dl, me, dlB: dl, res, pay, staked: A + Cl }; };

/* ---------- Craps ---------- */
C.api.cpBet = (u, p) => { open(u, 'craps'); const k = p.k; if (!['pass', 'dont', 'field'].includes(k)) throw E('Zone inconnue.'); const cp = u.d.cp = u.d.cp || { phase: 'come', point: 0, bets: {} };
  if (k !== 'field' && cp.phase === 'point') throw E('Attends la fin du point pour miser ici.'); const a = C.pay(u, p.amt); cp.bets[k] = (cp.bets[k] || 0) + a; return { cp }; };
C.api.cpRoll = u => { open(u); const cp = u.d.cp; if (!cp || !sumO(cp.bets)) throw E('Pose au moins un jeton.'); const d = [1 + Math.random() * 6 | 0, 1 + Math.random() * 6 | 0], s = d[0] + d[1], B = cp.bets, res = []; let st = 0, pay = 0;
  if (B.field) { st += B.field; const m = [3, 4, 9, 10, 11].includes(s) ? 2 : s === 2 ? 3 : s === 12 ? 4 : 0; pay += B.field * m; res.push(m ? 'Field gagnant' : 'Field perdu'); delete B.field; }
  if (cp.phase === 'come') { if (s === 7 || s === 11) { if (B.pass) { st += B.pass; pay += B.pass * 2; res.push('Pass gagne'); } if (B.dont) { st += B.dont; res.push('Don\'t Pass perd'); } delete B.pass; delete B.dont; }
    else if ([2, 3, 12].includes(s)) { if (B.pass) { st += B.pass; res.push('Craps ! Pass perd'); } if (B.dont) { st += B.dont; pay += s === 12 ? B.dont : B.dont * 2; res.push(s === 12 ? 'Don\'t Pass rendu' : 'Don\'t Pass gagne'); } delete B.pass; delete B.dont; }
    else if (B.pass || B.dont) { cp.phase = 'point'; cp.point = s; res.push('Le point est ' + s); } }
  else { if (s === cp.point) { if (B.pass) { st += B.pass; pay += B.pass * 2; } if (B.dont) st += B.dont; res.push('Point refait ! Pass gagne'); delete B.pass; delete B.dont; cp.phase = 'come'; cp.point = 0; }
    else if (s === 7) { if (B.pass) st += B.pass; if (B.dont) { st += B.dont; pay += B.dont * 2; } res.push('Seven out ! Don\'t Pass gagne'); delete B.pass; delete B.dont; cp.phase = 'come'; cp.point = 0; } }
  pay = cw(u, pay, st); if (pay) C.money(u, pay); if (st) C.result(u, 'craps', st, pay); C.markDirty(u); return { d, s, res, st, pay, cp }; };

/* ---------- Courses de rue ---------- */
C.api.streetRace = (u, p) => { const b = D.BOTCARS[+p.i]; if (!b) throw E('Adversaire inconnu.'); const cars = Object.keys(D.CARS).filter(id => u.d.items.includes(id)).sort((a, c) => D.CARS[c] - D.CARS[a]); if (!cars.length) throw E('Il te faut une voiture.');
  const sp = D.CARS[cars[0]], pr = sp / (sp + b[2]), odd = Math.max(1.1, Math.min(10, .95 / pr)), amt = C.pay(u, p.amt), win = Math.random() < pr, pay = win ? Math.round(amt * odd) : 0;
  if (win) { u.d.street.w++; C.money(u, pay); } else u.d.street.l++; C.result(u, 'street', amt, pay); return { win, pay, car: cars[0], sp, odd }; };
