// V6 social : happy hour, drops dans le chat, classement de la semaine, le Croupier qui clashe, pickpocket, primes,
// sabotage d'entreprise, coup de rush, histoires suivies (Daron, Kevin, Gérard l'huissier, l'ex), braquages 2.0,
// prison et braquages entre potes.
const C = require('../core');
const db = require('../db');
const { D, rnd, pick, shuffle, E } = C;
const io = () => C.io;
const now = () => Date.now();
const send = (u, ev) => u.sockets.forEach(s => s.emit('event', ev));
const pushAll = () => C.users.forEach(u => { if (u.sockets.size) C.push(u); });

/* ---------- Happy hour ---------- */
C.startHappy = min => { C.events.happyUntil = now() + min * 60000; io() && io().emit('global', { type: 'happy', until: C.events.happyUntil }); C.sysChat && C.sysChat(`🍾 HAPPY HOUR ! Tous les gains sont doublés pendant ${min} minutes. Foncez !`); pushAll(); };
let lastHappy = '';
setInterval(() => { const p = C.parisNow(); if (p.h === 21 && p.m < 2 && lastHappy !== p.date) { lastHappy = p.date; C.startHappy(30); } }, 30000);

/* ---------- Drops dans le chat ---------- */
const DROPS = new Map(); let dropId = 1;
C.drop = amt => { const id = 'd' + (dropId++); const a = Math.max(100, Math.round(amt / 10) * 10); DROPS.set(id, { a, t: now() }); io() && io().emit('drop', { id, amt: a });
  C.sysChat && C.sysChat(`🎁 DROP ! ${C.eur(a)} pour le premier qui clique sur le cadeau.`, { drop: id, amt: a }); setTimeout(() => DROPS.delete(id), 120000); };
C.api.dropClaim = (u, p) => { const d = DROPS.get(p.id); if (!d) throw E('Trop tard ! Quelqu\'un a été plus rapide.'); DROPS.delete(p.id); C.money(u, d.a);
  io() && io().emit('dropGone', { id: p.id, by: u.pseudo }); C.sysChat && C.sysChat(`🎁 ${u.pseudo} a attrapé le drop de ${C.eur(d.a)}. Trop rapide.`); return { amt: d.a }; };
let nextDrop = now() + rnd(15, 30) * 60000;
setInterval(() => { if (now() < nextDrop) return; nextDrop = now() + rnd(25, 45) * 60000; let n = 0; C.users.forEach(u => { if (u.sockets.size) n++; }); if (n) C.drop(rnd(1500, 8000) * (n > 3 ? 1.5 : 1)); }, 30000);

/* ---------- Classement de la semaine (bénéfices de la semaine) ---------- */
let WK = { k: '', rows: {} }, wkDirty = false;
const PRIZES = [250000, 100000, 50000];
async function wkLoad() { const k = C.weekKey(); if (WK.k !== k) { if (WK.k && wkDirty) { wkDirty = false; await db.kvSet('wk:' + WK.k, WK.rows); } const last = WK.k || (await db.kvGet('wklast'));
    if (last && last !== k) await wkAward(last); WK = { k, rows: (await db.kvGet('wk:' + k)) || {} }; await db.kvSet('wklast', k); } return WK; }
setTimeout(() => wkLoad().catch(e => console.error('wk', e.message)), 3000);
setInterval(() => { if (wkDirty) { wkDirty = false; db.kvSet('wk:' + WK.k, WK.rows).catch(() => {}); } }, 30000);
async function wkAward(key) { if (await db.kvGet('wkdone:' + key)) return; await db.kvSet('wkdone:' + key, 1); const rows = (WK.k === key ? WK.rows : await db.kvGet('wk:' + key)) || {};
  const top = Object.entries(rows).sort((a, b) => b[1].net - a[1].net).filter(r => r[1].net > 0).slice(0, 3);
  for (let i = 0; i < top.length; i++) { const id = +top[i][0]; await C.withUser(id, u => { C.money(u, PRIZES[i]); if (i === 0) { u.d.unlocks.push('t:Roi de la semaine'); u.d.weekWins = (u.d.weekWins || 0) + 1; C.checkAch(u); }
      C.notify(u, { ic: ['👑', '🥈', '🥉'][i], from: 'Classement de la semaine', body: `Tu finis ${i + 1}${i ? 'e' : 'er'} de la semaine ! +${C.eur(PRIZES[i])}${i === 0 ? ' et le titre « Roi de la semaine »' : ''}`, big: 1, keep: 1 }); }); }
  if (top.length && C.sysChat) C.sysChat(`👑 Fin de semaine ! ${top.map((r, i) => (i + 1) + '. ' + r[1].p).join(' · ')}. Les compteurs repartent à zéro.`); }
setInterval(() => wkLoad().catch(e => console.error('wk', e.message)), 60000);
C.api.weekTop = async () => { await wkLoad(); return { week: WK.k, rows: Object.entries(WK.rows).map(([id, r]) => ({ id: +id, pseudo: r.p, av: r.av, net: r.net, cr: +id === C.adminId ? 1 : 0 })).sort((a, b) => b.net - a.net).slice(0, 30), prizes: PRIZES }; };

