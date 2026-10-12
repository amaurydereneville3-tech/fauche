// V6 : compte (pseudo, mot de passe, bio, suppression), avatar dessiné, fiche profil, signalement de bugs,
// statistiques et panneau admin réservé au compte du créateur (Momo).
const bcrypt = require('bcryptjs');
const C = require('../core');
const db = require('../db');
const { D, E } = C;

const PSEUDO = /^[A-Za-z0-9_\-]{3,16}$/;
const ADMIN_PSEUDO = (process.env.ADMIN_PSEUDO || 'monorime').toLowerCase();
(async () => {
  try {
    if (process.env.ADMIN_ID) C.adminId = +process.env.ADMIN_ID;
    else { C.adminId = await db.kvGet('admin_id'); if (C.adminId == null) { const r = await db.findByPseudo(ADMIN_PSEUDO); if (r) { C.adminId = r.id; await db.kvSet('admin_id', r.id); } } }
  } catch (e) { console.error('admin', e.message); }
})();
C.onRegister = async (id, pseudo) => { if (C.adminId == null && pseudo.toLowerCase() === ADMIN_PSEUDO) { C.adminId = id; await db.kvSet('admin_id', id); } };
const ADM = u => { if (!C.isAdmin(u)) throw E('Réservé au créateur du jeu.'); };

/* ---------- Statistiques du jour (pour l'admin) ---------- */
let ST = { date: '', players: [], games: {}, n: 0 };
db.kvGet('stats').then(v => { if (v) ST = v; }).catch(() => {});
C.stat = (u, game) => { const d = C.dkeyParis(); if (ST.date !== d) ST = { date: d, players: [], games: {}, n: 0 }; if (!ST.players.includes(u.id)) ST.players.push(u.id); ST.games[game] = (ST.games[game] || 0) + 1; ST.n++; };
setInterval(() => db.kvSet('stats', ST).catch(() => {}), 120000);

/* ---------- Compte ---------- */
C.api.setPseudo = async (u, p) => { const ps = String(p.pseudo || '').trim(); if (!PSEUDO.test(ps)) throw E('Pseudo : 3 à 16 caractères (lettres, chiffres, _ ou -).');
  if (ps === u.pseudo) throw E('C\'est déjà ton pseudo.');
  const wait = u.d.pseudoAt + 30 * 864e5 - Date.now(); if (wait > 0 && !C.isAdmin(u)) throw E('Tu pourras changer de pseudo dans ' + Math.ceil(wait / 864e5) + ' jour(s).');
  const ex = await db.findByPseudo(ps.toLowerCase()); if (ex && ex.id !== u.id) throw E('Ce pseudo est déjà pris.');
  const old = u.pseudo; await db.rename(u.id, ps); u.pseudo = ps; u.d.pseudoAt = Date.now(); u.d.oldPseudo = old;
  C.feed(`<b>${C.esc(old)}</b> s'appelle maintenant <b>${C.esc(ps)}</b>`); C.online && C.io.emit('online', C.online()); return { pseudo: ps }; };
C.api.setPass = async (u, p) => { const h = await db.getPass(u.id); if (!h || !(await bcrypt.compare(String(p.old || ''), h))) throw E('Ancien mot de passe incorrect.');
  const n = String(p.pass || ''); if (n.length < 6 || n.length > 100) throw E('Nouveau mot de passe : 6 caractères minimum.'); await db.setPass(u.id, await bcrypt.hash(n, 10)); return {}; };
C.api.setBio = (u, p) => { u.d.bio = C.clean ? C.clean(String(p.bio || '').slice(0, 90)) : String(p.bio || '').slice(0, 90); return {}; };
C.api.deleteMe = async (u, p) => { if (C.isAdmin(u)) throw E('Le compte du créateur ne peut pas être supprimé.');
  const h = await db.getPass(u.id); if (!h || !(await bcrypt.compare(String(p.pass || ''), h))) throw E('Mot de passe incorrect.');
  await db.deleteUser(u.id); u.dirty = false; C.users.delete(u.id); setTimeout(() => u.sockets.forEach(s => { s.emit('logout'); s.disconnect(); }), 300); return {}; };

/* ---------- Avatar ---------- */
C.api.avatar = (u, p) => { const ctx = { lvl: C.LV(u), tier: C.tierIdx(u), items: u.d.items, ach: u.d.ach }; const v = D.avClean(p.av, u.d.av.v2);
  for (const k of Object.keys(D.AVP)) { const lock = D.avLock(k, v[k], ctx); if (lock && v[k] !== (u.d.av.v2 || {})[k]) throw E(D.AVPN[k] + ' verrouillé : ' + lock); }
  u.d.av.v2 = v; return {}; };

