/* ====================== Boutique ====================== */
VIEWS.shop=v=>{const k=sub.shop;
  v.innerHTML=`<h2>La boutique</h2><p class="sub">${{luxe:'Ça ne sert à rien. C\'est pour flexer devant les autres joueurs. Revente à 70 % du prix.',boosts:'Des boosts inventés : ils aident, mais ont toujours un effet secondaire. Trois d\'un coup et ça part en embrouille.',col:'Complète un album pour toucher une grosse prime. Certains objets ne s\'obtiennent qu\'aux enchères.',caisses:'Des caisses à ouvrir : de l\'argent, des objets de luxe et 4 objets exclusifs introuvables ailleurs.',style:'Ton avatar, ta carte bancaire et l\'ambiance du casino. De nouveaux styles se débloquent avec ton niveau.'}[k]}</p>
  ${segHTML('shop',[['luxe','Luxe'],['boosts','Boosts'],['col','Collections'],['caisses','📦 Caisses'],['style','Style']])}<div class="section" style="margin-top:12px" id="sv"></div>`;
  ({luxe:rLuxe,boosts:rBoosts,col:rCol,style:rStyle,caisses:rCrates})[k]($('#sv'))};
function rLuxe(v){const t=S.tier;
  v.innerHTML=`<div class="grid">${D.SHOP.map(it=>{const own=S.items.includes(it.id),locked=(it.tier||0)>t;
    return`<div class="item ${own?'owned':''}"><div class="ic" aria-hidden="true">${it.ic}</div><div class="nm">${it.nm}</div><div class="pr">${eur(it.pr)}${it.rent?` <span class="note">· loyer ${eur(it.rent)}/h</span>`:''}</div>
    ${own?`<button class="btn" data-act="sell" data-v="${it.id}">Revendre ${eur(it.pr*.7)}</button>`:locked?`<div class="lock">🔒 Carte ${D.TIERS[it.tier].name} requise</div>`:`<button class="btn gold" data-act="buy" data-v="${it.id}" ${S.cash<it.pr?'disabled':''}>Acheter</button>`}</div>`}).join('')}</div>
  ${S.items.filter(id=>D.SPECIAL[id]).length?`<h3>Objets de collection</h3><div class="grid">${S.items.filter(id=>D.SPECIAL[id]).map(id=>{const it=D.SPECIAL[id];return`<div class="item owned"><div class="ic">${it.ic}</div><div class="nm">${it.nm}</div><div class="pr">${eur(it.pr)}</div><button class="btn" data-act="sell" data-v="${id}">Revendre ${eur(it.pr*.7)}</button></div>`}).join('')}</div>`:''}`}
ACT.buy=async el=>{try{await api('buy',{id:el.dataset.v});toast(itemInfo(el.dataset.v).nm+' achetée. Flex activé.');burst(12);snd('big');needRender()}catch(e){}};
ACT.sell=async el=>{try{await api('sell',{id:el.dataset.v});toast(itemInfo(el.dataset.v).nm+' revendue.');needRender()}catch(e){}};
function rBoosts(v){v.innerHTML=D.BOOSTS.map(b=>{const cnt=b.id==='cafe'?(S.cafeUntil>now()?Math.ceil((S.cafeUntil-now())/60000)+' min':0):b.id==='xp'?(S.xpBoostUntil>now()?Math.ceil((S.xpBoostUntil-now())/60000)+' min':0):S.boosts[b.id];
  return`<div class="boost"><div class="ic" aria-hidden="true">${b.ic}</div><div class="nm"><span>${b.nm}</span><span class="num" style="color:var(--gold)">${eur(b.pr)}</span></div><div class="ef">${b.ef}</div><div class="se">Effet secondaire : ${b.se}</div>
  <button class="btn gold sm" data-act="boost" data-v="${b.id}" ${S.cash<b.pr?'disabled':''}>Acheter${cnt?` · actif (${cnt})`:''}</button></div>`}).join('')}
ACT.boost=async el=>{try{const r=await api('boost',{id:el.dataset.v});snd('pop');toast(D.BOOSTS.find(x=>x.id===el.dataset.v).nm+' activé.');needRender();if(r.embrouille)setTimeout(embrouille,500)}catch(e){}};
function embrouille(){shake();snd('boom');modal(`<p class="mt bad">EMBROUILLE</p><p class="note">Trois boosts d'affilée, ton perso part en vrille. Le videur te provoque en duel : pierre, feuille, ciseaux.</p>
  <div class="rps"><button data-act="rps" data-v="0" aria-label="Pierre">✊</button><button data-act="rps" data-v="1" aria-label="Feuille">✋</button><button data-act="rps" data-v="2" aria-label="Ciseaux">✌️</button></div><div class="msg" id="rpsR"></div>`)}
