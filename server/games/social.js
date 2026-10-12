// Social et vie du joueur : chat, classement, profils, banque, prêts entre joueurs, petits boulots,
// missions, cadeaux du jour, événements surprises, faillite.
const C = require('../core');
const db = require('../db');
const { D, rnd, pick, shuffle, E } = C;

/* ---------- Chat ---------- */
const CHAT = [];
C.sysChat = text => { const m = { id: Date.now() + 'sys' + Math.random(), uid: 0, pseudo: 'Le Croupier', face: '📣', text, t: Date.now(), sys: 1 }; CHAT.push(m); if (CHAT.length > 60) CHAT.shift(); if (C.io) C.io.emit('chat', m); };
const BAD = ['connard', 'connasse', 'salope', 'enculé', 'encule', 'pute', 'nègre', 'negre', 'pd', 'fdp', 'ntm', 'bougnoule'];
function clean(t) { let s = String(t || '').replace(/\s+/g, ' ').trim().slice(0, 200); BAD.forEach(w => { s = s.replace(new RegExp('\\b' + w + '\\b', 'gi'), '***'); }); return s; }
C.api.say = (u, p) => { const now = Date.now(); if (now - (u.s.lastChat || 0) < 1500) throw E('Pas si vite !'); const text = clean(p.text); if (!text) throw E('Message vide.');
  u.s.lastChat = now; const m = { id: now + '' + u.id, uid: u.id, pseudo: u.pseudo, face: u.d.av.face, text, t: now }; CHAT.push(m); if (CHAT.length > 60) CHAT.shift();
  u.d.chats++; C.track(u, 'play', 'chat', 1); C.checkAch(u); C.io.emit('chat', m); return {}; };
C.hello.push(() => ({ chat: CHAT.slice(-40), jackpotUntil: C.events.jackpotUntil || 0 }));

/* ---------- Classement et profils ---------- */
let topCache = { t: 0, rows: [] };
C.api.top = async () => { if (Date.now() - topCache.t > 60000) { topCache = { t: Date.now(), rows: await db.top(50) }; }
  const map = new Map(topCache.rows.map(r => [r.id, { id: r.id, pseudo: r.pseudo, worth: Math.round(r.worth || 0), face: (r.av && r.av.face) || '🙂' }]));
  C.users.forEach(u => map.set(u.id, { id: u.id, pseudo: u.pseudo, worth: C.worth(u), face: u.d.av.face, on: u.sockets.size > 0 }));
  return { rows: [...map.values()].sort((a, b) => b.worth - a.worth).slice(0, 50) }; };
C.api.profile = async (u, p) => { const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); const d = o.d;
  return { id: o.id, pseudo: o.pseudo, av: d.av, card: d.card, lvl: C.LV(o), worth: C.worth(o), tier: C.tierIdx(o), ach: d.ach, items: d.items, biz: d.biz, wall: d.room.wall, wins: d.wins, losses: d.losses, on: o.sockets.size > 0, suspect: d.suspectUntil > Date.now() }; };

/* ---------- Banque ---------- */
function bankMax(u) { const d = u.d; return Math.max(0, Math.max(2000, Math.round((d.cash + C.itemsValue(d) + d.pos.reduce((s, p) => s + C.posValue(p), 0)) * .5)) - d.debt); }
C.api.loan = (u, p) => { const a = [1000, 5000, 20000, 100000].includes(+p.amt) ? +p.amt : 0; if (!a || a > bankMax(u)) throw E('La banque refuse ce prêt.'); u.d.debt += Math.round(a * 1.1); C.money(u, a);
  setTimeout(() => C.notify(u, { ic: '🏦', from: 'Ta banque', body: 'Votre conseiller a bien noté votre nouveau prêt. Il prie pour vous.' }), 2500); return {}; };
C.api.repay = u => { const r = Math.min(u.d.debt, u.d.cash); if (r < 1) throw E('Rien à rembourser.'); u.d.debt -= r; C.money(u, -r); return {}; };
C.api.bankInfo = u => ({ max: bankMax(u) });

