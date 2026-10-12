// Progression et vie de riche : caisses, animal, pass, missions de la semaine, titres, entreprises, événements, défis.
const C = require('../core');
const { D, rnd, pick, shuffle, E } = C;

/* ---------- Caisses mystère ---------- */
function pickLoot(c) { const tw = c.loot.reduce((a, l) => a + l[3], 0); let r = Math.random() * tw; for (const l of c.loot) { if ((r -= l[3]) < 0) return l; } return c.loot[0]; }
C.api.crateOpen = (u, p) => { const c = D.CRATES.find(x => x.id === p.c); if (!c) throw E('Caisse inconnue.'); const free = (u.d.freeCr[c.id] || 0) > 0; if (free) u.d.freeCr[c.id]--; else C.pay(u, c.pr);
  u.d.crates++; const l = pickLoot(c); let val = 0, dup = false;
  if (l[0] === 'cash') { val = l[1]; C.money(u, val); } else { const it = D.itemInfo(l[1]); if (u.d.items.includes(l[1])) { dup = true; val = Math.round(it.pr * .7); C.money(u, val); } else { u.d.items.push(l[1]); val = it.pr; C.track(u, 'buy', null, 1); } }
  if (l[2] === 'l') { C.feed(`<b>${C.esc(u.pseudo)}</b> sort un objet LÉGENDAIRE d'une ${c.nm} !`); C.sysChat && C.sysChat(`📦 ${u.pseudo} sort un objet LÉGENDAIRE d'une ${c.nm} !`); }
  C.checkAch(u); C.result(u, 'crate', free ? 0 : c.pr, l[0] === 'cash' ? l[1] : dup ? val : l[1] === 'x' ? 0 : D.itemInfo(l[1]).pr); return { loot: l, dup, val, free }; };

/* ---------- Animal ---------- */
C.api.petAdopt = (u, p) => { if (u.d.pet) throw E('Tu as déjà un animal.'); const P = D.PETS.find(x => x.id === p.id); if (!P) throw E('Animal inconnu.'); C.pay(u, P.pr); u.d.pet = { id: P.id, fedAt: Date.now(), bank: 0, born: Date.now() }; C.checkAch(u); return {}; };
C.api.petFeed = u => { if (!u.d.pet) throw E('Pas d\'animal.'); C.pay(u, D.FOOD_PR); u.d.pet.fedAt = Date.now(); return {}; };
C.api.petBreak = u => { if (!u.d.pet || u.d.pet.id !== 'pig') throw E('Pas de tirelire.'); const v = Math.round(u.d.pet.bank || 0); if (v < 1) throw E('La tirelire est vide.'); u.d.pet.bank = 0; C.money(u, v); return { v }; };
C.api.petFree = u => { u.d.pet = null; return {}; };

/* ---------- Pass de saison ---------- */
C.api.passClaim = (u, p) => { const i = +p.i, t = Math.min(D.PASS.length, Math.floor(u.d.pass.xp / D.PASS_XP)); if (!(i >= 0 && i < t) || u.d.pass.claimed.includes(i)) throw E('Palier pas encore atteint.');
  const [v, ty, nm, it] = D.PASS[i]; u.d.pass.claimed.push(i);
  if (ty === 'cash') C.money(u, v); else if (ty === 'crate') u.d.freeCr[v] = (u.d.freeCr[v] || 0) + 1; else if (ty === 'xpboost') u.d.xpBoostUntil = Math.max(Date.now(), u.d.xpBoostUntil) + v * 60000;
  else if (ty === 'face') { u.d.unlocks.push(v, 't:' + nm); if (it && !u.d.items.includes(it)) u.d.items.push(it); } else u.d.boosts[ty] = (u.d.boosts[ty] || 0) + v; return {}; };