/* ---------- Le Croupier qui clashe ---------- */
const ROASTS = ['{p} vient de perdre {a} {g}. On fait une cagnotte ou on rigole ?', 'Minute de silence pour le compte en banque de {p} ({a} envolés {g}).', '{p} a perdu {a} {g}. Même la machine a eu de la peine.',
  'Breaking news : {p} confond « investir » et « tout perdre ». −{a} {g}.', '{p} : −{a} {g}. Le Daron est au courant ? Il va l\'être.', 'Applaudissez {p} qui vient d\'offrir {a} au casino. Merci pour le nouveau lustre.',
  '{p} a perdu {a} {g}. Je dis ça, je dis rien, mais le vendeur de roses gagne mieux sa vie.', '{p} vient de faire un don de {a} au casino. Reçu fiscal non disponible.'];
const _res = C.result;
C.result = (u, game, stake, payout, extra = {}) => { _res(u, game, stake, payout, extra); const net = Math.round(payout - stake);
  if (game !== 'job' && net) { const k = C.weekKey(); if (WK.k === k) { const r = WK.rows[u.id] || (WK.rows[u.id] = { p: u.pseudo, av: u.d.av.v2, net: 0 }); r.net += net; r.p = u.pseudo; r.av = u.d.av.v2; wkDirty = true; } }
  if (net < 0 && -net >= Math.max(20000, (u.d.cash - net) * .5) && now() - (u.s.roast || 0) > 600000 && C.sysChat) { u.s.roast = now(); C.sysChat('😂 ' + pick(ROASTS).replace('{p}', u.pseudo).replace('{a}', C.eur(-net)).replace('{g}', D.GN[game] || '')); } };

/* ---------- Pickpocket et primes ---------- */
C.api.pickpocket = async (u, p) => { if (now() - (u.d.ppAt || 0) < 600000) throw E('Tu dois te faire oublier encore ' + Math.ceil((u.d.ppAt + 600000 - now()) / 60000) + ' min.'); const t = await C.getUser(+p.id);
  if (!t || t.id === u.id) throw E('Joueur introuvable.'); if (!t.sockets.size) throw E('Il faut que ta cible soit en ligne.'); if (now() - (t.d.ppHit || 0) < 300000) throw E('Ta cible serre son portefeuille très fort. Réessaie plus tard.');
  if (t.d.cash < 200) throw E('Ses poches sont vides. Triste.'); u.d.ppAt = now(); const guard = t.d.items.includes('garde'), ok = Math.random() < (guard ? .15 : .45);
  const amt = Math.round(Math.min(t.d.cash * .05, 50000 + C.LV(u) * 2000));
  if (ok) { t.d.ppHit = now(); u.d.picks = (u.d.picks || 0) + 1; C.checkAch(u); C.money(t, -amt); C.money(u, amt); let bounty = 0; if (t.d.bounty) { bounty = t.d.bounty; t.d.bounty = 0; C.money(u, bounty); C.sysChat && C.sysChat(`🎯 ${u.pseudo} touche la prime de ${C.eur(bounty)} sur la tête de ${t.pseudo} !`); }
    const seen = Math.random() < .5; C.notify(t, { ic: '🫳', from: 'Pickpocket', body: (seen ? u.pseudo : 'Quelqu\'un') + ' vient de te faire les poches : −' + C.eur(amt), keep: 1 }); C.markDirty(t); return { ok: 1, amt, bounty }; }
  const fine = Math.min(u.d.cash, amt); C.money(u, -fine); C.money(t, fine); C.notify(t, { ic: '🫳', from: 'Pickpocket raté', body: u.pseudo + ' a essayé de te faire les poches. Il te verse ' + C.eur(fine) + ' d\'amende.' + (guard ? ' Merci ton garde du corps.' : ''), keep: 1 });
  C.sysChat && C.sysChat(`🫳 ${u.pseudo} s'est fait choper la main dans la poche de ${t.pseudo}. Amende : ${C.eur(fine)}.`); return { ok: 0, fine, guard }; };
C.api.bounty = async (u, p) => { const t = await C.getUser(+p.id); if (!t || t.id === u.id) throw E('Joueur introuvable.'); const amt = C.int(p.amt); if (amt < 1000) throw E('Prime minimum : 1 000 €.'); C.pay(u, amt);
  t.d.bounty = (t.d.bounty || 0) + amt; C.markDirty(t); C.notify(t, { ic: '🎯', from: 'Prime', body: u.pseudo + ' a mis ' + C.eur(amt) + ' sur ta tête. Méfie-toi des duels et des pickpockets.', keep: 1 });
  C.sysChat && C.sysChat(`🎯 ${u.pseudo} met une prime de ${C.eur(amt)} sur la tête de ${t.pseudo} (total ${C.eur(t.d.bounty)}). Battez-le en duel ou faites-lui les poches !`); return { total: t.d.bounty }; };
C.onDuel = (w, l) => { if (l.d.bounty) { const b = l.d.bounty; l.d.bounty = 0; C.money(w, b); C.markDirty(l); C.sysChat && C.sysChat(`🎯 ${w.pseudo} bat ${l.pseudo} en duel et empoche la prime de ${C.eur(b)} !`); } };