/* ---------- Prêts entre joueurs ---------- */
let lid = 1;
C.api.loanAsk = async (u, p) => { const to = await C.getUser(+p.to); if (!to || to.id === u.id) throw E('Joueur introuvable.'); const amt = C.int(p.amt), rate = Math.max(0, Math.min(100, Math.round(+p.rate || 0)));
  if (amt > 10000000) throw E('Montant trop élevé.'); to.d.loanReq = (to.d.loanReq || []).filter(r => Date.now() - r.t < 86400000).slice(-9);
  const req = { id: Date.now() + '-' + (lid++), from: u.id, fromP: u.pseudo, amt, rate, t: Date.now() }; to.d.loanReq.push(req); C.markDirty(to); C.push(to);
  C.notify(to, { ic: '🤝', from: u.pseudo, body: `Te demande un prêt de ${C.eur(amt)} à ${rate} %`, go: 'loans', keep: 1 }); return {}; };
C.api.loanAnswer = async (u, p) => { const r = (u.d.loanReq || []).find(x => x.id === p.id); if (!r) throw E('Demande introuvable.'); u.d.loanReq = u.d.loanReq.filter(x => x !== r);
  const b = await C.getUser(r.from); if (!b) throw E('Joueur introuvable.');
  if (!p.yes) { C.notify(b, { ic: '🤝', from: u.pseudo, body: 'Refuse de te prêter ' + C.eur(r.amt) + '.', keep: 1 }); return {}; }
  C.pay(u, r.amt); const owe = Math.round(r.amt * (1 + r.rate / 100)), id = r.id;
  u.d.lent.push({ id, to: b.id, pseudo: b.pseudo, owed: owe }); b.d.fdebts.push({ id, to: u.id, pseudo: u.pseudo, owed: owe }); C.money(b, r.amt); C.markDirty(b);
  C.notify(b, { ic: '🤝', from: u.pseudo, body: `T'a prêté ${C.eur(r.amt)}. Tu lui dois ${C.eur(owe)}.`, keep: 1 }); C.feed(`<b>${C.esc(b.pseudo)}</b> doit ${C.eur(owe)} à ${C.esc(u.pseudo)}`); C.checkAch(b); return {}; };
C.api.loanRepay = async (u, p) => { const d = u.d.fdebts.find(x => x.id === p.id); if (!d) throw E('Dette introuvable.'); C.pay(u, d.owed); u.d.fdebts = u.d.fdebts.filter(x => x !== d);
  await C.withUser(d.to, l => { l.d.lent = l.d.lent.filter(x => x.id !== d.id); C.money(l, d.owed); C.notify(l, { ic: '💸', from: u.pseudo, body: 'T\'a remboursé ' + C.eur(d.owed) + '.', keep: 1 }); });
  C.feed(`<b>${C.esc(u.pseudo)}</b> a remboursé ${C.esc(d.pseudo)}`); return {}; };
C.api.loanRemind = async (u, p) => { const l = u.d.lent.find(x => x.id === p.id); if (!l) throw E('Prêt introuvable.'); if (Date.now() - (l.reminded || 0) < 3600000) throw E('Tu l\'as déjà relancé il y a moins d\'une heure.'); l.reminded = Date.now();
  await C.withUser(l.to, b => C.notify(b, { ic: '😤', from: u.pseudo, body: 'Te réclame ses ' + C.eur(l.owed) + ' !', keep: 1 })); return {}; };

/* ---------- Petits boulots ---------- */
C.api.jobStart = (u, p) => { const j = D.JOBS.find(x => x.id === p.id); if (!j) throw E('Boulot inconnu.'); const cafe = u.d.cafeUntil > Date.now(); u.s.job = { j, t: Date.now(), dur: cafe ? 7 : 10, mult: cafe ? 3 : 1 }; return { dur: u.s.job.dur, mult: u.s.job.mult }; };
C.api.jobEnd = (u, p) => { const g = u.s.job; if (!g) throw E('Pas de boulot en cours.'); u.s.job = null; const el = (Date.now() - g.t) / 1000;
  const taps = Math.max(0, Math.min(Math.floor(+p.taps || 0), Math.floor(Math.min(el, g.dur + 2) * 12))); const pay = Math.round(taps * g.j.pay * g.mult * (D.petOn(u.d, 'dog') ? 1.5 : 1));
  u.d.bestJob = Math.max(u.d.bestJob, taps); if (pay) C.money(u, pay); C.result(u, 'job', 0, pay); return { pay, taps }; };