/* ---------- Fiche profil (V6) ---------- */
C.api.profile = async (u, p) => { const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); const d = o.d;
  const fav = Object.entries(d.gp || {}).filter(([g]) => g !== 'job' && g !== 'chat').sort((a, b) => b[1] - a[1])[0];
  const show = d.items.map(id => ({ id, it: D.itemInfo(id) })).filter(x => x.it).sort((a, b) => b.it.pr - a.it.pr).slice(0, 8).map(x => x.id);
  return { id: o.id, pseudo: o.pseudo, av: d.av, bio: d.bio || '', title: d.titleSel || D.title(C.LV(o)), card: d.card, lvl: C.LV(o), worth: C.worth(o), tier: C.tierIdx(o), creator: C.isAdmin(o),
    ach: d.ach, items: show, nItems: d.items.length, biz: d.biz, pet: d.pet && d.pet.id, wall: d.room.wall, wins: d.wins, losses: d.losses, played: d.played, best: d.best, bankrupt: d.bankrupt,
    fav: fav ? fav[0] : null, favN: fav ? fav[1] : 0, heistOk: d.heistOk, jail: d.jail, tourWins: d.tourWins, street: d.street, streak: d.streak.n, bounty: (d.bounty || 0),
    on: o.sockets.size > 0, suspect: d.suspectUntil > Date.now(), oldPseudo: d.oldPseudo || '' }; };

/* ---------- Bugs ---------- */
C.api.bug = async (u, p) => { const t = String(p.text || '').trim().slice(0, 600); if (t.length < 5) throw E('Décris le problème en quelques mots.');
  if (Date.now() - (u.s.lastBug || 0) < 60000) throw E('Attends une minute avant d\'envoyer un autre signalement.'); u.s.lastBug = Date.now();
  const list = (await db.kvGet('bugs')) || []; list.unshift({ t: Date.now(), id: u.id, pseudo: u.pseudo, text: t, ua: String(p.ua || '').slice(0, 120) }); await db.kvSet('bugs', list.slice(0, 150));
  const a = C.adminId != null && C.users.get(C.adminId); if (a) C.notify(a, { ic: '🐞', from: 'Bug signalé', body: u.pseudo + ' : ' + t.slice(0, 80), go: 'admin' }); return {}; };

/* ---------- Bannissement ---------- */
C.isBanned = u => (u.d.bannedUntil || 0) > Date.now();

/* ---------- Admin ---------- */
C.api.admStats = async u => { ADM(u); const online = []; C.users.forEach(x => { if (x.sockets.size) online.push({ id: x.id, pseudo: x.pseudo, cash: Math.round(x.d.cash), worth: C.worth(x), lvl: C.LV(x), av: x.d.av.v2 }); });
  const d = C.dkeyParis(); const st = ST.date === d ? ST : { players: [], games: {}, n: 0 };
  return { users: await db.count(), online: online.sort((a, b) => b.worth - a.worth), today: st.players.length, parties: st.n, games: Object.entries(st.games).sort((a, b) => b[1] - a[1]).slice(0, 10),
    happyUntil: C.events.happyUntil || 0, jackpot: C.jackpot || 0, bugs: ((await db.kvGet('bugs')) || []).length }; };
C.api.admFind = async (u, p) => { ADM(u); const rows = await db.search(p.q || '', 25); return { rows: rows.map(r => { const m = C.users.get(r.id); return { id: r.id, pseudo: r.pseudo, worth: m ? C.worth(m) : Math.round(r.worth || 0), on: !!(m && m.sockets.size) }; }) }; };
C.api.admUser = async (u, p) => { ADM(u); const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); const d = o.d;
  return { id: o.id, pseudo: o.pseudo, cash: Math.round(d.cash), worth: C.worth(o), debt: d.debt, lvl: C.LV(o), xp: d.xp, played: d.played, items: d.items.length, banned: Math.max(0, (d.bannedUntil || 0) - Date.now()), av: d.av.v2, on: o.sockets.size > 0 }; };