/* ---------- Sabotage et coup de rush ---------- */
C.api.sabotage = async (u, p) => { if (now() - (u.d.sabAt || 0) < 1800000) throw E('Attends encore ' + Math.ceil((u.d.sabAt + 1800000 - now()) / 60000) + ' min avant ton prochain sabotage.'); const t = await C.getUser(+p.id);
  if (!t || t.id === u.id) throw E('Joueur introuvable.'); if (!t.d.biz.length) throw E('Il n\'a aucune entreprise à saboter.'); if ((t.d.sabotUntil || 0) > now()) throw E('Ses entreprises sont déjà en galère.');
  const cost = Math.max(5000, Math.round(C.incomePerHour(t.d) * 2)); C.pay(u, cost); u.d.sabAt = now(); const pe = C.pending(t.d); if (pe > 0) C.money(t, pe); t.d.lastCollect = now(); t.d.sabotUntil = now() + 2 * 3600000; C.markDirty(t);
  const kind = pick(['des rats dans la cuisine', 'une fausse alerte à la bombe', '200 faux avis une étoile', 'une coupure de courant « accidentelle »']), caught = Math.random() < .35;
  C.notify(t, { ic: '🐀', from: 'Sabotage !', body: `Tes entreprises tournent à moitié pendant 2 h : ${kind}.${caught ? ' Le coupable : ' + u.pseudo + ' !' : ' Coupable inconnu…'}`, keep: 1 });
  if (caught && C.sysChat) C.sysChat(`🐀 ${u.pseudo} s'est fait griller en train de saboter les entreprises de ${t.pseudo} (${kind}).`); return { cost, caught, kind }; };
C.api.rushStart = u => { if (!u.d.biz.length) throw E('Il te faut une entreprise.'); if (now() - (u.d.rushAt || 0) < 3600000) throw E('Prochain coup de rush dans ' + Math.ceil((u.d.rushAt + 3600000 - now()) / 60000) + ' min.'); u.d.rushAt = now(); u.s.rush = now(); return { dur: 12 }; };
C.api.rushEnd = (u, p) => { const t0 = u.s.rush; if (!t0) throw E('Pas de rush en cours.'); u.s.rush = null; const el = Math.min(14, (now() - t0) / 1000); const n = Math.max(0, Math.min(Math.floor(+p.n || 0), Math.floor(el * 4))); const pay = Math.round(C.incomePerHour(u.d) * Math.min(1.2, n / 40));
  if (pay) C.money(u, pay); return { pay, n }; };

