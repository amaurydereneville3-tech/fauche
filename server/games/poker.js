// Poker Texas Hold'em No Limit, 6 places, cartes distribuées par le serveur.
const C = require('../core');
const { D, pick, shuffle, E } = C;

const RANKS = '23456789TJQKA';
const SUITS = ['♠', '♥', '♦', '♣'];
const BOTS = ['Bot Gégé', 'Bot Ginette', 'Bot Dédé', 'Bot Mimi', 'Bot Jacky', 'Bot Nono'];
const ACT_MS = 25000;

/* ---------- Évaluation des mains ---------- */
const CAT = ['Carte haute', 'Paire', 'Double paire', 'Brelan', 'Suite', 'Couleur', 'Full', 'Carré', 'Quinte flush'];
function eval5(cs) {
  const v = cs.map(c => RANKS.indexOf(c[0])).sort((a, b) => b - a), s = cs.map(c => c[1]);
  const flush = s.every(x => x === s[0]);
  let uniq = [...new Set(v)], straight = 0;
  if (uniq.length === 5) { if (v[0] - v[4] === 4) straight = v[0]; else if (v.join() === '12,3,2,1,0') straight = 3; }
  const cnt = {}; v.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
  const g = Object.entries(cnt).map(([r, n]) => [n, +r]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const kick = g.map(x => x[1]);
  if (straight && flush) return [8, straight];
  if (g[0][0] === 4) return [7, ...kick];
  if (g[0][0] === 3 && g[1][0] === 2) return [6, ...kick];
  if (flush) return [5, ...v];
  if (straight) return [4, straight];
  if (g[0][0] === 3) return [3, ...kick];
  if (g[0][0] === 2 && g[1][0] === 2) return [2, ...kick];
  if (g[0][0] === 2) return [1, ...kick];
  return [0, ...v];
}
const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
function best(cards) { let b = null; const n = cards.length;
  const go = (start, pickd) => { if (pickd.length === 5) { const e = eval5(pickd); if (!b || cmp(e, b) > 0) b = e; return; } for (let i = start; i < n; i++) go(i + 1, [...pickd, cards[i]]); };
  go(0, []); return b; }

/* ---------- Tables ---------- */
const T = {};
D.POKER.forEach(cfg => { T[cfg.id] = { cfg, seats: Array(6).fill(null), dealer: -1, deck: [], board: [], phase: 'wait', toAct: -1, deadline: 0, bet: 0, minRaise: cfg.bb, hand: 0, msg: 'En attente de joueurs…', show: null, timer: null, log: [] }; });

function seatView(t, s, i, viewer) {
  if (!s) return null;
  const showCards = (t.phase === 'show' && s.shown) || (viewer && s.uid === viewer);
  return { i, pseudo: s.pseudo, face: s.face, acc: s.acc, bot: s.bot, uid: s.uid, stack: s.stack, bet: s.bet, folded: s.folded, allin: s.allin, inHand: s.inHand, away: s.away,
    cards: s.inHand ? (showCards ? s.cards : ['??', '??']) : [], hand: showCards && s.handName ? s.handName : '', win: s.win || 0 };
}
function view(t, uid) {
  return { id: t.cfg.id, cfg: t.cfg, phase: t.phase, board: t.board, pot: pot(t), toAct: t.toAct, deadline: t.deadline, bet: t.bet, minRaise: t.minRaise, dealer: t.dealer, msg: t.msg, hand: t.hand,
    seats: t.seats.map((s, i) => seatView(t, s, i, uid)), me: t.seats.findIndex(s => s && s.uid === uid), now: Date.now(), log: t.log.slice(-6) };
}
const pot = t => t.seats.reduce((a, s) => a + (s ? s.total : 0), 0);
function emit(t) {
  const room = C.io.sockets.adapter.rooms.get('pk:' + t.cfg.id);
  if (room) room.forEach(sid => { const so = C.io.sockets.sockets.get(sid); if (so) so.emit('pk', view(t, so.uid)); });
  C.io.to('lobby').emit('pkLobby', lobby());
}
function lobby() { return D.POKER.map(c => { const t = T[c.id]; return { id: c.id, n: t.seats.filter(s => s && !s.bot).length, bots: t.seats.filter(s => s && s.bot).length }; }); }
function log(t, m) { t.log.push(m); if (t.log.length > 20) t.log.shift(); }

/* ---------- Joueurs assis ---------- */
function humans(t) { return t.seats.filter(s => s && !s.bot); }
function fillBots(t) {
  const h = humans(t).length;
  if (!h) { t.seats.forEach((s, i) => { if (s && s.bot && !s.inHand) t.seats[i] = null; }); return; }
  let total = t.seats.filter(Boolean).length;
  while (total < 3) { const i = t.seats.findIndex(s => !s); if (i < 0) break; const used = t.seats.filter(Boolean).map(s => s.pseudo); const nm = BOTS.find(b => !used.includes(b));
    t.seats[i] = { bot: true, uid: null, pseudo: nm, face: '🤖', acc: '', stack: t.cfg.max, cards: [], bet: 0, total: 0, folded: false, allin: false, inHand: false, acted: false }; total++; }
  // trop de bots quand des humains arrivent
  while (t.seats.filter(Boolean).length > 3 && t.seats.some(s => s && s.bot && !s.inHand)) { const i = t.seats.findIndex(s => s && s.bot && !s.inHand); t.seats[i] = null; }
}
async function standUp(t, i, why) {
  const s = t.seats[i]; if (!s) return;
  if (s.inHand && !s.folded && t.phase === 'hand') { s.folded = true; log(t, s.pseudo + ' quitte la table'); }
  t.seats[i] = null;
  if (!s.bot && s.stack > 0) { const u = await C.getUser(s.uid); if (u) { C.money(u, s.stack); if (why) C.notify(u, { ic: '♠️', from: t.cfg.nm, body: why }); } }
  if (t.phase === 'hand') { if (t.toAct === i) next(t); else if (live(t).length <= 1) finish(t); }
  fillBots(t); emit(t); maybeStart(t);
}
function live(t) { return t.seats.map((s, i) => s && s.inHand && !s.folded ? i : -1).filter(i => i >= 0); }
function canAct(t) { return live(t).filter(i => !t.seats[i].allin); }
const nextIdx = (t, from, f) => { for (let k = 1; k <= 6; k++) { const i = (from + k) % 6; if (t.seats[i] && f(t.seats[i], i)) return i; } return -1; };

/* ---------- Déroulé d'une main ---------- */
function maybeStart(t) {
  if (t.phase !== 'wait') return;
  const ready = t.seats.filter(s => s && s.stack >= t.cfg.bb && !s.away);
  if (ready.length < 2 || !humans(t).length) { t.msg = humans(t).length ? 'En attente d\'un deuxième joueur…' : 'En attente de joueurs…'; return; }
  clearTimeout(t.timer); t.timer = setTimeout(() => startHand(t), 2500); t.msg = 'Nouvelle main dans un instant…';
}
function startHand(t) {
  if (t.phase !== 'wait') return;
  t.seats.forEach(s => { if (s && s.bot && s.stack < t.cfg.bb * 10) s.stack = t.cfg.max; });
  const players = t.seats.map((s, i) => s && s.stack >= t.cfg.bb && !s.away ? i : -1).filter(i => i >= 0);
  if (players.length < 2 || !humans(t).length) { t.msg = 'En attente de joueurs…'; emit(t); return; }
  t.hand++; t.phase = 'hand'; t.board = []; t.show = null; t.log = [];
  t.deck = shuffle(RANKS.split('').flatMap(r => SUITS.map(s => r + s)));
  t.seats.forEach(s => { if (!s) return; Object.assign(s, { cards: [], bet: 0, total: 0, folded: false, allin: false, acted: false, inHand: false, shown: false, handName: '', win: 0 }); });
  players.forEach(i => { t.seats[i].inHand = true; t.seats[i].cards = [t.deck.pop(), t.deck.pop()]; });
  t.dealer = nextIdx(t, t.dealer < 0 ? 0 : t.dealer, s => s.inHand);
  const heads = players.length === 2;
  const sb = heads ? t.dealer : nextIdx(t, t.dealer, s => s.inHand), bb = nextIdx(t, sb, s => s.inHand);
  post(t, sb, t.cfg.sb); post(t, bb, t.cfg.bb); t.bet = t.cfg.bb; t.minRaise = t.cfg.bb;
  log(t, `Main n°${t.hand} : blindes ${t.cfg.sb}/${t.cfg.bb}`);
  humans(t).forEach(s => { if (s.inHand) C.getUser(s.uid).then(u => u && C.track(u, 'play', 'poker', 1)); });
  t.toAct = nextIdx(t, bb, s => s.inHand && !s.folded && !s.allin);
  t.msg = ''; turn(t);
}
function post(t, i, a) { const s = t.seats[i]; const x = Math.min(a, s.stack); s.stack -= x; s.bet += x; s.total += x; if (!s.stack) s.allin = true; }
function turn(t) {
  clearTimeout(t.timer);
  if (t.toAct < 0) return endRound(t);
  const s = t.seats[t.toAct]; t.deadline = Date.now() + (s.bot ? 1500 : ACT_MS); emit(t);
  if (s.bot) t.timer = setTimeout(() => botAct(t), 900 + Math.random() * 1400);
  else t.timer = setTimeout(() => { s.timeouts = (s.timeouts || 0) + 1; try { act(t, t.toAct, s.bet >= t.bet ? 'check' : 'fold'); } catch (e) {} if (s.timeouts >= 2) { s.away = true; standUp(t, t.seats.indexOf(s), 'Tu as été levé de la table après 2 tours sans jouer.'); } }, ACT_MS);
}
function act(t, i, a, amount) {
  const s = t.seats[i]; if (!s || t.phase !== 'hand' || t.toAct !== i) throw E('Ce n\'est pas ton tour.');
  const toCall = t.bet - s.bet;
  if (a === 'fold') { s.folded = true; log(t, s.pseudo + ' se couche'); }
  else if (a === 'check') { if (toCall > 0) throw E('Tu dois suivre ou te coucher.'); log(t, s.pseudo + ' checke'); }
  else if (a === 'call') { const x = Math.min(toCall, s.stack); s.stack -= x; s.bet += x; s.total += x; if (!s.stack) s.allin = true; log(t, s.pseudo + (s.allin ? ' fait tapis' : ' suit')); }
  else if (a === 'raise' || a === 'allin') {
    let to = a === 'allin' ? s.bet + s.stack : Math.floor(Number(amount));
    if (!Number.isFinite(to)) throw E('Montant invalide.');
    to = Math.min(to, s.bet + s.stack);
    const raise = to - t.bet;
    if (to <= t.bet) { if (a === 'allin') return act(t, i, 'call'); throw E('Relance trop petite.'); }
    if (raise < t.minRaise && to < s.bet + s.stack) throw E('Relance minimum : ' + (t.bet + t.minRaise));
    const x = to - s.bet; s.stack -= x; s.bet = to; s.total += x; if (!s.stack) s.allin = true;
    if (raise >= t.minRaise) { t.minRaise = raise; t.seats.forEach(o => { if (o && o !== s) o.acted = false; }); }
    t.bet = Math.max(t.bet, to); log(t, s.pseudo + (s.allin ? ' fait tapis à ' : ' relance à ') + C.eur(to));
  } else throw E('Action inconnue.');
  s.acted = true;
  if (live(t).length <= 1) return finish(t);
  next(t);
}
function next(t) {
  const pending = canAct(t).filter(i => !t.seats[i].acted || t.seats[i].bet < t.bet);
  if (!pending.length || (canAct(t).length <= 1 && canAct(t).every(i => t.seats[i].bet >= t.bet))) { t.toAct = -1; return endRound(t); }
  t.toAct = nextIdx(t, t.toAct, (s, i) => pending.includes(i)); turn(t);
}
function endRound(t) {
  clearTimeout(t.timer);
  t.seats.forEach(s => { if (s) { s.bet = 0; s.acted = false; } }); t.bet = 0; t.minRaise = t.cfg.bb;
  if (live(t).length <= 1) return finish(t);
  if (t.board.length === 5) return finish(t);
  const n = t.board.length === 0 ? 3 : 1; t.deck.pop(); for (let k = 0; k < n; k++) t.board.push(t.deck.pop());
  log(t, ['', '', '', 'Flop', 'Turn', 'River'][t.board.length] + ' : ' + t.board.slice(-n).join(' '));
  if (canAct(t).length <= 1) { t.toAct = -1; emit(t); t.timer = setTimeout(() => endRound(t), 1800); return; }
  t.toAct = nextIdx(t, t.dealer, (s, i) => s.inHand && !s.folded && !s.allin); turn(t);
}
async function finish(t) {
  clearTimeout(t.timer); t.toAct = -1;
  const alive = live(t);
  const contrib = t.seats.map(s => s ? s.total : 0);
  let showdown = alive.length > 1;
  if (showdown) alive.forEach(i => { const s = t.seats[i]; s.rank = best([...s.cards, ...t.board]); s.handName = CAT[s.rank[0]]; s.shown = true; });
  // pots principaux et pots annexes
  const levels = [...new Set(contrib.filter(x => x > 0))].sort((a, b) => a - b); let prev = 0;
  const wins = Array(6).fill(0);
  levels.forEach(L => {
    let amt = 0; contrib.forEach(c => { amt += Math.max(0, Math.min(c, L) - prev); });
    const elig = alive.filter(i => contrib[i] >= L);
    if (amt > 0) {
      let winners = elig;
      if (showdown && elig.length > 1) { let b = null; elig.forEach(i => { const r = t.seats[i].rank; if (!b || cmp(r, b) > 0) b = r; }); winners = elig.filter(i => cmp(t.seats[i].rank, b) === 0); }
      if (!winners.length) { winners = alive; }
      const share = Math.floor(amt / winners.length); winners.forEach(i => wins[i] += share);
      let rest = amt - share * winners.length; if (rest) { const w = nextIdx(t, t.dealer, (s, i) => winners.includes(i)); wins[w >= 0 ? w : winners[0]] += rest; }
    }
    prev = L;
  });
  const anyHumanOpp = humans(t).filter(s => s.inHand).length >= 2;
  for (let i = 0; i < 6; i++) { const s = t.seats[i]; if (!s || !s.inHand) continue; s.win = wins[i]; s.stack += wins[i];
    if (wins[i] > 0) log(t, `${s.pseudo} gagne ${C.eur(wins[i])}${showdown && s.handName ? ' avec ' + s.handName.toLowerCase() : ''}`);
    if (!s.bot) { const u = await C.getUser(s.uid); if (u) { const net = wins[i] - s.total; if (net > 0) { u.d.wins++; u.d.streakW++; u.d.streakL = 0; C.xp(u, 10); C.track(u, 'win', 'poker', 1); if (anyHumanOpp) { u.d.pkWins++; } if (net >= 1000) C.feed(`<b>${C.esc(u.pseudo)}</b> remporte un pot de ${C.eur(wins[i])} au poker`); } else if (net < 0) { u.d.losses++; u.d.streakL++; u.d.streakW = 0; } u.d.played++; C.xp(u, 4); C.checkAch(u); C.markDirty(u); } } }
  t.phase = 'show'; t.msg = showdown ? 'Abattage !' : 'Pot remporté'; emit(t);
  t.timer = setTimeout(() => { t.phase = 'wait'; t.board = []; t.seats.forEach((s, i) => { if (!s) return; s.inHand = false; s.cards = []; s.total = 0; s.win = 0; s.shown = false; s.handName = '';
    if (s.bot && !humans(t).length) t.seats[i] = null; if (s && !s.bot && s.stack < t.cfg.bb) standUp(t, i, 'Tu n\'as plus assez de jetons : retour à la caisse.'); });
    fillBots(t); emit(t); maybeStart(t); }, showdown ? 6000 : 3000);
}

/* ---------- Bots ---------- */
function strength(s, board) {
  const c = s.cards.map(x => RANKS.indexOf(x[0])).sort((a, b) => b - a);
  if (!board.length) { let v = (c[0] + c[1]) / 24; if (c[0] === c[1]) v = .55 + c[0] / 26; if (s.cards[0][1] === s.cards[1][1]) v += .05; if (c[0] - c[1] === 1) v += .03; return Math.min(1, v); }
  const r = best([...s.cards, ...board]); return Math.min(1, r[0] / 6 + (r[1] || 0) / 60 + .1);
}
function botAct(t) {
  const i = t.toAct, s = t.seats[i]; if (!s || !s.bot) return;
  const st = strength(s, t.board) + (Math.random() - .5) * .2, toCall = t.bet - s.bet, p = pot(t);
  try {
    if (toCall <= 0) { if (st > .72 && Math.random() < .6) return act(t, i, 'raise', t.bet + Math.max(t.minRaise, Math.round(p * .6 / t.cfg.bb) * t.cfg.bb)); return act(t, i, 'check'); }
    const ratio = toCall / (p + toCall);
    if (st > .88 && Math.random() < .4) return act(t, i, 'raise', t.bet + Math.max(t.minRaise, Math.round(p / t.cfg.bb) * t.cfg.bb));
    if (st > ratio + .12 || (toCall <= t.cfg.bb && st > .25) || Math.random() < .04) return act(t, i, 'call');
    return act(t, i, 'fold');
  } catch (e) { try { act(t, i, toCall > 0 ? 'fold' : 'check'); } catch (e2) {} }
}

/* ---------- Actions joueurs ---------- */
const tbl = id => { const t = T[id]; if (!t) throw E('Table inconnue.'); return t; };
C.api.pkLobby = (u, p, s) => { s.join('lobby'); return { tables: lobby() }; };
C.api.pkJoin = (u, p, s) => { const t = tbl(p.id); s.join('pk:' + t.cfg.id); s.emit('pk', view(t, u.id)); return {}; };
C.api.pkLeaveRoom = (u, p, s) => { s.leave('pk:' + p.id); return {}; };
C.api.pkSit = (u, p) => {
  const t = tbl(p.id); if (t.seats.some(x => x && x.uid === u.id)) throw E('Tu es déjà assis.');
  let i = Number(p.seat); if (!(i >= 0 && i < 6) || (t.seats[i] && !(t.seats[i].bot && !t.seats[i].inHand))) i = t.seats.findIndex(x => !x || (x.bot && !x.inHand));
  if (i < 0) throw E('Table complète.');
  const buy = Math.max(t.cfg.min, Math.min(t.cfg.max, Math.floor(Number(p.buyin) || t.cfg.min)));
  C.pay(u, buy);
  t.seats[i] = { uid: u.id, pseudo: u.pseudo, face: u.d.av.face, acc: u.d.av.acc, stack: buy, cards: [], bet: 0, total: 0, folded: false, allin: false, inHand: false, acted: false, bot: false };
  log(t, u.pseudo + ' s\'assoit avec ' + C.eur(buy)); fillBots(t); emit(t); maybeStart(t); return {};
};
C.api.pkStand = async (u, p) => { const t = tbl(p.id); const i = t.seats.findIndex(x => x && x.uid === u.id); if (i < 0) throw E('Tu n\'es pas assis.'); await standUp(t, i); return {}; };
C.api.pkAct = (u, p) => { const t = tbl(p.id); const i = t.seats.findIndex(x => x && x.uid === u.id); if (i < 0) throw E('Tu n\'es pas assis.'); t.seats[i].timeouts = 0; act(t, i, String(p.a), p.amount); return {}; };
C.api.pkEmote = (u, p) => { const t = tbl(p.id); const e = String(p.e || '').slice(0, 8); if (!['👍', '😂', '😱', '🔥', '🤡', '💸', '😡', '🍀'].includes(e)) throw E('Émoji invalide.'); C.io.to('pk:' + t.cfg.id).emit('emote', { pseudo: u.pseudo, e, table: t.cfg.id }); return {}; };
// joueur sans connexion : on le laisse jouer par le minuteur, il est levé après 2 tours manqués

module.exports = { best, eval5, cmp, T };
