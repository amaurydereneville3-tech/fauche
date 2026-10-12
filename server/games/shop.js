// Boutique, boosts, embrouille, collections, style.
const C = require('../core');
const { D, E } = C;

C.api.buy = (u, p) => { const it = D.SHOP.find(x => x.id === p.id); if (!it) throw E('Objet inconnu.'); if (u.d.items.includes(it.id)) throw E('Tu l\'as déjà.');
  if ((it.tier || 0) > C.tierIdx(u)) throw E('Il te faut la carte ' + D.TIERS[it.tier].name + '.'); if (u.d.cash < it.pr) throw E('Pas assez d\'argent.');
  if (it.rent) { const pe = C.pending(u.d); if (pe > 0) C.money(u, pe); u.d.lastCollect = Date.now(); }
  C.pay(u, it.pr); u.d.items.push(it.id); if (it.pr >= 100000) C.feed(`<b>${C.esc(u.pseudo)}</b> s'offre : ${it.nm}`); C.track(u, 'buy', null, 1); C.checkAch(u); return {}; };
C.api.sell = (u, p) => { const i = u.d.items.indexOf(p.id); if (i < 0) throw E('Tu ne possèdes pas cet objet.'); const it = D.itemInfo(p.id); u.d.items.splice(i, 1); C.money(u, Math.round(it.pr * .7)); return {}; };

C.api.boost = (u, p) => { const b = D.BOOSTS.find(x => x.id === p.id); if (!b) throw E('Boost inconnu.'); if (u.d.embrouille) throw E('Règle d\'abord ton embrouille !'); C.pay(u, b.pr);
  if (b.id === 'cafe') u.d.cafeUntil = Math.max(Date.now(), u.d.cafeUntil) + 5 * 60000; else if (b.id === 'xp') u.d.xpBoostUntil = Math.max(Date.now(), u.d.xpBoostUntil) + 10 * 60000; else u.d.boosts[b.id] += b.n;
  if (b.id === 'requin') u.d.suspectUntil = Date.now() + 10 * 60000;
  u.d.boostLog = u.d.boostLog.filter(t => Date.now() - t < 120000); u.d.boostLog.push(Date.now());
  if (u.d.boostLog.length >= 3) { u.d.boostLog = []; u.d.embrouille = true; C.feed(`<b>${C.esc(u.pseudo)}</b> déclenche une embrouille au casino`); return { embrouille: 1 }; }
  return {}; };
C.api.rps = (u, p) => { if (!u.d.embrouille) throw E('Pas d\'embrouille en cours.'); const m = +p.m, h = Math.random() * 3 | 0; if (!(m >= 0 && m < 3)) throw E('Choix invalide.');
  if (m === h) return { h, res: 'draw' }; u.d.embrouille = false; const win = (m - h + 3) % 3 === 1;
  if (win) { const g = Math.round(u.d.cash * .05); C.money(u, g); return { h, res: 'win', g }; }
  u.d.banUntil = Date.now() + 90000; return { h, res: 'lose' }; };

C.api.album = (u, p) => { const a = D.ALBUMS.find(x => x.id === p.id); if (!a) throw E('Album inconnu.'); if (u.d.albums.includes(a.id)) throw E('Prime déjà touchée.');
  if (!a.items.every(id => u.d.items.includes(id))) throw E('Album incomplet.'); u.d.albums.push(a.id); C.money(u, a.bonus); C.feed(`<b>${C.esc(u.pseudo)}</b> complète l'album ${a.nm}`); C.checkAch(u); return {}; };

C.api.style = (u, p) => { const L = C.LV(u);
  if (p.face !== undefined) { const f = D.FACES.find(x => x[0] === p.face); if (!f || (L < f[1] && !u.d.unlocks.includes(f[0]))) throw E('Visage verrouillé.'); u.d.av.face = f[0]; }
  if (p.acc !== undefined) { const a = D.ACCS.find(x => x[0] === p.acc); if (!a || L < a[1]) throw E('Accessoire verrouillé.'); u.d.av.acc = a[0]; }
  if (p.col !== undefined) { const c = +p.col; if (!(c >= 0 && c < D.CARDCOL.length)) throw E('Couleur invalide.'); u.d.card.col = c; }
  if (p.mot !== undefined) { const m = D.MOTIFS.find(x => x[0] === p.mot); if (!m || L < m[2]) throw E('Motif verrouillé.'); u.d.card.mot = m[0]; }
  if (p.theme !== undefined) { const t = D.THEMES[p.theme]; if (!t || L < t.lvl) throw E('Ambiance verrouillée.'); u.d.theme = p.theme; }
  if (p.wall !== undefined) { const w = +p.wall; if (!(w >= 0 && w < D.WALLS.length)) throw E('Couleur invalide.'); u.d.room.wall = w; }
  return {}; };