/* ---------- Histoires suivies ---------- */
const st = u => u.d.story || (u.d.story = { daron: 0, kevin: 0, gerard: 0, cd: {} });
const CARS = ['ecurie', 'sp_car', '911', 'clio', 'scoot', 'trot'];
const carOf = u => CARS.find(id => u.d.items.includes(id));
const pct = (u, k) => Math.round(u.d.cash * k);
const R = (txt, amt = 0, extra = {}) => ({ txt, amt, ...extra });
const STORIES = {
  d1: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 0 && (u.d.hungUp >= 1 || u.d.debt > 0 || u.d.bankrupt > 0 || u.d.played > 40), title: 'Le Daron a vu ton relevé',
    text: () => '« J\'ai reçu un courrier de ta banque. Il y avait le mot DÉCOUVERT écrit en rouge. Tu m\'expliques ? »',
    ch_: [['C\'est un investissement, papa', u => Math.random() < .5 ? R('Il rigole pendant trois minutes. Puis il raccroche sans dire au revoir.') : R('« Un investissement ? Au CASINO ? » Il te coupe ton forfait téléphone.', -pct(u, .03))],
      ['Promettre d\'arrêter', u => { st(u).daron = 1; C.xp(u, 30); return R('« Je te fais confiance. » (Il ne te fait pas du tout confiance.)'); }],
      ['Raccrocher', u => { st(u).daron = 2; u.d.hungUp++; return R('Il rappelle 7 fois. Puis il prévient ta mère, ta tante et le voisin du dessous.'); }]] },
  d2: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 1, title: 'Le Daron vérifie', text: () => '« Tu m\'avais promis d\'arrêter. Pourquoi ton nom est dans le classement du casino ? »',
    ch_: [['« C\'est un homonyme »', u => { if (Math.random() < .4) return R('Il te croit. Incroyable. Profite.'); st(u).daron = 2; return R('« Un homonyme avec ta tête en photo de profil ? » Il raccroche, vexé.'); }],
      ['Lui proposer une partie de Crash', u => { st(u).daron = 3; return R('Il mise 20 €, encaisse à ×1,01 et se prend pour Warren Buffett. Il te fait un virement pour fêter ça.', 500); }]] },
  d3: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 2 && !!carOf(u), title: 'Le Daron débarque chez toi',
    text: u => `Il est devant ta porte avec un double de tes clés. « Je viens chercher la ${D.itemInfo(carOf(u)).nm}. Pour ton bien. »`,
    ch_: [['Le laisser entrer', u => { const c = carOf(u), it = D.itemInfo(c); u.d.items.splice(u.d.items.indexOf(c), 1); st(u).daron = 3; return R(`Il revend ta ${it.nm} sur Leboncoin et te file la moitié « pour la leçon ».`, Math.round(it.pr * .5)); }],
      ['Faire le mort', u => { st(u).daron = 3; if (Math.random() < .5) return R('Il reste 40 minutes derrière la porte, puis repart. Ton cœur aussi.'); const c = carOf(u), it = D.itemInfo(c); u.d.items.splice(u.d.items.indexOf(c), 1); return R(`Il avait le double des clés. Ta ${it.nm} disparaît sans un mot. Tu l'apprends sur le groupe de la famille.`); }],
      ['Lui offrir un kebab (15 €)', u => { st(u).daron = 3; return R('Il mange, il se calme, il te raconte sa jeunesse pendant deux heures. Tu gardes ta voiture.', -15); }]] },
  d3b: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 2 && !carOf(u), title: 'Le Daron coupe les vivres', text: () => '« À partir d\'aujourd\'hui : plus un centime. Tu te débrouilles. »',
    ch_: [['Pleurer au téléphone', u => { st(u).daron = 3; return R('Il craque au bout de 30 secondes et te vire 200 €. Il ne le dira jamais à ta mère.', 200); }],
      ['Faire le fier', u => { st(u).daron = 3; C.xp(u, 40); return R('« Pas besoin de ton argent. » Tu raccroches. Tu as 4 € sur ton compte. Mais quelle classe.'); }]] },
  d4: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 3, title: 'Le repas de famille', text: () => 'Dimanche midi. Toute la famille est là. Tata Josiane : « Alors, tu fais quoi dans la vie, toi ? »',
    ch_: [['« Je suis dans la finance »', u => { if (C.worth(u) >= 1e6) { st(u).daron = 4; u.d.unlocks.push('t:Fierté du Daron'); return R('Tu montres ton compte. Silence total. Le Daron essuie une larme et te fait un virement de fierté. Titre débloqué : « Fierté du Daron ».', Math.min(200000, Math.round(C.worth(u) * .02))); } return R('Tu montres ton compte. Tata Josiane te glisse 20 € dans la main. « Pour manger. »', 20); }],
      ['« Je suis entrepreneur »', u => { if (u.d.biz.length >= 2) { st(u).daron = 4; u.d.unlocks.push('t:Fierté du Daron'); return R('Tu parles de tes entreprises. Le Daron répète « mon fils, entrepreneur » à tout le monde. Titre débloqué : « Fierté du Daron ».', 5000); } return R('« Entrepreneur de quoi ? De dettes ? » Fou rire général. Même le chien rigole.'); }],
      ['Rembourser le Daron (10 000 €)', u => { if (u.d.cash < 10000) return R('Tu fouilles tes poches. Il te manque 9 996 €. Malaise.'); st(u).daron = 4; u.d.unlocks.push('t:Fierté du Daron'); C.xp(u, 100); return R('Il compte les billets deux fois. Puis il te serre dans ses bras. Première fois depuis 2014. Titre débloqué : « Fierté du Daron ».', -10000); }]] },
  d5: { ch: 'daron', ic: '👨', who: 'Le Daron', cond: u => st(u).daron === 4, cd: 3 * 3600000, title: 'Message du Daron', text: () => '« Fier de toi fiston. Je t\'ai fait un petit virement. Ne le claque pas au casino. »',
    ch_: [['Merci papa ❤️', u => R('Virement reçu. Tu sais très bien où il va finir.', Math.max(200, Math.min(50000, pct(u, .01))))]] },
  k1: { ch: 'kevin', ic: '🧢', who: 'Kevin', cd: 2 * 3600000, cond: u => u.d.cash >= 1000, title: 'La crypto du cousin', text: () => '« Frérot, mon cousin a lancé le KEVCOIN. Ça va faire ×100, c\'est sûr à 1 000 %. Tu mets combien ? »',
    ch_: [['Mettre 1 000 €', u => kev(u, 1000)], ['Mettre 10 000 €', u => u.d.cash >= 10000 ? kev(u, 10000) : R('Tu n\'as pas 10 000 €. Kevin te propose un crédit. Tu refuses. Sage.')],
      ['Non merci', () => R('Une semaine plus tard, le KEVCOIN vaut 0,0001 €. Kevin te demande de l\'argent pour un taxi.')]] },
  k2: { ch: 'kevin', ic: '🧢', who: 'Kevin', cd: 2 * 3600000, cond: u => u.d.cash >= 500 && !u.d.kev, title: 'Kevin a besoin de 500 €', text: () => '« Frère, dépanne-moi 500 €, je te rends 1 000 la semaine prochaine. Juré sur la tête de ma PS5. »',
    ch_: [['Prêter 500 €', u => { u.d.kev = { due: now() + rnd(8, 25) * 60000, pay: Math.random() < .35 ? 1000 : 0 }; return R('Il te fait un câlin et part en courant. « Tu vas voir, je suis un homme de parole ! »', -500); }],
      ['Refuser', u => { C.xp(u, 5); return R('« Radin. » Il te bloque sur Snap, puis te débloque deux minutes après pour voir ta story.'); }]] },
  k3: { ch: 'kevin', ic: '🧢', who: 'Kevin', cd: 3 * 3600000, cond: u => u.d.cash >= 2000 && !u.d.kevinPlan, title: 'Kevin a un plan', text: () => '« J\'ai repéré une bijouterie. Le vigile fait la sieste à 14 h. Je te file le plan contre 2 000 €. »',
    ch_: [['Acheter le plan (2 000 €)', u => { if (Math.random() < .2) return R('Le « plan », c\'est un dessin de bijouterie au feutre. Kevin est déjà parti.', -2000); u.d.kevinPlan = 1; return R('Le plan a l\'air sérieux (pour une fois). Ton prochain braquage rapportera ×1,5.', -2000); }],
      ['Le balancer à la police', u => R('La police te remercie et te donne une prime. Kevin ne te parle plus. Bonne affaire.', 300)]] },
  k4: { ch: 'kevin', ic: '🧢', who: 'Kevin', cd: 3 * 3600000, cond: u => u.d.cash >= 2000, title: 'La « vraie » Rolex', text: () => '« Montre de luxe véritable, 2 000 € au lieu de 25 000. Elle est tombée d\'un camion. Mais un camion de luxe. »',
    ch_: [['Acheter (2 000 €)', u => { if (Math.random() < .2 && !u.d.items.includes('rolex')) { u.d.items.push('rolex'); return R('Incroyable : elle est vraie. Kevin ne comprend pas non plus.', -2000); } return R('Elle fait tic-tac… puis plus rien. Le logo est écrit « ROLEKS ».', -2000); }],
      ['Non', () => R('Kevin la vend à ton voisin. Elle était vraie, évidemment.')]] },
  g1: { ch: 'gerard', ic: '⚖️', who: 'Gérard l\'huissier', cd: 3600000, cond: u => C.owed(u.d) > 2000 && !(u.d.gerSafe > now()), title: 'Gérard l\'huissier sonne',
    text: u => `« Bonjour, Gérard, huissier de justice. C'est pour la petite dette de ${C.eur(C.owed(u.d))}. On peut s'arranger… ou pas. »`,
    ch_: [['Le soudoyer (10 % de ta dette)', u => { const c = Math.max(200, Math.round(C.owed(u.d) * .1)); if (u.d.cash < c) return R('Tu n\'as même pas de quoi le soudoyer. Il note ça dans son carnet, déçu.');
        if (Math.random() < .75) { u.d.gerSafe = now() + 3600000; return R('Gérard compte les billets, te fait un clin d\'œil et repart. Tranquille pendant une heure.', -c); } const it = cheapest(u); return R(`Gérard prend l'argent ET saisit ${it ? 'ta ' + D.itemInfo(it).nm : 'ta dignité'}. Professionnel.`, -c); }],
      ['Te cacher chez Tata Josiane', u => { u.d.gerSafe = now() + 3600000; u.d.banUntil = Math.max(u.d.banUntil, now() + 90000); return R('Tata Josiane te fait des crêpes et te parle de son chat pendant trois heures. Gérard repart bredouille. (Casino fermé 90 s, le temps des crêpes.)'); }],
      ['Le défier aux dés', u => { if (Math.random() < .5) { const off = Math.round(u.d.debt * .2); u.d.debt -= off; return R(`Gérard fait 2. Tu fais 6. Il raye ${C.eur(off)} de ta dette en pleurant dans son col roulé.`); } const it = priciest(u); if (it) { u.d.items.splice(u.d.items.indexOf(it), 1); u.d.seized++; return R(`Gérard fait double six. Il repart avec ta ${D.itemInfo(it).nm} sous le bras en sifflotant.`); } return R('Gérard gagne. Comme tu n\'as rien, il prend une photo de toi « pour le dossier ».', -pct(u, .05)); }]] },
  e2: { ch: 'ex', ic: '💔', who: 'Ton ex', cd: 4 * 3600000, cond: u => !!carOf(u), title: 'Ton ex poste une story', text: u => `Ton ex a posté une story devant TA ${D.itemInfo(carOf(u)).nm}. Légende : « Mon nouveau bébé 😍 ».`,
    ch_: [['Commenter « C\'est la mienne »', u => { C.xp(u, 20); return R('Elle supprime la story en 4 secondes. 1-0 pour toi.'); }],
      ['Réclamer 500 € de droits d\'image', () => Math.random() < .5 ? R('Elle paye pour avoir la paix. Business.', 500) : R('Elle te bloque partout. Même sur LinkedIn.')],
      ['Ignorer comme un roi', u => { C.xp(u, 10); return R('Tu ne réagis pas. Elle a vérifié 14 fois si tu avais vu sa story.'); }]] }
};
function kev(u, a) { const r = Math.random(); if (r < .12) return R(`Le KEVCOIN décolle ! Kevin pleure de joie. Toi aussi. ×5 !`, a * 4); if (r < .37) return R('Le KEVCOIN monte un peu. Tu revends vite fait. ×1,5.', Math.round(a * .5)); return R('Le cousin a disparu avec la caisse. Kevin aussi, d\'ailleurs.', -a); }
function cheapest(u) { const its = u.d.items.filter(id => D.itemInfo(id)).sort((a, b) => D.itemInfo(a).pr - D.itemInfo(b).pr); const it = its[0]; if (it) { u.d.items.splice(u.d.items.indexOf(it), 1); u.d.seized++; } return it; }
function priciest(u) { return u.d.items.filter(id => D.itemInfo(id) && D.itemInfo(id).pr < 5e7).sort((a, b) => D.itemInfo(b).pr - D.itemInfo(a).pr)[0]; }
function storyFor(u) { const s = st(u), list = Object.entries(STORIES).filter(([id, n]) => { const last = s.cd[id] || 0; return n.cond(u) && now() - last > (n.cd || 30 * 60000); }); if (!list.length) return null; return pick(list); }
C.api.storyAnswer = (u, p) => { const id = u.s.story; if (!id || p.id !== id) throw E('Cette histoire est terminée.'); u.s.story = null; const n = STORIES[id], c = n.ch_[+p.c]; if (!c) throw E('Choix invalide.'); st(u).cd[id] = now();
  const r = c[1](u); if (r.amt) C.money(u, r.amt < 0 ? -Math.min(u.d.cash, -r.amt) : r.amt); C.checkAch(u); C.markDirty(u); return { txt: r.txt, amt: r.amt, who: n.who, ic: n.ic }; };
