// Test des jeux et fonctions V6 côté serveur
const { io } = require('socket.io-client');
const URL = process.env.URL || 'http://localhost:3995';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function login(pseudo) {
  let r = await fetch(URL + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123', age: true }) });
  if (r.status === 409) r = await fetch(URL + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123' }) });
  const { token } = await r.json(); const s = io(URL, { auth: { token } }); const st = { me: null, ev: {} };
  s.onAny((e, d) => { st.ev[e] = (st.ev[e] || 0) + 1; if (e === 'me') st.me = d; });
  const api = async (n, p, quiet) => { await sleep(40); return new Promise(res => s.emit('api', n, p || {}, x => { if (!x.ok && !quiet) errs.push(pseudo + ' ' + n + ': ' + x.err); res(x.r || {}); })); };
  await new Promise(r => s.on('me', r)); return { s, st, api };
}
(async () => {
  const A = await login('SimA' + (Date.now() % 1000)), B = await login('SimB' + (Date.now() % 1000));
  for (const P of [A, B]) { await P.api('tutoDone'); for (let i = 0; i < 6; i++) await P.api('loan', { amt: [1000, 5000, 20000, 100000][Math.min(3, i)] }, true); }
  const M = await login('monorime'); await M.api('admLevel', { id: A.st.me.id, xp: 60000 }); await M.api('admGive', { id: A.st.me.id, amt: 5000000 }); console.log('admin stats', JSON.stringify(await M.api('admStats')).slice(0, 160)); await sleep(300);
  console.log('cash', A.st.me.cash, 'lvl', A.st.me.lvl, 'admin', A.st.me.admin);
  // avatar + compte
  await A.api('avatar', { av: { hair: 'long', skin: 3, top: 'sweat' } }); await A.api('avatar', { av: { hat: 'couronne' } }, true);
  await A.api('setBio', { bio: 'Roi du Crash' }); const pr = await B.api('profile', { id: A.st.me.id }); console.log('profile', pr.pseudo, pr.bio, pr.av.v2.hair);
  await A.api('setPass', { old: 'secret123', pass: 'secret123' }); await A.api('bug', { text: 'Test de bug depuis la simu' });
  // ballon
  await A.api('blStart', { amt: 100, mode: 1 }); let k = 0, r; do { r = await A.api('blPump'); k++; } while (!r.pop && !r.done && k < 3); if (!r.pop && !r.done) r = await A.api('blOut'); console.log('ballon', JSON.stringify(r));
  // lingots
  const lg = await A.api('lgStart', { amt: 100 }); let t = await A.api('lgTap', { ms: 500 }); console.log('lingots tap1', JSON.stringify(t).slice(0, 90)); if (!t.lose && !t.done) console.log('lingots out', JSON.stringify(await A.api('lgOut')));
  // pousse, rps, dt, slots, battle
  console.log('pousse', JSON.stringify(await A.api('ppDrop', { amt: 50, lane: 1 })));
  console.log('rps bot', JSON.stringify(await A.api('rpsBot', { m: 0, amt: 50 })));
  const inv = await A.api('rpsInvite', { to: B.st.me.id, m: 1, amt: 200 }); await sleep(200); console.log('rps pvp', JSON.stringify(await B.api('rpsAnswer', { id: inv.id, yes: true, m: 2 })).slice(0, 120));
  console.log('dt', JSON.stringify(await A.api('dtPlay', { bets: { d: 50, tie: 10 } }), null, 0).slice(0, 120));
  const ts = await A.api('tslotSpin', { th: 'kebab', amt: 100 }, true); console.log('kebab', ts.total, ts.spins && ts.spins.length, errs.slice(-1));
  const bt = await A.api('crBattle', { c: 'b' }, true); console.log('battle', bt.res, bt.pay, bt.opp);
  // roulette à cheval
  await A.api('roJoin'); console.log('roBet', JSON.stringify(await A.api('roBet', { bets: { 's14-15': 10, 'q25': 10, 't3': 10, 'x5': 10, 's0-2': 10, 'q0': 10, n17: 10 } }, true)).slice(0, 120));
  // grande roue
  await A.api('wsJoin', {}, true); console.log('wsBet', JSON.stringify(await A.api('wsBet', { bets: { '1': 10, coin: 10 } }, true)));
  // arcade
  await A.api('arcStart', { id: 'velo' }); await sleep(2500); console.log('arc', JSON.stringify(await A.api('arcEnd', { score: 50 })));
  console.log('events A', Object.keys(A.st.ev).join(','));
  console.log('ERREURS', errs);
  process.exit(0);
})();
