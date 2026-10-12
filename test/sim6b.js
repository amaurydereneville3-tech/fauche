// Test des fonctions sociales V6 : semaine, pickpocket, prime, sabotage, rush, drop, braquage 2.0, prison, braquage entre potes
const { io } = require('socket.io-client');
const D = require('../public/data6');
const URL = process.env.URL || 'http://localhost:3995';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function login(pseudo) {
  let r = await fetch(URL + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123', age: true }) });
  if (r.status === 409) r = await fetch(URL + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pseudo, pass: 'secret123' }) });
  const { token } = await r.json(); const s = io(URL, { auth: { token } }); const st = { me: null, ev: {}, last: {} };
  s.onAny((e, d) => { st.ev[e] = (st.ev[e] || 0) + 1; st.last[e] = d; if (e === 'me') st.me = d; });
  const api = async (n, p, quiet) => { await sleep(40); return new Promise(res => s.emit('api', n, p || {}, x => { if (!x.ok && !quiet) errs.push(pseudo + ' ' + n + ': ' + x.err); res(x.r || {}); })); };
  await new Promise(r => s.on('me', r)); return { s, st, api };
}
const msFor = (zx, zone, speed, ph) => { for (let ms = 50; ms < 8000; ms += 10) { const p = D.needle(ms, speed, ph); if (p >= zx + zone * .3 && p <= zx + zone * .7) return ms; } return 0; };
(async () => {
  const t = Date.now() % 1000, A = await login('SocA' + t), B = await login('SocB' + t), M = await login('monorime');
  for (const P of [A, B]) { await P.api('tutoDone'); await M.api('admLevel', { id: P.st.me.id, xp: 60000 }); await M.api('admGive', { id: P.st.me.id, amt: 3000000 }); }
  await sleep(400);
  await B.api('bizBuy', { id: 'kebab' }, true); await A.api('bizBuy', { id: 'kebab' }, true);
  console.log('weekTop', JSON.stringify(await A.api('weekTop')).slice(0, 150));
  console.log('pickpocket', JSON.stringify(await A.api('pickpocket', { id: B.st.me.id })));
  console.log('bounty', JSON.stringify(await A.api('bounty', { id: B.st.me.id, amt: 5000 })));
  console.log('sabotage', JSON.stringify(await A.api('sabotage', { id: B.st.me.id })));
  const rs = await A.api('rushStart'); await sleep(3000); console.log('rush', JSON.stringify(await A.api('rushEnd', { n: 30 })));
  await M.api('admEvent', { type: 'drop', amt: 3000 }); await sleep(300); const dropId = A.st.last.drop && A.st.last.drop.id; console.log('drop', dropId, JSON.stringify(await B.api('dropClaim', { id: dropId })), JSON.stringify(await A.api('dropClaim', { id: dropId }, true)));
  await M.api('admEvent', { type: 'happy' }); await sleep(200); console.log('happy', A.st.me.happyUntil > Date.now());
  // braquage 2.0
  let r = await A.api('heStart', { i: 0 }); let guard = 0;
  while (r && r.zx !== undefined && guard++ < 5) { const ms = msFor(r.zx, r.zone, r.speed, r.ph); await sleep(Math.max(0, ms - 200)); r = await A.api('hePick', { ms }); if (r.phase === 'hack') break; }
  console.log('after lock', r.phase, r.seq && r.seq.length);
  if (r.phase === 'hack') { r = await A.api('heHack', { ans: r.seq }); console.log('hack', JSON.stringify(r));
    for (let k = 0; k < 6 && r.phase !== 'run' && !r.caught; k++) r = await A.api('heSafe', { g: ['012', '345', '678', '901', '234', '567'][k] }); console.log('safe', JSON.stringify(r).slice(0, 120));
    while (r.phase === 'run' || (r.turn !== undefined && !r.caught && r.phase !== 'split')) { r = await A.api('heTurn', { c: 1 - (r.hint || 0) }); if (r.caught || r.phase === 'split') break; }
    console.log('run end', JSON.stringify(r).slice(0, 120)); if (r.phase === 'split') console.log('split', JSON.stringify(await A.api('heSplit', { all: false })));
    if (r.caught) { await sleep(200); console.log('jail', A.st.me.jailUntil > Date.now(), JSON.stringify(await A.api('jailBribe'))); } }
  // braquage entre potes
  const c = await B.api('crewCreate', { i: 0 }); await B.api('crewInvite', { id: c.id, to: A.st.me.id }); await sleep(200); console.log('invite event', A.st.last.event && A.st.last.event.type);
  await A.api('crewJoin', { id: c.id }); await B.api('crewLaunch'); await sleep(300);
  for (const P of [A, B]) { const n = P.st.last.crew.needle; const ms = msFor(n.zx, n.zone, n.speed, n.ph); P.pick = P.api('crewPick', { ms }); }
  console.log('picks', JSON.stringify(await A.pick), JSON.stringify(await B.pick)); await sleep(300); console.log('crew phase', A.st.last.crew.phase, A.st.last.crew.loot);
  if (A.st.last.crew.phase === 'vote') { await A.api('crewVote', { betray: true }); await B.api('crewVote', { betray: false }); await sleep(400); console.log('crew done', JSON.stringify(A.st.last.crew.members.map(m => [m.pseudo, m.gain, m.betray])), A.st.last.crew.res); }
  console.log('ERREURS', errs); process.exit(0);
})();