setInterval(() => { const t = now(); C.users.forEach(u => { if (!u.sockets.size) return;
    if (u.d.kev && t > u.d.kev.due) { const k = u.d.kev; u.d.kev = null; if (k.pay) { C.money(u, k.pay); C.notify(u, { ic: '🧢', from: 'Kevin', body: 'Il t\'a vraiment rendu 1 000 € ! Personne ne te croira.', big: 1, keep: 1 }); } else C.notify(u, { ic: '🧢', from: 'Kevin', body: 'Kevin poste une story depuis Ibiza. Avec tes 500 €.', keep: 1 }); C.markDirty(u); }
    if (!u.s.nextStory) { u.s.nextStory = t + rnd(2, 5) * 60000; return; } if (t < u.s.nextStory || u.s.story) return; u.s.nextStory = t + rnd(5, 10) * 60000;
    const sel = storyFor(u); if (!sel) return; const [id, n] = sel; u.s.story = id; send(u, { type: 'story', id, ic: n.ic, who: n.who, title: n.title, text: n.text(u), choices: n.ch_.map(c => c[0]) }); }); }, 20000);

/* ---------- Braquages 2.0 : piratage, coffre, prison ---------- */
const HSYM = 6;
function caught(u, txt) { const h = u.s.he, t = D.HEISTS[h.i]; u.s.he = null; u.d.jail++; u.d.banUntil = u.d.jailUntil = now() + 180000; C.feed(`<b>${C.esc(u.pseudo)}</b> s'est fait arrêter pendant un braquage`);
  C.sysChat && C.sysChat(`🚔 ${u.pseudo} vient de se faire arrêter en plein braquage. On lui apporte des oranges ?`); C.checkAch(u); C.result(u, 'heist', t.cost, 0); return { caught: 1, txt }; }