C.api.admGive = async (u, p) => { ADM(u); const amt = Math.round(+p.amt || 0); if (!amt || Math.abs(amt) > 1e12) throw E('Montant invalide.');
  const ok = await C.withUser(+p.id, o => { C.money(o, amt); C.notify(o, { ic: '👑', from: 'Momo, créateur du jeu', body: (amt > 0 ? 'Te fait un cadeau : +' : 'Te retire ') + C.eur(Math.abs(amt)) + (p.msg ? ' · « ' + String(p.msg).slice(0, 80) + ' »' : ''), big: amt > 0 ? 1 : 0, keep: 1 }); return true; });
  if (!ok) throw E('Joueur introuvable.'); return {}; };
C.api.admRain = (u, p) => { ADM(u); const amt = Math.round(+p.amt || 0); if (amt < 1 || amt > 1e9) throw E('Montant invalide.'); let n = 0;
  C.users.forEach(o => { if (!o.sockets.size) return; n++; C.money(o, amt); C.notify(o, { ic: '💸', from: 'Pluie d\'argent de Momo', body: '+' + C.eur(amt) + ' pour tout le monde !', big: 1 }); });
  C.sysChat && C.sysChat(`💸 Momo fait pleuvoir ${C.eur(amt)} sur les ${n} joueurs en ligne !`); return { n }; };
C.api.admEvent = (u, p) => { ADM(u); const k = p.type;
  if (k === 'happy') { C.startHappy ? C.startHappy(30) : null; return {}; }
  if (k === 'jackpot') { C.events.jackpotUntil = Date.now() + 600000; C.io.emit('global', { type: 'jackpot', until: C.events.jackpotUntil }); return {}; }
  if (k === 'rainall') { C.users.forEach(o => { if (o.sockets.size) o.sockets.forEach(s => s.emit('event', { type: 'rain' })); o.s.rain = { t: Date.now() }; }); return {}; }
  if (k === 'drop') { C.drop && C.drop(+p.amt || 5000); return {}; }
  if (k === 'boostjk') { C.jackpot = (C.jackpot || 0) + Math.max(0, Math.round(+p.amt || 50000)); C.io.emit('jackpot', C.jackpot); return {}; }
  throw E('Événement inconnu.'); };
C.api.admMsg = (u, p) => { ADM(u); const t = String(p.text || '').trim().slice(0, 200); if (!t) throw E('Message vide.');
  C.io.emit('global', { type: 'msg', text: t, from: u.pseudo }); C.sysChat && C.sysChat('📢 ' + t, { pseudo: u.pseudo + ' (créateur)', cr: 1, av: u.d.av.v2, sys: 0, uid: u.id }); return {}; };
C.api.admRename = async (u, p) => { ADM(u); const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); const ps = String(p.pseudo || '').trim();
  if (!PSEUDO.test(ps)) throw E('Pseudo invalide.'); const ex = await db.findByPseudo(ps.toLowerCase()); if (ex && ex.id !== o.id) throw E('Pseudo déjà pris.');
  o.d.oldPseudo = o.pseudo; await db.rename(o.id, ps); o.pseudo = ps; C.markDirty(o); C.push(o); return {}; };
C.api.admReset = async (u, p) => { ADM(u); const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); if (o.id === u.id && !p.me) throw E('Confirme pour ton propre compte.');
  const av = o.d.av; o.d = Object.assign(C.freshData(), { av }); C.markDirty(o); C.push(o); C.notify(o, { ic: '♻️', from: 'Momo, créateur du jeu', body: 'Ton compte a été remis à zéro.', keep: 1 }); return {}; };
C.api.admBan = async (u, p) => { ADM(u); const o = await C.getUser(+p.id); if (!o) throw E('Joueur introuvable.'); if (o.id === u.id) throw E('Tu ne peux pas te bannir toi-même.');
  const min = Math.max(0, Math.min(60 * 24 * 365, Math.round(+p.min || 0))); o.d.bannedUntil = min ? Date.now() + min * 60000 : 0; C.markDirty(o);
  if (min) o.sockets.forEach(s => { s.emit('banned', { until: o.d.bannedUntil }); s.disconnect(); }); return {}; };
C.api.admBugs = async u => { ADM(u); return { list: (await db.kvGet('bugs')) || [] }; };
C.api.admBugDel = async (u, p) => { ADM(u); const list = (await db.kvGet('bugs')) || []; list.splice(+p.i, 1); await db.kvSet('bugs', list); return {}; };
C.api.admLevel = async (u, p) => { ADM(u); const ok = await C.withUser(+p.id, o => { o.d.xp = Math.max(0, Math.round(+p.xp || 0)); return true; }); if (!ok) throw E('Joueur introuvable.'); return {}; };