/* ---------- Missions de la semaine ---------- */
C.api.wmissions = u => ({ list: C.weekMissions(u) });
C.api.wclaim = (u, p) => { const m = C.weekMissions(u).find(x => x.id === p.id), M = D.WMIS.find(x => x.id === p.id); if (!m || !M || m.c || m.p < M.n) throw E('Mission pas encore terminée.'); m.c = true; C.money(u, M.rw); C.xp(u, 200); return {}; };

/* ---------- Titres ---------- */
function titles(u) { const t = D.TITLES.filter(([l]) => C.LV(u) >= l).map(x => x[1]); D.ACH.forEach(a => { if (u.d.ach.includes(a.id)) t.push(a.nm); }); u.d.unlocks.filter(x => x.startsWith('t:')).forEach(x => t.push(x.slice(2))); return [...new Set(t)]; }
C.api.titles = u => ({ list: titles(u) });
C.api.setTitle = (u, p) => { const t = String(p.t || ''); if (t && !titles(u).includes(t)) throw E('Titre verrouillé.'); u.d.titleSel = t; return {}; };

/* ---------- Entreprises améliorables ---------- */
C.api.bizUp = (u, p) => { const b = D.BIZ.find(x => x.id === p.id); if (!b || !u.d.biz.includes(b.id)) throw E('Tu ne possèdes pas cette entreprise.'); const lv = u.d.bizLv[b.id] || 1; if (lv >= 5) throw E('Niveau maximum.');
  const pe = C.pending(u.d); if (pe > 0) C.money(u, pe); u.d.lastCollect = Date.now(); C.pay(u, D.bizUpCost(b, lv)); u.d.bizLv[b.id] = lv + 1; C.track(u, 'buy', null, 1); return { lv: lv + 1 }; };

/* ---------- Tutoriel ---------- */
C.api.tutoDone = u => { if (u.d.tutoDone) return {}; u.d.tutoDone = true; C.money(u, 500); return { bonus: 500 }; };

/* ---------- Défis lancés par le Croupier ---------- */
const CHALS = [['crash', 5], ['limbo', 10], ['tower', 5], ['chicken', 6], ['mines', 3], ['pen', 3], ['dice', 5]];
const chalTxt = (g, m) => g === 'tower' ? m + ' étages à la Tour' : g === 'chicken' ? m + ' voies à La Poule' : g === 'pen' ? m + ' buts aux tirs au but' : '×' + String(m).replace('.', ',') + ' ' + D.GN[g];
const _res = C.result;
C.result = (u, game, stake, payout, extra = {}) => { _res(u, game, stake, payout, extra); const c = u.d.challenge;
  if (c && !c.done && Date.now() < c.until && c.game === game && (extra.mult || 0) >= c.mult) { c.done = true; c.won = true; C.money(u, c.amt); C.notify(u, { ic: '🤝', from: 'Défi réussi', body: 'Le Croupier te paie ' + C.eur(c.amt) + ' !', big: 1 }); } };
C.api.chalAnswer = (u, p) => { const o = u.s.chalOffer; if (!o) throw E('Ce défi n\'existe plus.'); u.s.chalOffer = null; if (!p.yes) return {}; u.d.challenge = { ...o, until: Date.now() + 600000, done: false, txt: chalTxt(o.game, o.mult) }; return { c: u.d.challenge }; };

/* ---------- Événements personnels ---------- */
function send(u, ev) { u.sockets.forEach(s => s.emit('event', ev)); }
const EV2 = {
  rain: u => { u.s.rain = { t: Date.now() }; send(u, { type: 'rain' }); },
  ex: u => { if (u.d.cash < 20000) return false; u.s.evp = 'ex'; send(u, { type: 'ex' }); },
  influ: u => { u.s.evp = 'influ'; send(u, { type: 'influ', car: u.d.items.includes('911') ? 'Porsche' : 'Clio' }); },
  police: u => { const car = ['ecurie', 'sp_car', '911', 'clio', 'scoot'].find(id => u.d.items.includes(id)); if (!car) return false; u.s.evp = 'police'; send(u, { type: 'police', car: D.itemInfo(car).nm }); },
  chal: u => { const c = u.d.challenge; if (c && !c.done && Date.now() < c.until) return false; const [g, m] = pick(CHALS); const amt = Math.max(200, Math.round(Math.min(u.d.cash * .1, 50000) / 100) * 100);
    u.s.chalOffer = { game: g, mult: m, amt }; send(u, { type: 'chal', game: g, mult: m, amt, txt: chalTxt(g, m) }); } };