const _pick = C.api.hePick;
C.api.hePick = (u, p) => { const r = _pick(u, p); const h = u.s.he; if (r.phase === 'run' && h) { if (u.d.kevinPlan) { u.d.kevinPlan = 0; h.loot = Math.round(h.loot * 1.5); h.kevin = 1; }
    h.phase = 'hack'; h.seq = Array.from({ length: 4 + h.i }, () => Math.random() * HSYM | 0); return { ok: r.ok, pos: r.pos, phase: 'hack', lockFail: r.lockFail, alert: h.alert, seq: h.seq, kevin: h.kevin }; } return r; };
C.api.heHack = (u, p) => { const h = u.s.he; if (!h || h.phase !== 'hack') throw E('Pas de caméras à pirater.'); const a = (Array.isArray(p.ans) ? p.ans : []).map(Number); const ok = a.length === h.seq.length && a.every((x, i) => x === h.seq[i]);
  if (!ok) { h.alert++; h.loot = Math.round(h.loot * .8); if (h.alert >= 3) return { ok, ...caught(u, 'Les caméras t\'ont filmé en gros plan. Ta photo passe au JT de 20 h.') }; }
  h.phase = 'safe'; h.code = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).join(''); h.ctries = 0; return { ok, phase: 'safe', alert: h.alert }; };
C.api.heSafe = (u, p) => { const h = u.s.he; if (!h || h.phase !== 'safe') throw E('Pas de coffre à ouvrir.'); const g = String(p.g || ''); if (!/^\d{3}$/.test(g) || new Set(g).size !== 3) throw E('Trois chiffres différents.');
  h.ctries++; let bien = 0, mal = 0; for (let i = 0; i < 3; i++) { if (g[i] === h.code[i]) bien++; else if (h.code.includes(g[i])) mal++; }
  if (bien === 3) { h.phase = 'run'; h.turn = 0; return { bien, mal, open: 1, phase: 'run', ...turnInfo(h) }; }
  if (h.ctries >= 6) { h.alert++; h.loot = Math.round(h.loot * .6); if (h.alert >= 3) return { bien, mal, ...caught(u, 'Tu as sorti la perceuse. Tout le quartier a entendu. Les voisins ont appelé la police (et se plaignent du bruit).') }; h.phase = 'run'; h.turn = 0; return { bien, mal, drill: 1, code: h.code, phase: 'run', ...turnInfo(h) }; }
  return { bien, mal, left: 6 - h.ctries }; };