/* ---------- Missions et cadeaux du jour ---------- */
C.api.missions = u => ({ list: C.todayMissions(u) });
C.api.mclaim = (u, p) => { const m = C.todayMissions(u).find(x => x.id === p.id), M = D.MISSIONS.find(x => x.id === p.id); if (!m || !M || m.c || m.p < M.n) throw E('Mission pas encore terminée.'); m.c = true; C.money(u, M.rw); C.xp(u, 50); return {}; };
const WSEG = [['100 €', 100], ['1 000 €', 1000], ['Rien', 0], ['500 €', 500], ['XP ×2', -1], ['2 500 €', 2500], ['Boost 🦈', -2], ['10 000 €', 10000]];
C.api.chest = u => { const d = C.dkeyParis(); if (u.d.daily.chest === d) throw E('Reviens demain !'); u.d.daily.chest = d; const y = new Date(d + 'T12:00:00Z'); y.setUTCDate(y.getUTCDate() - 1); const yk = y.toISOString().slice(0, 10); u.d.streak.n = u.d.streak.last === yk ? u.d.streak.n + 1 : 1; u.d.streak.last = d; const sm = 1 + Math.min(u.d.streak.n - 1, 6) * .25;
  const amt = Math.round((200 + Math.random() * 800) * (1 + C.LV(u) * .25) * sm / 10) * 10; C.checkAch(u); C.money(u, amt); C.xp(u, 20); return { amt }; };
C.api.wheel = u => { const d = C.dkeyParis(); if (u.d.daily.wheel === d) throw E('Reviens demain !'); u.d.daily.wheel = d; const i = Math.random() * 8 | 0, s = WSEG[i];
  setTimeout(() => { if (s[1] > 0) C.money(u, s[1]); else if (s[1] === -1) u.d.xpBoostUntil = Math.max(Date.now(), u.d.xpBoostUntil) + 15 * 60000; else if (s[1] === -2) u.d.boosts.requin += 3; C.markDirty(u); C.push(u); }, 4300);
  return { i }; };

/* ---------- Faillite ---------- */
C.api.shame = u => { if (!u.d.broke) throw E('Tu n\'es pas en faillite.'); u.d.broke = false; C.money(u, 500); return {}; };
C.api.reset = u => { const keep = { av: u.d.av }; u.d = Object.assign(C.freshData(), { av: { face: '🙂', acc: '' } }); C.markDirty(u); return {}; };

/* ---------- Événements surprises ---------- */
const EVN = C.events; EVN.jackpotUntil = 0;
const SMS = ['Votre conseiller s\'inquiète pour vous. Rappelez-le.', 'Votre découvert a été remarqué par toute l\'agence.', 'Nous avons bloqué votre carte « par précaution ».', 'Petit rappel : le casino n\'est pas un placement.', 'Félicitations pour votre nouvelle carte ! (On n\'y croyait pas.)', 'Votre conseiller a ri en voyant vos relevés.'];
const DARON_OK = [['« J\'ai vu ton relevé. On en parlera ce week-end. » Il raccroche sans dire au revoir.', 0], ['« Bon. Je te fais un virement, mais c\'est la dernière fois. »', 300], ['« Tu sais ce que ça coûte, un plein d\'essence ? » 12 minutes de leçon sur la valeur de l\'argent.', 0], ['« Viens bosser avec moi samedi, je te paie. »', 150]];
const DARON_KO = [['Il rappelle 4 fois. Puis il appelle ta mère. Ambiance.', 0], ['Il coupe ton forfait téléphone « jusqu\'à nouvel ordre ». −5 % de ton cash.', -.05], ['Rien ne se passe. Pour l\'instant…', 0]];
function send(u, ev) { u.sockets.forEach(s => s.emit('event', ev)); }
EVN.maybeDaron = u => { if (Date.now() - u.d.lastDaron < 240000 || !u.sockets.size) return; u.d.lastDaron = Date.now(); u.s.daron = true; setTimeout(() => send(u, { type: 'daron' }), 2500); };
C.api.daron = (u, p) => { if (!u.s.daron) throw E('Pas d\'appel en cours.'); u.s.daron = false; let txt, amt;
  if (p.up) { [txt, amt] = pick(DARON_OK); } else { u.d.hungUp++; let a; [txt, a] = pick(DARON_KO); amt = a < 0 ? Math.round(u.d.cash * a) : a; C.checkAch(u); }
  if (amt) C.money(u, amt); return { txt, amt }; };
