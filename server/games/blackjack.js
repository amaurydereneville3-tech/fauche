// Blackjack partagé : 5 places face au même croupier.
const C = require('../core');
const { D, shuffle, E } = C;
const SUITS = ['♠', '♥', '♦', '♣'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BET_MS = 12000, ACT_MS = 20000;
const cv = c => c.r === 'A' ? 11 : 'JQK'.includes(c.r) ? 10 : +c.r;
function tot(h) { let t = 0, a = 0; for (const c of h) { t += cv(c); if (c.r === 'A') a++; } while (t > 21 && a) { t -= 10; a--; } return { t, soft: a > 0 }; }
const isBJ = h => h.length === 2 && tot(h).t === 21;
function shoe() { const d = []; for (let n = 0; n < 6; n++) for (const s of SUITS) for (const r of RANKS) d.push({ r, s }); return shuffle(d); }

const T = {};
D.BJT.forEach(cfg => { T[cfg.id] = { cfg, seats: Array(5).fill(null), dealer: [], hole: true, shoe: shoe(), phase: 'idle', endsAt: 0, active: [-1, -1], deadline: 0, msg: 'Assieds-toi et mise pour lancer la partie.', timer: null }; });

function view(t, uid) {
  return { id: t.cfg.id, cfg: t.cfg, phase: t.phase, endsAt: t.endsAt, deadline: t.deadline, active: t.active, msg: t.msg, now: Date.now(),
    dealer: t.dealer.map((c, i) => i === 1 && t.hole ? null : c), dealerTot: t.dealer.length ? (t.hole ? cv(t.dealer[0]) : tot(t.dealer).t) : 0,
    spy: null, seats: t.seats.map((s, i) => s ? { i, uid: s.uid, pseudo: s.pseudo, face: s.face, bet: s.bet, hands: s.hands.map(h => ({ cards: h.cards, bet: h.bet, res: h.res, tot: h.cards.length ? tot(h.cards).t : 0, soft: tot(h.cards).soft })) } : null),
    me: t.seats.findIndex(s => s && s.uid === uid) };
}
function emit(t) {
  const room = C.io.sockets.adapter.rooms.get('bj:' + t.cfg.id);
  if (room) room.forEach(sid => { const so = C.io.sockets.sockets.get(sid); if (!so) return; const v = view(t, so.uid); const s = t.seats[v.me]; if (s && s.spy && t.hole && t.dealer[1]) v.spy = t.dealer[1]; so.emit('bj', v); });
}
function draw(t) { if (t.shoe.length < 20) t.shoe = shoe(); return t.shoe.pop(); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

function openBets(t) { t.phase = 'bet'; t.endsAt = Date.now() + BET_MS; t.dealer = []; t.hole = true; t.msg = 'Faites vos mises !';
  t.seats.forEach(s => { if (s) { s.bet = 0; s.hands = []; s.spy = false; } });
  clearTimeout(t.timer); t.timer = setTimeout(() => deal(t), BET_MS); emit(t); }
async function deal(t) {
  const players = t.seats.map((s, i) => s && s.bet > 0 ? i : -1).filter(i => i >= 0);
  if (!players.length) { t.seats.forEach((s, i) => { const u = s && C.users.get(s.uid); if (s && (!u || !u.sockets.size)) t.seats[i] = null; }); if (t.seats.some(Boolean)) return openBets(t); t.phase = 'idle'; t.msg = 'Assieds-toi et mise pour lancer la partie.'; return emit(t); }
  t.phase = 'deal'; t.msg = ''; t.dealer = []; t.hole = true;
  for (const i of players) { const s = t.seats[i]; s.hands = [{ cards: [], bet: s.bet, done: false, res: null }];
    const u = await C.getUser(s.uid); if (u && u.d.boosts.requin > 0) { u.d.boosts.requin--; s.spy = true; C.markDirty(u); } }
  for (let r = 0; r < 2; r++) { for (const i of players) { if (t.seats[i]) { t.seats[i].hands[0].cards.push(draw(t)); emit(t); await sleep(380); } } t.dealer.push(draw(t)); emit(t); await sleep(380); }
  if (cv(t.dealer[0]) >= 10) { t.msg = 'Le croupier vérifie son blackjack…'; emit(t); await sleep(900); if (isBJ(t.dealer)) { t.hole = false; t.msg = 'Blackjack du croupier !'; return settle(t); } t.msg = 'Pas de blackjack pour le croupier.'; }
  players.forEach(i => { const s = t.seats[i]; if (s && isBJ(s.hands[0].cards)) s.hands[0].done = true; });
  t.phase = 'play'; t.active = [-1, -1]; next(t);
}
function next(t) {
  clearTimeout(t.timer);
  for (let i = 0; i < 5; i++) { const s = t.seats[i]; if (!s || !s.hands.length) continue; const h = s.hands.findIndex(h => !h.done);
    if (h >= 0) { const hand = s.hands[h];
      if (hand.cards.length === 1) { hand.cards.push(draw(t)); if (hand.splitAces || tot(hand.cards).t >= 21) { hand.done = true; emit(t); return setTimeout(() => next(t), 500); } }
      t.active = [i, h]; t.deadline = Date.now() + ACT_MS; t.msg = s.pseudo + ' joue';
      t.timer = setTimeout(() => { try { action(t, i, 'stand'); } catch (e) {} }, ACT_MS); return emit(t); } }
  dealerTurn(t);
}
async function dealerTurn(t) {
  t.phase = 'dealer'; t.active = [-1, -1]; t.hole = false; t.msg = 'Au tour du croupier'; emit(t); await sleep(700);
  const alive = t.seats.some(s => s && s.hands.some(h => h.res !== 'bust'));
  if (alive) while (tot(t.dealer).t < 17) { t.dealer.push(draw(t)); emit(t); await sleep(650); }
  settle(t);
}
async function settle(t) {
  t.phase = 'done'; const d = tot(t.dealer).t, dBJ = isBJ(t.dealer);
  for (let i = 0; i < 5; i++) { const s = t.seats[i]; if (!s || !s.hands.length) continue; let payout = 0, staked = 0;
    for (const h of s.hands) { const p = tot(h.cards).t, nat = isBJ(h.cards) && !h.split; staked += h.bet; let m;
      if (h.res === 'bust') m = 0; else if (nat && !dBJ) { h.res = 'bj'; m = 2.5; } else if (dBJ && !nat) { h.res = 'lose'; m = 0; } else if (nat && dBJ) { h.res = 'push'; m = 1; }
      else if (d > 21 || p > d) { h.res = 'win'; m = 2; } else if (p === d) { h.res = 'push'; m = 1; } else { h.res = 'lose'; m = 0; }
      payout += Math.round(h.bet * m); }
    const u = await C.getUser(s.uid); if (u) { if (payout > staked) payout += C.casinoWin(u, payout - staked); if (payout) C.money(u, payout); C.result(u, 'bj', staked, payout); u.sockets.forEach(so => so.emit('bjRes', { net: payout - staked })); } }
  t.msg = dBJ ? 'Blackjack du croupier.' : d > 21 ? 'Le croupier saute à ' + d + ' !' : 'Le croupier fait ' + d + '.'; emit(t);
  clearTimeout(t.timer); t.timer = setTimeout(() => { if (t.seats.some(Boolean)) openBets(t); else { t.phase = 'idle'; t.dealer = []; emit(t); } }, 5000);
}
function action(t, i, a) {
  if (t.phase !== 'play' || t.active[0] !== i) throw E('Ce n\'est pas ton tour.');
  const s = t.seats[i], h = s.hands[t.active[1]];
  return C.getUser(s.uid).then(u => {
    if (a === 'hit') { h.cards.push(draw(t)); const x = tot(h.cards).t; if (x > 21) { h.res = 'bust'; h.done = true; } else if (x === 21) h.done = true; }
    else if (a === 'stand') h.done = true;
    else if (a === 'double') { if (h.cards.length !== 2 || h.splitAces) throw E('Doubler seulement sur 2 cartes.'); C.pay(u, h.bet); h.bet *= 2; h.cards.push(draw(t)); if (tot(h.cards).t > 21) h.res = 'bust'; h.done = true; }
    else if (a === 'split') { if (h.cards.length !== 2 || cv(h.cards[0]) !== cv(h.cards[1]) || s.hands.length >= 4) throw E('Séparation impossible.'); C.pay(u, h.bet);
      const c2 = h.cards.pop(), aces = c2.r === 'A'; h.split = true; h.splitAces = aces; s.hands.splice(t.active[1] + 1, 0, { cards: [c2], bet: h.bet, done: false, res: null, split: true, splitAces: aces });
      h.cards.push(draw(t)); if (aces || tot(h.cards).t === 21) h.done = true; }
    else throw E('Action inconnue.');
    if (h.done) next(t); else { t.deadline = Date.now() + ACT_MS; clearTimeout(t.timer); t.timer = setTimeout(() => { try { action(t, i, 'stand'); } catch (e) {} }, ACT_MS); emit(t); }
  });
}
const tbl = id => { const t = T[id]; if (!t) throw E('Table inconnue.'); return t; };
C.api.bjJoin = (u, p, s) => { const t = tbl(p.id); s.join('bj:' + t.cfg.id); emit(t); return {}; };
C.api.bjLeaveRoom = (u, p, s) => { s.leave('bj:' + p.id); return {}; };
C.api.bjSit = (u, p) => { const t = tbl(p.id); if (t.seats.some(x => x && x.uid === u.id)) throw E('Tu es déjà assis.'); let i = Number(p.seat); if (!(i >= 0 && i < 5) || t.seats[i]) i = t.seats.findIndex(x => !x); if (i < 0) throw E('Table complète.');
  t.seats[i] = { uid: u.id, pseudo: u.pseudo, face: u.d.av.face, bet: 0, hands: [] }; if (t.phase === 'idle') openBets(t); else emit(t); return {}; };
C.api.bjStand = (u, p) => { const t = tbl(p.id); const i = t.seats.findIndex(x => x && x.uid === u.id); if (i < 0) throw E('Tu n\'es pas assis.');
  const s = t.seats[i]; if (t.phase === 'bet' && s.bet) C.money(u, s.bet); else if (['deal', 'play', 'dealer'].includes(t.phase) && s.hands.length) throw E('Termine la main avant de te lever.');
  t.seats[i] = null; if (!t.seats.some(Boolean) && t.phase === 'bet') { clearTimeout(t.timer); t.phase = 'idle'; } emit(t); return {}; };
C.api.bjBet = (u, p) => { const t = tbl(p.id); if (t.phase !== 'bet') throw E('Attends l\'ouverture des mises.'); const s = t.seats.find(x => x && x.uid === u.id); if (!s) throw E('Assieds-toi d\'abord.');
  const a = C.int(p.amt); if (s.bet + a > t.cfg.max) throw E('Mise maximum à cette table : ' + C.eur(t.cfg.max)); if (s.bet + a < t.cfg.min) throw E('Mise minimum : ' + C.eur(t.cfg.min));
  C.pay(u, a); s.bet += a; emit(t); return {}; };
C.api.bjAct = async (u, p) => { const t = tbl(p.id); const i = t.seats.findIndex(x => x && x.uid === u.id); if (i < 0) throw E('Tu n\'es pas assis.'); await action(t, i, String(p.a)); return {}; };
C.api.bjLobby = () => ({ tables: D.BJT.map(c => ({ id: c.id, n: T[c.id].seats.filter(Boolean).length })) });
C.leave = C.leave || [];
C.leave.push((u) => { if (u.sockets.size) return; Object.values(T).forEach(t => { const i = t.seats.findIndex(x => x && x.uid === u.id); if (i >= 0 && (t.phase === 'idle' || (t.phase === 'bet' && !t.seats[i].bet))) { t.seats[i] = null; emit(t); } }); });