function turnInfo(h) { h.police = Math.random() < .5 ? 0 : 1; const side = Math.random() < .7 ? h.police : 1 - h.police; return { alert: h.alert, turn: h.turn, hint: side }; }
['heTurn', 'heSplit'].forEach(k => { const o = C.api[k]; C.api[k] = (u, p) => { const r = o(u, p); if (r && r.caught) u.d.jailUntil = u.d.banUntil = now() + 180000; return r; }; });
C.api.jailBribe = u => { if (!((u.d.jailUntil || 0) > now())) throw E('Tu n\'es pas en prison.'); const c = Math.max(500, pct(u, .08)); C.pay(u, c);
  if (Math.random() < .7) { u.d.jailUntil = u.d.banUntil = now(); return { free: 1, cost: c }; } u.d.jailUntil = u.d.banUntil = u.d.jailUntil + 60000; return { free: 0, cost: c }; };
C.api.jailEscStart = u => { if (!((u.d.jailUntil || 0) > now())) throw E('Tu n\'es pas en prison.'); if (u.s.esc) throw E('Évasion déjà en cours.'); u.s.esc = { t0: now(), zx: rnd(10, 72), ph: rnd(0, 6) }; return { zx: u.s.esc.zx, ph: u.s.esc.ph, zone: 18, speed: 2.4 }; };
C.api.jailEscTry = (u, p) => { const e = u.s.esc; if (!e) throw E('Pas d\'évasion en cours.'); u.s.esc = null; const ms = Math.max(0, Math.min(+p.ms || 0, now() - e.t0 + 400)), pos = D.needle(ms, 2.4, e.ph), ok = pos >= e.zx && pos <= e.zx + 18;
  if (ok) { u.d.jailUntil = u.d.banUntil = now(); u.d.escapes = (u.d.escapes || 0) + 1; C.checkAch(u); C.sysChat && C.sysChat(`🏃 ${u.pseudo} s'est évadé de prison avec une cuillère. Légende.`); return { ok, pos }; }
  u.d.jailUntil = u.d.banUntil = Math.max(u.d.jailUntil, now()) + 90000; return { ok, pos }; };

/* ---------- Braquages entre potes (avec trahison possible) ---------- */
const CREWS = new Map(); let crewId = 1;
const crewView = c => ({ id: c.id, i: c.i, host: c.host, phase: c.phase, endsAt: c.endsAt, loot: c.loot, members: c.m.map(x => ({ id: x.id, pseudo: x.pseudo, av: x.av, ok: x.ok, voted: x.vote !== null, gain: x.gain, betray: c.phase === 'done' ? x.vote : undefined })), res: c.res });
const crewEmit = c => c.m.forEach(x => { const u = C.users.get(x.id); if (u) u.sockets.forEach(s => s.emit('crew', { ...crewView(c), me: x.id, needle: c.phase === 'play' && x.ok === null ? x.nd : null })); });
const myCrew = u => [...CREWS.values()].find(c => c.m.some(x => x.id === u.id) && c.phase !== 'done');
C.api.crewCreate = (u, p) => { if (myCrew(u)) throw E('Tu es déjà dans une équipe.'); const t = D.HEISTS[+p.i]; if (!t) throw E('Cible inconnue.'); if (Date.now() < u.d.banUntil) throw E('Tu es interdit de casino pour l\'instant.'); C.pay(u, t.cost);
  const c = { id: 'c' + (crewId++), i: +p.i, host: u.id, phase: 'lobby', m: [{ id: u.id, pseudo: u.pseudo, av: u.d.av.v2, ok: null, vote: null }], t: now() }; CREWS.set(c.id, c); crewEmit(c); return crewView(c); };
C.api.crewInvite = async (u, p) => { const c = CREWS.get(p.id); if (!c || c.host !== u.id || c.phase !== 'lobby') throw E('Équipe introuvable.'); const to = await C.getUser(+p.to); if (!to || !to.sockets.size) throw E('Ce joueur n\'est pas en ligne.');
  send(to, { type: 'crewInv', id: c.id, from: u.pseudo, av: u.d.av.v2, target: D.HEISTS[c.i].nm }); return {}; };
C.api.crewJoin = (u, p) => { const c = CREWS.get(p.id); if (!c || c.phase !== 'lobby') throw E('Cette équipe est déjà partie.'); if (myCrew(u)) throw E('Tu es déjà dans une équipe.'); if (c.m.length >= 4) throw E('L\'équipe est complète.');
  if (Date.now() < u.d.banUntil) throw E('Tu es interdit de casino pour l\'instant.'); c.m.push({ id: u.id, pseudo: u.pseudo, av: u.d.av.v2, ok: null, vote: null }); crewEmit(c); return crewView(c); };
C.api.crewLeave = u => { const c = myCrew(u); if (!c) return {}; if (c.phase !== 'lobby') throw E('Trop tard, le casse a commencé !'); if (c.host === u.id) { c.phase = 'done'; c.res = 'annulé'; C.money(u, D.HEISTS[c.i].cost); crewEmit(c); CREWS.delete(c.id); return {}; } c.m = c.m.filter(x => x.id !== u.id); crewEmit(c); return {}; };
C.api.crewLaunch = u => { const c = myCrew(u); if (!c || c.host !== u.id || c.phase !== 'lobby') throw E('Tu n\'es pas le chef d\'une équipe.'); if (c.m.length < 2) throw E('Il faut au moins un complice.'); const t = D.HEISTS[c.i];
  c.phase = 'play'; c.endsAt = now() + 30000; c.m.forEach(x => { x.nd = { zx: rnd(5, 95 - t.zone), ph: rnd(0, 6), zone: t.zone, speed: t.speed, t0: now() }; }); crewEmit(c); setTimeout(() => crewPlayEnd(c), 30500); return {}; };
