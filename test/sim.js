// Test : plusieurs joueurs simulés jouent à tout en même temps.
const { io } = require('socket.io-client');
const URL = process.env.URL || 'http://localhost:3999';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
async function reg(pseudo) {
  let r = await fetch(URL + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123', age: true }) });
  if (r.status === 409) r = await fetch(URL + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123' }) });
  return (await r.json()).token;
}
async function player(name) {
  const token = await reg(name); const s = io(URL, { auth: { token } }); const P = { s, name, me: null, ev: {} };
  s.onAny((ev, d) => { P.ev[ev] = (P.ev[ev] || 0) + 1; if (ev === 'me') P.me = d; if (ev === 'pk') P.pk = d; if (ev === 'bj') P.bj = d; if (ev === 'crash') P.crash = d; if (ev === 'ro') P.ro = d; if (ev === 'race') P.race = d; if (ev === 'event') P.event = d; if (ev === 'duelAsk') P.duelAsk = d; });
  P.api = (n, p) => new Promise(res => s.emit('api', n, p || {}, r => { if (!r.ok && !P.quiet) errors.push(`${name} ${n}: ${r.err}`); res(r); }));
  await new Promise(r => s.on('me', r)); return P;
}
(async () => {
  const [a, b, c] = await Promise.all(['Amaury', 'Tom', 'Fabien'].map(player));
  console.log('connectés', a.me.cash, b.me.cash, c.me.cash);
  // Crash
  await a.api('crashJoin'); await b.api('crashJoin');
  while (a.crash.phase !== 'bet') await sleep(200);
  await a.api('crashBet', { amt: 50, auto: 1.5 }); await b.api('crashBet', { amt: 50 });
  // Roulette
  await a.api('roJoin'); while (a.ro.phase !== 'bet') await sleep(200);
  console.log('roBet', (await a.api('roBet', { bets: { red: 20, n17: 10 } })).ok);
  // Course
  await c.api('raceJoin'); while (c.race.phase !== 'bet') await sleep(200); console.log('raceBet', (await c.api('raceBet', { runner: 2, amt: 30 })).ok);
  // Poker : 2 humains + bots
  await a.api('pkJoin', { id: 'p1' }); await b.api('pkJoin', { id: 'p1' });
  await a.api('pkSit', { id: 'p1', buyin: 300 }); await b.api('pkSit', { id: 'p1', buyin: 300 });
  // Blackjack partagé
  await c.api('bjJoin', { id: 'b1' }); await c.api('bjSit', { id: 'b1' }); await c.api('bjBet', { id: 'b1', amt: 40 });
  // Solo
  console.log('slots', (await c.api('slots', { amt: 10 })).r);
  await c.api('miStart', { amt: 20, n: 3 }); const mp = await c.api('miPick', { i: 0 }); if (!mp.r.boom) await c.api('miOut');
  console.log('plinko', (await c.api('plinko', { amt: 5 })).r.m);
  const h = await c.api('hlStart', { amt: 10 }); const g = await c.api('hlGuess', { up: ['2', '3', '4', '5', '6', '7'].includes(h.r.card.r) }); if (g.r.ok) await c.api('hlOut');
  await c.api('diStart', { amt: 10 }); await c.api('diRoll', { keep: [1, 0, 0] }); console.log('421', (await c.api('diStop')).r.player.l);
  console.log('gratte', (await c.api('gratte', { t: 'p' })).r.mult); await c.api('grDone');
  const bn = await c.api('bnStart', { amt: 10 }); console.log('bonneteau', (await c.api('bnPick', { cup: bn.r.ball })).r);
  await c.api('pzPrizes', { price: 100 }); console.log('pince', (await c.api('pzGo', { x: 12 })).r.grab);
  console.log('duelBot', (await c.api('duelBot', { amt: 10, side: 0 })).r.win);
  // Duel entre joueurs
  await a.api('duelAsk', { to: b.me.id, amt: 25, side: 1 }); await sleep(300); console.log('duel', (await b.api('duelAnswer', { id: b.duelAsk.id, yes: true })).r.winner);
  // Sport
  const sp = await a.api('sportJoin'); const m = sp.r.matches.find(x => x.state === 'up'); console.log('sportBet', (await a.api('sportBet', { sels: [[m.id, 0]], amt: 20 })).ok);
  // Loto
  console.log('loto', (await a.api('lotoBuy', { nums: [1, 2, 3, 4, 5] })).r);
  // Bourse
  await a.api('mkJoin'); await a.api('mkOpen', { a: 'BTC', lev: 10, side: 1, amt: 50 }); await sleep(2100); const pos = a.me.pos[0]; console.log('mkClose', (await a.api('mkClose', { id: pos.id })).r);
  await a.api('moBet', { amt: 10, dir: 1 });
  // Business
  await a.api('loan', { amt: 1000 }); await a.api('loan', { amt: 1000 }); await sleep(100); console.log('cash après prêt', a.me.cash); await a.api('bizBuy', { id: 'kebab' });
  await a.api('aucJoin'); await sleep(5600); a.quiet = true; await a.api('bid'); a.quiet = false;
  // Boutique
  await b.api('loan', { amt: 1000 }); await b.api('boost', { id: 'cafe' }); await b.api('boost', { id: 'cafe' }); const em = await b.api('boost', { id: 'cafe' }); console.log('embrouille', em.r);
  if (em.r.embrouille) { let r; do { r = await b.api('rps', { m: 0 }); } while (r.r.res === 'draw'); console.log('rps', r.r.res); }
  await b.api('buy', { id: 'trot' }); await b.api('style', { face: '🙂', wall: 2 });
  // Social
  await a.api('say', { text: 'Salut la team, qui joue ?' }); console.log('top', (await a.api('top')).r.rows.length, 'profil', (await a.api('profile', { id: b.me.id })).r.pseudo);
  await b.api('loanAsk', { to: a.me.id, amt: 100, rate: 10 }); await sleep(200); const req = a.me.loanReq[0]; await a.api('loanAnswer', { id: req.id, yes: true }); await sleep(200);
  console.log('dette de Tom', b.me.fdebts[0]); await b.api('loanRepay', { id: b.me.fdebts[0].id });
  await c.api('jobStart', { id: 'kebab' }); await sleep(1500); console.log('job', (await c.api('jobEnd', { taps: 15 })).r);
  console.log('missions', (await c.api('missions')).r.list.length); console.log('chest', (await c.api('chest')).r, 'wheel', (await c.api('wheel')).r);
  // Laisser tourner les jeux en direct
  for (let k = 0; k < 40; k++) {
    await sleep(1000);
    for (const P of [a, b]) { const t = P.pk; if (t && t.phase === 'hand' && t.toAct === t.me) { const me = t.seats[t.me]; const bet = t.bet; P.quiet = true; await P.api('pkAct', { id: 'p1', a: bet > (me.bet || 0) ? 'call' : 'check' }); P.quiet = false; } }
    const bj = c.bj; if (bj && bj.phase === 'play' && bj.active[0] === bj.me) { const hand = bj.seats[bj.me].hands[bj.active[1]]; c.quiet = true; await c.api('bjAct', { id: 'b1', a: hand.tot < 15 ? 'hit' : 'stand' }); c.quiet = false; }
    if (bj && bj.phase === 'bet' && bj.seats[bj.me] && !bj.seats[bj.me].bet) { c.quiet = true; await c.api('bjBet', { id: 'b1', amt: 40 }); c.quiet = false; }
    if (a.crash && a.crash.phase === 'fly' && k % 3 === 0) { a.quiet = b.quiet = true; await b.api('crashOut'); a.quiet = b.quiet = false; }
  }
  console.log('poker main n°', a.pk.hand, 'phase', a.pk.phase, 'log', a.pk.log.slice(-3));
  console.log('bj', c.bj.phase, c.bj.msg);
  console.log('niveaux', a.me.lvl, b.me.lvl, c.me.lvl, 'cash', a.me.cash, b.me.cash, c.me.cash, 'xp', a.me.xp);
  console.log('events', Object.keys(a.ev).join(','));
  console.log(errors.length ? 'ERREURS:\n' + errors.join('\n') : 'aucune erreur');
  process.exit(0);
})().catch(e => { console.error('CRASH', e, errors); process.exit(1); });