ACT.rps=async el=>{const ic=['✊','✋','✌️'];let r;try{r=await api('rps',{m:+el.dataset.v})}catch(e){return}const o=$('#rpsR');
  if(r.res==='draw'){o.textContent='Le videur fait '+ic[r.h]+'. Égalité, rejoue !';return}$$('.rps button').forEach(b=>b.disabled=true);
  if(r.res==='win'){o.innerHTML=`Le videur fait ${ic[r.h]}. Tu gagnes le respect du casino : +${eur(r.g)}`;o.className='msg win'}else{o.innerHTML=`Le videur fait ${ic[r.h]}. La sécurité te sort du casino pendant 90 secondes.`;o.className='msg lose';shake()}
  o.insertAdjacentHTML('afterend','<button class="btn gold" data-act="mclose">OK</button>')};
function rCol(v){v.innerHTML=D.ALBUMS.map(a=>{const got=a.items.filter(id=>S.items.includes(id)),done=got.length===a.items.length,claimed=S.albums.includes(a.id);
  return`<div class="album"><div style="display:flex;justify-content:space-between;align-items:center"><b>${a.ic} ${a.nm}</b><span class="num note">${got.length}/${a.items.length}</span></div>
    <div class="slots">${a.items.map(id=>{const it=itemInfo(id),g=S.items.includes(id);return`<span class="slot ${g?'got':'miss'}" title="${it.nm}" aria-label="${it.nm}${g?'':' (manquant)'}">${it.ic}</span>`}).join('')}</div>
    <div class="progress"><i style="width:${got.length/a.items.length*100}%"></i></div>
    ${claimed?'<span class="tag">Prime touchée ✓</span>':done?`<button class="btn gold" data-act="album" data-v="${a.id}">Toucher la prime · ${eur(a.bonus)}</button>`:`<span class="note">Prime : ${eur(a.bonus)}${a.items.some(id=>D.SPECIAL[id])?' · certains objets viennent des enchères':''}</span>`}</div>`}).join('')}
ACT.album=async el=>{try{await api('album',{id:el.dataset.v});burst(40);snd('big');needRender()}catch(e){}};
function rStyle(v){const L=LV();
  v.innerHTML=`<div class="center">${avHTML(96)}</div>
  <h3>Visage</h3><div class="picker">${D.FACES.map(([f,l])=>`<button data-act="st" data-k="face" data-v="${f}" class="${S.av.face===f?'on':''}" ${L<l&&!S.unlocks.includes(f)?'disabled':''} aria-label="Visage ${f}">${f}${L<l&&!S.unlocks.includes(f)?`<span class="lk">${l>=99?'Pass':'Niv '+l}</span>`:''}</button>`).join('')}</div>
  <h3>Accessoire</h3><div class="picker">${D.ACCS.map(([a,l])=>`<button data-act="st" data-k="acc" data-v="${a}" class="${S.av.acc===a?'on':''}" ${L<l?'disabled':''} aria-label="Accessoire">${a||'∅'}${L<l?`<span class="lk">Niv ${l}</span>`:''}</button>`).join('')}</div>
  <h3>Ta carte bancaire</h3>${cardHTML()}
  <div class="picker">${D.CARDCOL.map((c,i)=>`<button class="swatch ${S.card.col===i?'on':''}" data-act="st" data-k="col" data-v="${i}" style="background:${c||'linear-gradient(135deg,#888,#333)'}" aria-label="${i?'Couleur '+i:'Couleur de ta carte'}">${i?'':'⟲'}</button>`).join('')}</div>
  <div class="picker">${D.MOTIFS.map(([k,n,l])=>`<button data-act="st" data-k="mot" data-v="${k}" class="${S.card.mot===k?'on':''}" ${L<l?'disabled':''} style="font-size:13px;font-weight:700">${n}${L<l?`<span class="lk">Niv ${l}</span>`:''}</button>`).join('')}</div>
  <h3>Ambiance du casino</h3><div class="picker">${Object.entries(D.THEMES).map(([k,t])=>`<button data-act="st" data-k="theme" data-v="${k}" class="${S.theme===k?'on':''}" ${L<t.lvl?'disabled':''} style="font-size:13px;font-weight:700">${t.nm}${L<t.lvl?`<span class="lk">Niv ${t.lvl}</span>`:''}</button>`).join('')}</div>`}
ACT.st=async el=>{const k=el.dataset.k;let v=el.dataset.v;if(k==='col')v=+v;try{await api('style',{[k]:v});needRender()}catch(e){}};