C.api.crewPick = (u, p) => { const c = myCrew(u); if (!c || c.phase !== 'play') throw E('Pas de casse en cours.'); const x = c.m.find(y => y.id === u.id); if (x.ok !== null) throw E('Tu as déjà joué ton rôle.');
  const ms = Math.max(0, Math.min(+p.ms || 0, now() - x.nd.t0 + 400)), pos = D.needle(ms, x.nd.speed, x.nd.ph); x.ok = pos >= x.nd.zx && pos <= x.nd.zx + x.nd.zone; crewEmit(c); if (c.m.every(y => y.ok !== null)) crewPlayEnd(c); return { ok: x.ok, pos }; };
function crewPlayEnd(c) { if (c.phase !== 'play') return; c.m.forEach(x => { if (x.ok === null) x.ok = false; }); const n = c.m.length, okN = c.m.filter(x => x.ok).length, t = D.HEISTS[c.i];
  if (!okN) { c.phase = 'done'; c.res = 'caught'; c.m.forEach(x => C.withUser(x.id, u => { u.d.jail++; u.d.banUntil = u.d.jailUntil = now() + 180000; C.result(u, 'heist', x.id === c.host ? t.cost : 0, 0); })); C.sysChat && C.sysChat(`🚔 Toute l'équipe de ${c.m.map(x => x.pseudo).join(', ')} s'est fait arrêter. Le fourgon était plein.`); crewEmit(c); CREWS.delete(c.id); return; }
  c.loot = Math.round(rnd(...t.loot) * (.5 + .5 * okN / n) * (1 + .25 * (n - 1)) / 10) * 10; c.phase = 'vote'; c.endsAt = now() + 20000; crewEmit(c); setTimeout(() => crewVoteEnd(c), 20500); }
C.api.crewVote = (u, p) => { const c = myCrew(u); if (!c || c.phase !== 'vote') throw E('Pas de partage en cours.'); const x = c.m.find(y => y.id === u.id); if (x.vote !== null) throw E('Tu as déjà choisi.'); x.vote = !!p.betray; crewEmit(c); if (c.m.every(y => y.vote !== null)) crewVoteEnd(c); return {}; };
function crewVoteEnd(c) { if (c.phase !== 'vote') return; c.m.forEach(x => { if (x.vote === null) x.vote = false; }); const B = c.m.filter(x => x.vote), n = c.m.length, t = D.HEISTS[c.i];
  if (!B.length) { c.m.forEach(x => x.gain = Math.round(c.loot / n)); c.res = 'share'; }
  else if (B.length === 1) { B[0].gain = Math.round(c.loot * .7); c.m.filter(x => !x.vote).forEach(x => x.gain = Math.round(c.loot * .3 / (n - 1))); c.res = 'betray'; }
  else { c.m.forEach(x => x.gain = Math.round(c.loot * .15 / n)); c.res = 'chaos'; }
  c.phase = 'done'; c.m.forEach(x => C.withUser(x.id, u => { if (x.gain) C.money(u, x.gain); u.d.heistOk++; if (x.vote) u.d.betrays = (u.d.betrays || 0) + 1; if (c.res === 'chaos' && x.vote) u.d.banUntil = u.d.jailUntil = now() + 120000; C.checkAch(u); C.result(u, 'heist', x.id === c.host ? t.cost : 0, x.gain + (x.id === c.host ? t.cost : 0)); }));
  if (C.sysChat) C.sysChat(c.res === 'share' ? `💼 L'équipe ${c.m.map(x => x.pseudo).join(', ')} a braqué ${t.nm.toLowerCase()} et partagé ${C.eur(c.loot)} comme des pros.` : c.res === 'betray' ? `🐍 TRAHISON ! ${B[0].pseudo} a doublé ses complices (${c.m.filter(x => !x.vote).map(x => x.pseudo).join(', ')}) et part avec ${C.eur(B[0].gain)}.` : `🐍🐍 Plusieurs traîtres dans l'équipe (${B.map(x => x.pseudo).join(', ')}) : tout le monde s'est balancé, presque tout le butin est parti chez les flics.`);
  crewEmit(c); CREWS.delete(c.id); }
C.leave = C.leave || []; C.leave.push(u => { if (!u.sockets.size) { const c = myCrew(u); if (c && c.phase === 'lobby') { try { C.api.crewLeave(u); } catch (e) { } } } });

/* ---------- Succès V6 ---------- */
Object.assign(C.ACHF, { evade: d => (d.escapes || 0) >= 1, traitre: d => (d.betrays || 0) >= 1, roiweek: d => (d.weekWins || 0) >= 1, fierte: d => (d.story || {}).daron === 4, pick: d => (d.picks || 0) >= 1 });