function huissier(u) { const its = u.d.items.slice(0, 9); u.s.hu = { its, t: Date.now() };
  if (!its.length) { const f = Math.round(u.d.cash * .1); C.money(u, -f); u.s.hu = null; return send(u, { type: 'huissier', none: 1, fine: f }); } send(u, { type: 'huissier', its }); }
C.api.huDone = (u, p) => { const h = u.s.hu; if (!h) throw E('Pas d\'huissier.'); u.s.hu = null; const el = (Date.now() - h.t) / 1000; const maxHide = Math.floor(Math.min(el, 12) * 1.5);
  const hidden = new Set((Array.isArray(p.hidden) ? p.hidden : []).map(Number).filter(i => i >= 0 && i < h.its.length).slice(0, maxHide));
  const vis = h.its.map((id, i) => i).filter(i => !hidden.has(i)); if (!vis.length) return { saved: 1 };
  const id = h.its[pick(vis)], k = u.d.items.indexOf(id); if (k < 0) return { saved: 1 }; u.d.items.splice(k, 1); u.d.seized++; const it = D.itemInfo(id);
  const off = Math.min(u.d.debt, Math.round(it.pr * .5)); u.d.debt -= off; C.feed(`<b>${C.esc(u.pseudo)}</b> s'est fait saisir : ${it.nm}`); C.checkAch(u); return { id, off }; };
function fisc(u) { const qs = shuffle(D.FISC.map((q, i) => i)).slice(0, 3); u.s.fisc = { qs, i: 0, ok: 0 }; send(u, { type: 'fisc', qs: qs.map(i => ({ q: D.FISC[i][0], a: D.FISC[i][1] })) }); }
C.api.fiscA = (u, p) => { const f = u.s.fisc; if (!f) throw E('Pas de contrôle en cours.'); const q = D.FISC[f.qs[f.i]]; const good = +p.a === q[2]; let fine = 0;
  if (good) f.ok++; else { fine = Math.round(u.d.cash * .03); C.money(u, -fine); } f.i++; let bonus = 0;
  if (f.i >= 3) { u.s.fisc = null; if (f.ok === 3) { bonus = Math.round(Math.max(200, u.d.cash * .02)); C.money(u, bonus); } } return { good, fine, done: f.i >= 3, ok: f.ok, bonus, right: q[2] }; };
setInterval(() => {
  const now = Date.now();
  C.users.forEach(u => { if (!u.sockets.size) return; if (!u.s.nextEv) { u.s.nextEv = now + rnd(90000, 180000); return; } if (now < u.s.nextEv) return; u.s.nextEv = now + rnd(150000, 300000);
    const opts = [['sms', 3], ['fisc', 2], ['gift', 2]]; if (C.owed(u.d) > 0 || u.d.items.length) opts.push(['hu', C.owed(u.d) > 0 ? 3 : 1]);
    let r = Math.random() * opts.reduce((a, o) => a + o[1], 0), k = 'sms'; for (const [n, w] of opts) { if ((r -= w) < 0) { k = n; break; } }
    if (k === 'sms') C.notify(u, { ic: '🏦', from: 'Ta banque', body: pick(SMS) });
    else if (k === 'gift') { const a = Math.round(rnd(50, 400) / 10) * 10; C.money(u, a); C.notify(u, { ic: '🎁', from: 'Le casino', body: 'Cadeau surprise : +' + C.eur(a) }); }
    else if (k === 'fisc') fisc(u); else huissier(u); });
  if (!EVN.nextGlobal) EVN.nextGlobal = now + rnd(600000, 1200000);
  if (now > EVN.nextGlobal && C.users.size) { EVN.nextGlobal = now + rnd(900000, 1800000);
    if (Math.random() < .5) { EVN.jackpotUntil = now + 600000; C.io.emit('global', { type: 'jackpot', until: EVN.jackpotUntil }); }
    else { const k = rnd(.1, .25); C.krach(k); C.io.emit('global', { type: 'krach', pct: Math.round(k * 100) }); } }
}, 10000);