C.api.rainEnd = (u, p) => { const r = u.s.rain; if (!r) throw E('Pas de pluie en cours.'); u.s.rain = null; const el = (Date.now() - r.t) / 1000; const n = Math.max(0, Math.min(Math.floor(+p.n || 0), Math.floor(Math.min(el, 12) * 4.5)));
  const big = Math.max(0, Math.min(Math.floor(+p.big || 0), Math.ceil(n / 4))); const per = Math.round(25 * (1 + C.LV(u) * .3)); const amt = (n - big) * per + big * per * 4; if (amt) C.money(u, amt); return { amt }; };
C.api.evAnswer = (u, p) => { const k = u.s.evp; if (!k || k !== p.type) throw E('Événement expiré.'); u.s.evp = null; const c = +p.c; let txt, amt = 0;
  if (k === 'ex') { if (c === 1) { amt = -Math.round(Math.min(u.d.cash * .05, 30000)); u.d.exPaid++; txt = 'Elle a commandé la langouste, deux desserts et un taxi. Puis elle est partie avec son nouveau copain.'; } else { txt = 'Vu, pas répondu. Respect. Ton compte en banque te remercie.'; C.xp(u, 30); } }
  else if (k === 'influ') { if (c === 1) { amt = Math.round(rnd(500, 3000) * (1 + C.LV(u) * .2)); C.feed(`<b>${C.esc(u.pseudo)}</b> fait le buzz sur les réseaux`); txt = 'Le selfie fait 400 000 vues. Une marque te paie pour apparaître dans la prochaine vidéo.'; } else txt = 'Il fait le selfie avec ton voisin. Ton voisin devient célèbre.'; }
  else if (k === 'police') { if (c === 0) { if (Math.random() < .85) txt = 'Tout est en règle. « Bonne journée. »'; else { txt = 'Ton contrôle technique est périmé. Amende.'; amt = -135; } }
    else if (c === 1) { if (Math.random() < .3) { txt = 'Le policier est fan de Fauché. Il te demande un autographe et repart.'; amt = 150; } else { txt = 'Mauvaise réponse. Contrôle complet de 45 minutes et amende pour attitude.'; amt = -Math.round(Math.max(300, u.d.cash * .02)); } }
    else { if (Math.random() < .4) { txt = 'Tu les sèmes dans les ruelles. Légendaire (et très illégal).'; C.xp(u, 50); } else { txt = 'Course-poursuite de 2 minutes. Ils t\'attrapent. Fourrière et grosse amende.'; amt = -Math.round(Math.max(1000, u.d.cash * .08)); } } }
  if (amt) C.money(u, amt); C.checkAch(u); return { txt, amt }; };
setInterval(() => { const now = Date.now(); C.users.forEach(u => { if (!u.sockets.size) return; if (!u.s.nextEv2) { u.s.nextEv2 = now + rnd(120000, 240000); return; } if (now < u.s.nextEv2) return; u.s.nextEv2 = now + rnd(180000, 360000);
  const opts = shuffle(['rain', 'rain', 'ex', 'influ', 'police', 'chal', 'chal']); for (const k of opts) { if (EV2[k](u) !== false) break; } });
  C.users.forEach(u => { const c = u.d.challenge; if (c && !c.done && now > c.until) { c.done = true; const f = Math.min(u.d.cash, c.amt); if (f) C.money(u, -f); C.notify(u, { ic: '⏰', from: 'Défi raté', body: 'Temps écoulé : −' + C.eur(f), keep: 1 }); } }); }, 10000);
