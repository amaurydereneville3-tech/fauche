// Test des jeux V4/V5 côté serveur
const { io } = require('socket.io-client');
const URL = process.env.URL || 'http://localhost:3995';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
(async () => {
  let r = await fetch(URL + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo: 'Momo', pass: 'secret123', age: true }) });
  const { token } = await r.json(); const s = io(URL, { auth: { token } }); let me = null; const evs = {};
  s.onAny((e, d) => { evs[e] = (evs[e] || 0) + 1; if (e === 'me') me = d; });
  const api = async (n, p, quiet) => { await sleep(45); return new Promise(res => s.emit('api', n, p || {}, x => { if (!x.ok && !quiet) errs.push(n + ': ' + x.err); res(x.r || {}); })); };
  await new Promise(r => s.on('me', r));
  await api('tutoDone'); for (let i = 0; i < 8; i++) await api('loan', { amt: [1000, 5000, 20000, 100000][Math.min(3, i)] }, true);
  console.log('cash', me.cash);
  let x = await api('vpDeal', { amt: 50 }); x = await api('vpDraw', { held: [1, 1, 0, 0, 0] }); console.log('vp', x.e, x.pay);
  console.log('bac', JSON.stringify(await api('bacPlay', { bets: { p: 20, b: 20 } })).slice(0, 80));
  console.log('keno', (await api('kenoPlay', { picks: [1, 2, 3, 4, 5], amt: 20 })).h);
  console.log('dice', (await api('diceRoll', { amt: 20, target: 50, over: true })).r);
  console.log('limbo', (await api('limboPlay', { amt: 20, target: 2 })).r);
  await api('towStart', { amt: 50, mode: 0 }); x = await api('towPick', { i: 0 }); if (!x.dead) x = await api('towOut'); console.log('tower', JSON.stringify(x).slice(0, 60));
  console.log('wheel', (await api('wheelSpin', { bets: { 0: 20, 3: 10 } })).j);
  x = await api('goldSpin', { amt: 100 }); console.log('gold spins', x.spins.length, 'total', x.total);
  await api('chStart', { amt: 20, mode: 0 }); x = await api('chStep'); if (!x.dead) x = await api('chOut'); console.log('chicken', JSON.stringify(x));
  console.log('sicbo locked?', (await api('sicboPlay', { bets: { small: 10 } }, true)));
  console.log('crate', JSON.stringify(await api('crateOpen', { c: 'b' })).slice(0, 80));
  await api('petAdopt', { id: 'pig' }); await api('petFeed');
  x = await api('tourStart'); for (let i = 0; i < 20; i++) x = await api('tourSpin'); console.log('tour', x.rank, x.prize, (await api('tourTop')).list.length);
  x = await api('heStart', { i: 0 }); x = await api('hePick', { ms: 100 }); console.log('heist pick', JSON.stringify(x).slice(0, 90));
  for (let k = 0; k < 6 && x && !x.caught && x.phase !== 'run'; k++) x = await api('hePick', { ms: 100 });
  for (let k = 0; k < 4 && x && !x.caught && x.phase !== 'split'; k++) x = await api('heTurn', { c: 1 - (x.hint ?? 0) });
  if (x && x.phase === 'split') x = await api('heSplit', { all: false }); console.log('heist end', JSON.stringify(x).slice(0, 90));
  me && console.log('xp', me.xp, 'lvl', me.lvl, 'pass', me.pass.xp, 'hist', me.hist.length, 'day', JSON.stringify(me.day));
  // monter au niveau 6 pour les jeux verrouillés
  console.log('titles', (await api('titles')).list.length, 'wm', (await api('wmissions')).list.length);
  console.log('events', Object.keys(evs).join(','));
  console.log(errs.length ? 'ERREURS\n' + errs.join('\n') : 'aucune erreur'); process.exit(0);
})().catch(e => { console.error(e, errs); process.exit(1); });
