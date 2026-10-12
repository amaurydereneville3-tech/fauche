/* ====================== V6 : interface dorée ====================== */
const ico=(p,w=24)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON={home:ico('<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'),
  casino:ico('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'),
  vie:ico('<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/><path d="M10 10h4"/>'),
  social:ico('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>'),
  moi:ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  gift:ico('<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S9 9 12 9zM12 9c2-4 6-4 6-1.5S15 9 12 9z"/>',22),
  pen:ico('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',16),back:ico('<path d="M15 5l-7 7 7 7"/>',20),
  coin:`<svg width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="url(#gGoldUI)"/><circle cx="14" cy="14" r="8.5" fill="none" stroke="#9a6512" stroke-width="1.5" stroke-dasharray="2.5 2"/><path d="M11 9h6M11 14h5M11 9v10" stroke="#5c3a06" fill="none" stroke-width="2.2" stroke-linecap="round"/></svg>`};
document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gGoldUI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c9"/><stop offset=".45" stop-color="#f2c14e"/><stop offset="1" stop-color="#9a6512"/></linearGradient>
<linearGradient id="gRedUI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a8a"/><stop offset="1" stop-color="#b5122b"/></linearGradient>
<linearGradient id="gCyanUI" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3fcff"/><stop offset=".5" stop-color="#4cc9f0"/><stop offset="1" stop-color="#1a5f99"/></linearGradient></defs></svg>`);

/* ---------- Navigation : 5 onglets ---------- */
TABS.length=0;TABS.push(['home','home','Accueil'],['casino','casino','Casino'],['vie','vie','Ma vie'],['social','social','Social'],['moi','moi','Moi']);
sub.vie=null;
const NAVOF={paris:'casino',marches:'vie',shop:'vie'};
nav=function(){const cur=NAVOF[tab]||tab;$('#nav').innerHTML=TABS.map(([k,i,l])=>`<button data-act="tab" data-v="${k}" class="${k===cur?'on':''}" aria-label="${l}" ${k===cur?'aria-current="page"':''}><span class="i" aria-hidden="true">${ICON[i]}</span>${l}${k==='social'&&unread?`<span class="unread">${unread>9?'9+':unread}</span>`:''}</button>`).join('')};
const _ACTtab=ACT.tab;ACT.tab=el=>{if(el.dataset.v==='vie'&&!busyAny())sub.vie=null;if(el.dataset.v==='casino'&&tab==='casino'&&!busyAny())sub.casino=null;_ACTtab(el)};
const backBar=(lbl,act)=>`<div class="back6"><button class="btn sm" ${act}>${ICON.back} ${lbl}</button></div>`;
['marches','shop','paris'].forEach(k=>{const o=VIEWS[k];VIEWS[k]=v=>{o(v);v.insertAdjacentHTML('afterbegin',k==='paris'?backBar('Casino','data-act="tab" data-v="casino"'):backBar('Ma vie','data-act="tab" data-v="vie"'))}});

/* ---------- Ma vie ---------- */
const VIE=[['marches','bourse','Bourse & crypto','Les vrais cours, levier jusqu\'à ×100','#2d6cdf',ico('<path d="M3 20h18"/><path d="M5 16l4-5 3 3 6-8"/><path d="M14 6h4v4"/>',30)],
  ['marches','biz','Entreprises','Revenus toutes les heures','#1f8a5b',ico('<path d="M3 21h18M5 21V10h14v11"/><path d="M3 10l2-6h14l2 6"/><path d="M9 21v-5h6v5"/>',30)],
  ['marches','auc','Enchères','Objets rares, vrais rivaux','#c3343a',ico('<path d="M14 4l6 6M11 7l6 6M4 20l8-8"/><path d="M13 5l-3 3 6 6 3-3z"/><path d="M3 21h8"/>',30)],
  ['shop','luxe','Boutique de luxe','Voitures, yachts, immeubles','#e3b558',ico('<path d="M6 7h12l1 14H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',30)],
  ['shop','caisses','Caisses mystère','Des objets introuvables ailleurs','#a35cf0',ico('<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',30)],
  ['shop','boosts','Boosts','Avec effets secondaires','#ff7a6b',ico('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',30)],
  ['shop','col','Collections','Complète les albums','#0e7c86',ico('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',30)],
  ['shop','style','Carte & ambiance','Ta carte bancaire, le décor','#b8902e',ico('<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',30)],
  ['vie','ville','Ma ville','Tout ce que tu possèdes + courses','#3e8fd0',ico('<path d="M3 21h18"/><path d="M4 21V11h5v10M10 21V5h6v16M17 21v-7h3v7"/>',30)],
  ['vie','appart','Mon appart','Ta vitrine pour les autres','#7b3fc4',ico('<path d="M3 11l9-7 9 7"/><path d="M5 10v11h14V10"/><rect x="10" y="14" width="4" height="7"/>',30)],
  ['vie','pet','Mon animal','Bonus si tu le nourris','#e08a1e',ico('<circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><path d="M7 17c0-3 2-5 5-5s5 2 5 5c0 2-2 3-5 3s-5-1-5-3z"/>',30)],
  ['vie','banque','Banque & petits boulots','Prêts, remboursements, jobs','#5a6b7a',ico('<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',30)]];
VIEWS.vie=v=>{const s=sub.vie;
  if(s){const f={ville:rVille,appart:rAppart,pet:rPet,banque:rBanque}[s];v.innerHTML=backBar('Ma vie','data-act="sub" data-k="vie" data-v="null"')+`<h2>${{ville:'Ma ville',appart:'Mon appart',pet:'Mon animal',banque:'Banque & petits boulots'}[s]}</h2><div class="section" id="mvv"></div>`;f($('#mvv'));return}
  v.innerHTML=`<h2>Ma vie</h2><p class="sub">Dépense, investis, flexe. Patrimoine : <b class="num" style="color:var(--gold)">${eur(S.worth)}</b>${S.pending>=1?` · <b class="num" style="color:var(--win)">${eur(S.pending)}</b> à encaisser`:''}</p>
  <div class="viegrid">${VIE.map(([t,s2,nm,tg,c,ic])=>`<button class="viecard" style="--tc:${c}" data-act="go" data-t="${t}" data-s="${s2}"><span class="vic">${ic}</span><b>${nm}</b><span class="note">${tg}</span></button>`).join('')}</div>`};
function rBanque(v){const t=document.createElement('div');_rProfil6(t);const hs=[...t.querySelectorAll('h3')];const start=hs.find(h=>h.textContent==='La banque'),end=hs.find(h=>h.textContent==='Réglages');
  const keep=[];let n=start;while(n&&n!==end){keep.push(n);n=n.nextElementSibling}v.innerHTML='';keep.forEach(x=>v.appendChild(x));
  api('bankInfo').then(r=>{const e=$('#bankMax');if(e)e.textContent=eur(r.max);$$('#loanBtns button').forEach(b=>b.disabled=+b.dataset.v>r.max)}).catch(()=>{})}
// Le profil ne montre plus la banque ni les boulots (déplacés dans Ma vie)
const _rProfil6=rProfil;rProfil=function(v){_rProfil6(v);const hs=[...v.querySelectorAll('h3')];const a=hs.find(h=>h.textContent==='La banque'),cr=v.querySelector('.credit');
  if(a){let n=a;while(n&&n!==cr){const nx=n.nextElementSibling;n.remove();n=nx}}
  v.insertAdjacentHTML('beforeend',`<button class="lrow2" data-act="go" data-t="vie" data-s="banque"><span>🏦 Banque & petits boulots</span><span class="note">Ouvrir ›</span></button><button class="lrow2" data-act="sub" data-k="moi" data-v="compte"><span>⚙️ Compte et réglages</span><span class="note">Ouvrir ›</span></button>`)};

/* ---------- En-tête ---------- */
$('#gift').innerHTML=ICON.gift+'<span class="dot" id="giftDot" hidden></span>';
const _updTop=updTop;updTop=function(){_updTop();if(!S)return;const b=$('#banner'),hp=(S.happyUntil||0)>now()||HAPPY>now();
  if(hp&&!(JACKPOT>now())){b.hidden=false;b.textContent='🍾 HAPPY HOUR : tous les gains sont doublés pendant encore '+Math.ceil((Math.max(S.happyUntil||0,HAPPY)-now())/60000)+' min'}};

/* ---------- Pièces qui volent vers le solde ---------- */
function flyCoins(n){if(RM)return;const t=$('#cash');if(!t)return;const r=t.getBoundingClientRect(),tx=r.left+r.width/2,ty=r.top+r.height/2;
  for(let i=0;i<n;i++){const c=document.createElement('div');c.className='flycoin';c.innerHTML=ICON.coin;const sx=innerWidth/2+rnd(-60,60),sy=innerHeight*.55+rnd(-40,40);c.style.left=sx+'px';c.style.top=sy+'px';document.body.appendChild(c);
    c.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:`translate(calc(-50% + ${rnd(-40,40)}px),calc(-50% - ${rnd(30,80)}px)) scale(1.1)`,opacity:1,offset:.35},{transform:`translate(calc(-50% + ${tx-sx}px),calc(-50% + ${ty-sy}px)) scale(.5)`,opacity:.9}],{duration:900+i*45,easing:'cubic-bezier(.5,0,.3,1)'}).onfinish=()=>c.remove()}}
const _anim=animateCash;animateCash=function(){const d=S.cash-shown;if(d>.5&&shown>0){flyCoins(Math.min(14,3+Math.floor(Math.log10(d+1)*2)));const w=$('.wallet');if(w){w.classList.remove('pulse');void w.offsetWidth;w.classList.add('pulse')}}_anim()};

/* ---------- Illustrations des jeux ---------- */
const sv=(b)=>`<svg viewBox="0 0 100 80" aria-hidden="true">${b}</svg>`;
const cardA=(x,y,r,s,rot=0,red)=>`<g transform="rotate(${rot} ${x+13} ${y+18})"><rect x="${x}" y="${y}" width="26" height="36" rx="4" fill="#fbf8f2" stroke="#d7cfc0"/><text x="${x+4}" y="${y+11}" font-size="9" font-weight="800" font-family="sans-serif" fill="${red?'#d42a3c':'#1a1a1a'}">${r}</text><text x="${x+13}" y="${y+26}" text-anchor="middle" font-size="13" fill="${red?'#d42a3c':'#1a1a1a'}">${s}</text></g>`;
const chipA=(x,y,c,r=9)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r*.68}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 2.4"/>`;
const dieA=(x,y,n,s=20,c='#fbf8f2',p='#1a1a1a')=>{const P={1:[[.5,.5]],2:[[.28,.28],[.72,.72]],3:[[.25,.25],[.5,.5],[.75,.75]],4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]],5:[[.26,.26],[.74,.26],[.5,.5],[.26,.74],[.74,.74]],6:[[.28,.22],[.72,.22],[.28,.5],[.72,.5],[.28,.78],[.72,.78]]};
  return`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s*.2}" fill="${c}"/>`+P[n].map(([a,b])=>`<circle cx="${x+a*s}" cy="${y+b*s}" r="${s*.09}" fill="${p}"/>`).join('')};
const seven=(x,y,s=1)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 0h12v3l-6 13h-4l6-12h-8z" fill="url(#gRedUI)" stroke="#5a0a14" stroke-width=".6"/>`;
const coinA=(x,y,r=10)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gGoldUI)" stroke="#7a4f0c"/><circle cx="${x}" cy="${y}" r="${r*.7}" fill="none" stroke="#9a6512" stroke-dasharray="2 1.6"/>`;
const gem=(x,y,s=1,f='url(#gCyanUI)')=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 -9L9 -2L0 10L-9 -2Z" fill="${f}" stroke="#145080" stroke-width=".8"/>`;
const GART={
  poker:sv(cardA(22,18,'A','♠',-14)+cardA(44,16,'K','♥',12,1)+chipA(20,64,'#c3343a')+chipA(78,62,'#1f8a5b')),
  bj:sv(cardA(24,16,'A','♠',-6)+cardA(46,20,'K','♥',8,1)+`<rect x="56" y="58" width="30" height="14" rx="7" fill="url(#gGoldUI)"/><text x="71" y="68.5" text-anchor="middle" font-size="9" font-weight="900" font-family="sans-serif" fill="#3a2508">21</text>`),
  crash:sv(`<path d="M6 72C40 70 64 54 80 20" fill="none" stroke="#ff4d8a" stroke-width="3.5" stroke-linecap="round"/><path d="M6 72C40 70 64 54 80 20L80 80L6 80Z" fill="#ff4d8a" opacity=".16"/><g transform="translate(80 18) rotate(-55)"><path d="M0 -7C10 -7 18 -4 22 0C18 4 10 7 0 7Z" fill="#f6efe4"/><circle cx="12" cy="0" r="3" fill="#4cc9f0"/><path d="M0 -4L-11 0L0 4Z" fill="#ffb02e"/></g>`),
  ro:sv(`<circle cx="50" cy="40" r="34" fill="#5c3a1a"/><circle cx="50" cy="40" r="31" fill="#c99a3e"/><circle cx="50" cy="40" r="28" fill="#17141a"/><circle cx="50" cy="40" r="23" fill="none" stroke="#c3343a" stroke-width="9" stroke-dasharray="3.9 3.9"/><circle cx="50" cy="40" r="15" fill="#3a2212"/><path d="M50 28v24M38 40h24" stroke="#d8b25a" stroke-width="2.5"/><circle cx="50" cy="40" r="3.5" fill="#f0c96f"/><circle cx="68" cy="22" r="3" fill="#fff"/>`),
  sl:sv(`<rect x="10" y="8" width="80" height="64" rx="10" fill="url(#gGoldUI)"/><rect x="16" y="18" width="68" height="40" rx="5" fill="#2a1508"/>${[20,42,64].map(x=>`<rect x="${x}" y="21" width="16" height="34" rx="3" fill="#fff8e8"/>`).join('')}${seven(22,30)+seven(44,30)+seven(66,30)}<circle cx="18" cy="13" r="2" fill="#fff4c9"/><circle cx="50" cy="13" r="2" fill="#fff4c9"/><circle cx="82" cy="13" r="2" fill="#fff4c9"/>`),
  gold:sv(`<rect x="6" y="10" width="88" height="60" rx="10" fill="url(#gGoldUI)"/><rect x="11" y="18" width="78" height="44" rx="5" fill="#2a1508"/>${[14,29,44,59,74].map(x=>`<rect x="${x}" y="21" width="13" height="38" rx="2.5" fill="#fff8e8"/>`).join('')}${seven(15,32,.9)+seven(30,32,.9)+seven(45,32,.9)}${gem(65.5,40,.6)+gem(80.5,40,.6)}<path d="M50 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="#fff4c9"/>`),
  mega:sv(`<rect x="8" y="8" width="84" height="64" rx="10" fill="#ff5fb2"/><rect x="13" y="14" width="74" height="52" rx="6" fill="#3a0f2a"/>${[[22,26,'#ffb02e'],[40,24,'#5fd39a'],[58,28,'#4cc9f0'],[76,24,'#ff4d6d'],[30,48,'#a35cf0'],[50,50,'#ffe14a'],[70,48,'#ff7a6b']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x-2}" cy="${y-2}" r="2" fill="#fff" opacity=".6"/>`).join('')}`),
  mines:sv(`${[0,1,2].flatMap(r=>[0,1,2].map(c=>`<rect x="${20+c*21}" y="${4+r*25}" width="18" height="22" rx="4" fill="${(r+c)%3===1?'#24183d':'#4b3a78'}"/>`)).join('')}${gem(50,40,.9)}${gem(29,65,.8)}<circle cx="71" cy="66" r="7" fill="#111"/><path d="M75 60l3-4" stroke="#c9a46a" stroke-width="1.5"/><circle cx="79" cy="55" r="2.2" fill="#ffb02e"/>`),
  plinko:sv(`${[[50,8]].concat([[42,18],[58,18],[34,28],[50,28],[66,28],[26,38],[42,38],[58,38],[74,38],[18,48],[34,48],[50,48],[66,48],[82,48]]).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="#f6efe4" opacity=".85"/>`).join('')}<circle cx="54" cy="22" r="5" fill="#ff5fb2"/>${['#ff4d5e','#ffb02e','#39d98a','#ffb02e','#ff4d5e'].map((c,i)=>`<rect x="${11+i*16}" y="60" width="14" height="10" rx="3" fill="${c}"/>`).join('')}`),
  hilo:sv(cardA(18,18,'7','♦',-8,1)+cardA(56,18,'?','♠',8)+`<path d="M48 20l-5 8h10zM48 62l-5-8h10z" fill="#f2c14e"/>`),
  d421:sv(dieA(14,30,4,24)+dieA(40,22,2,24)+dieA(66,32,1,24)),
  duel:sv(coinA(38,40,22)+`<path d="M33 31h10M33 40h8M33 31v18" stroke="#5c3a06" stroke-width="3.5" stroke-linecap="round"/>`+coinA(74,50,13)),
  gratte:sv(`<rect x="12" y="10" width="76" height="60" rx="8" fill="#b8902e"/><rect x="18" y="18" width="64" height="44" rx="5" fill="#d9d2c7"/><path d="M22 40C34 30 44 50 56 36C64 28 72 40 78 34" stroke="#b8902e" stroke-width="7" stroke-linecap="round" fill="none"/>${coinA(70,58,8)}`),
  bonneteau:sv(`${[22,50,78].map((x,i)=>`<path d="M${x-12} 62L${x-8} 26H${x+8}L${x+12} 62Z" fill="${i===1?'#c3343a':'#a14e2a'}"/><rect x="${x-13}" y="60" width="26" height="5" rx="2" fill="#7a2f15"/>`).join('')}<circle cx="50" cy="72" r="5" fill="#f6efe4"/>`),
  pince:sv(`<rect x="14" y="6" width="72" height="68" rx="8" fill="#1d3a5a" stroke="#3e8fd0" stroke-width="2"/><path d="M50 6v24" stroke="#c8d6e2" stroke-width="2"/><path d="M42 30h16l-4 10M42 30l4 10" stroke="#f2c14e" stroke-width="3" fill="none"/>${gem(34,62,.9)}${coinA(66,62,8)}`),
  tourney:sv(`<path d="M34 12h32v18a16 16 0 0 1-32 0z" fill="url(#gGoldUI)"/><path d="M34 16H24a10 10 0 0 0 12 14M66 16h10a10 10 0 0 1-12 14" fill="none" stroke="#f2c14e" stroke-width="3.5"/><rect x="46" y="44" width="8" height="12" fill="#c48a1c"/><rect x="36" y="56" width="28" height="9" rx="2" fill="url(#gGoldUI)"/>`),
  heist:sv(`<rect x="22" y="22" width="56" height="44" rx="6" fill="#5a6b7a" stroke="#c8d6e2" stroke-width="2"/><circle cx="50" cy="44" r="12" fill="#3a4652" stroke="#f2c14e" stroke-width="2.5"/><path d="M50 32v4M50 52v4M38 44h4M58 44h4" stroke="#f2c14e" stroke-width="2.5"/><path d="M34 22v-8h32v8" stroke="#c8d6e2" stroke-width="3" fill="none"/>`),
  chicken:sv(`<rect x="0" y="0" width="100" height="80" fill="#2a2a32"/>${[25,50,75].map(x=>`<path d="M${x} 0V80" stroke="#f6efe4" stroke-width="2" stroke-dasharray="8 6" opacity=".5"/>`).join('')}<ellipse cx="34" cy="48" rx="13" ry="12" fill="#fff"/><circle cx="42" cy="40" r="7" fill="#fff"/><path d="M48 40l5 2-5 2z" fill="#ffb02e"/><path d="M40 33l2-5 3 5z" fill="#e5353b"/><circle cx="44" cy="39" r="1.3" fill="#111"/><rect x="62" y="8" width="18" height="30" rx="5" fill="#ff4d5e"/>`),
  pen:sv(`<rect x="10" y="10" width="80" height="44" fill="none" stroke="#f6efe4" stroke-width="3"/><path d="M10 10l8 8h64l8-8M18 18v36M82 18v36" stroke="#f6efe4" stroke-width="1" opacity=".4"/><circle cx="34" cy="34" r="7" fill="#fff"/><path d="M30 32l4-3 4 3-1.5 4h-5z" fill="#111"/><path d="M60 34h12M66 28v20" stroke="#ffb02e" stroke-width="5" stroke-linecap="round"/><circle cx="66" cy="24" r="4" fill="#ffd0a0"/>`),
  sicbo:sv(dieA(16,28,6,22,'#c3343a','#fff')+dieA(39,20,5,22,'#c3343a','#fff')+dieA(62,30,3,22,'#c3343a','#fff')),
  holdem:sv(cardA(14,22,'A','♦',-10,1)+cardA(38,18,'A','♣')+cardA(62,22,'K','♦',10,1)),
  craps:sv(`<rect x="4" y="4" width="92" height="72" rx="10" fill="#3d2470"/>`+dieA(24,24,5,26)+dieA(54,34,2,26)),
  vp:sv(`<rect x="6" y="14" width="88" height="52" rx="6" fill="#0d1b3a" stroke="#2d6cdf" stroke-width="2"/>`+[10,27,44,61,78].map((x,i)=>`<rect x="${x}" y="22" width="14" height="20" rx="2" fill="#fbf8f2"/><text x="${x+7}" y="36" text-anchor="middle" font-size="9" font-weight="800" font-family="sans-serif" fill="${i%2?'#d42a3c':'#111'}">${['10','J','Q','K','A'][i]}</text>`).join('')+`<rect x="30" y="50" width="40" height="9" rx="3" fill="#f2c14e"/>`),
  bac:sv(`<rect x="4" y="10" width="44" height="60" rx="8" fill="#1d3a5a"/><rect x="52" y="10" width="44" height="60" rx="8" fill="#5a1d24"/>`+cardA(13,22,'9','♥',0,1)+cardA(61,22,'8','♠')),
  wheel:sv(`<circle cx="50" cy="42" r="32" fill="#ff5fb2"/>${Array.from({length:12},(_,i)=>`<path d="M50 42L${50+32*Math.cos(i*Math.PI/6)} ${42+32*Math.sin(i*Math.PI/6)}A32 32 0 0 1 ${50+32*Math.cos((i+1)*Math.PI/6)} ${42+32*Math.sin((i+1)*Math.PI/6)}Z" fill="${['#ffb02e','#2d6cdf','#39d98a','#a35cf0'][i%4]}"/>`).join('')}<circle cx="50" cy="42" r="7" fill="url(#gGoldUI)"/><path d="M50 4l-5 8h10z" fill="#fff"/>`),
  tower:sv(`<rect x="28" y="64" width="44" height="10" rx="2" fill="#7a4f0c"/><rect x="31" y="52" width="38" height="10" rx="2" fill="#9a6512"/><rect x="34" y="40" width="32" height="10" rx="2" fill="#c48a1c"/><rect x="37" y="28" width="26" height="10" rx="2" fill="#e0a838"/><rect x="40" y="16" width="20" height="10" rx="2" fill="url(#gGoldUI)"/><path d="M50 3l3 6 6 1-4 4h-10l-4-4 6-1z" fill="#fff4c9"/>`),
  keno:sv([0,1,2,3].flatMap(r=>[0,1,2,3,4].map(c=>`<circle cx="${18+c*16}" cy="${14+r*17}" r="6.5" fill="${[2,7,13,16].includes(r*5+c)?'#f2c14e':'#3d2470'}"/>`)).join('')),
  dice:sv(`<rect x="8" y="50" width="84" height="8" rx="4" fill="#2e2236"/><rect x="8" y="50" width="48" height="8" rx="4" fill="#39d98a"/><circle cx="56" cy="54" r="7" fill="#f6efe4"/>`+dieA(34,14,6,26,'#39d98a','#0d2a1d')),
  limbo:sv(`<circle cx="50" cy="40" r="30" fill="none" stroke="#e08a1e" stroke-width="4" stroke-dasharray="6 5"/><circle cx="50" cy="40" r="20" fill="none" stroke="#ffb02e" stroke-width="3"/><text x="50" y="46" text-anchor="middle" font-size="16" font-weight="900" font-family="sans-serif" fill="#fff6c2">×10</text>`)};
function gameArt(g){return GART[g.id]||`<span class="eart">${g.ic}</span>`}

/* ---------- Lobby du casino ---------- */
const LIVE_IDS=['crash','ro','wshow'];
const CAT6=[['all','Tout'],['machines','Machines'],['cartes','Cartes'],['table','Tables'],['instant','Instantanés'],['special','Spécial'],['paris','Paris']];
const _vcas6=VIEWS.casino;
VIEWS.casino=v=>{if(sub.casino||banned())return _vcas6(v);const L=LV();
  const tile=(x,big)=>{const lk=x.lv&&L<x.lv;return`<button class="gtile ${big?'big':''}" style="--tc:${x.c}" data-act="${lk?'locked':'sub'}" data-k="casino" data-v="${x.id}">
    <span class="art">${gameArt(x)}</span>${lk?`<span class="lockb">🔒 Niv. ${x.lv}</span>`:x.nw?'<span class="new">NOUVEAU</span>':''}${x.b==='live'?'<span class="livebadge">EN DIRECT</span>':x.b==='multi'?'<span class="multibadge">À PLUSIEURS</span>':''}
    <span class="gtx"><b>${x.nm}</b><span class="tg">${x.tg}</span></span></button>`};
  const list=GAMES.filter(x=>LCAT==='all'||x.cat===LCAT),live=LCAT==='all'?GAMES.filter(x=>LIVE_IDS.includes(x.id)):[],rest=list.filter(x=>!live.includes(x));
  const r=D.seeded('horo'+dkey()),lg=GAMES.find(g=>g.id===D.luckyGame(dkey()))||GAMES[0];
  v.innerHTML=`<section class="jhero"><div class="jtx"><span class="k">JACKPOT COMMUN</span><b class="num" data-jk>${eur(JACKPOT_G)}</b><span class="note">Chaque mise le fait grimper. Un seul joueur le rafle.</span>
      <button class="btn gold sm" data-act="sub" data-k="casino" data-v="gold">Tenter ma chance</button></div><span class="jart" aria-hidden="true">${JART}</span></section>
    <div class="lucky"><span>🔮</span><span><b>Jeu chanceux du jour :</b> <button class="linkbtn" data-act="go" data-t="casino" data-s="${lg.id}">${lg.nm}</button> (+10 %) · <span class="note">${D.HORO[r()*D.HORO.length|0]}</span></span></div>
    <div class="cats">${CAT6.map(([k,l])=>`<button data-act="lcat" data-v="${k}" class="${LCAT===k?'on':''}">${l}</button>`).join('')}</div>
    ${LCAT==='paris'?`<div class="lobby6">${[['sport','Paris sportifs','Les matchs en direct','#1f8a5b','⚽'],['race','Courses','Une course toutes les 40 s','#e08a1e','🏇'],['loto','Loto du soir','Tirage à 20 h','#7b3fc4','🎱']].map(([s2,nm,tg,c,ic])=>`<button class="gtile" style="--tc:${c}" data-act="go" data-t="paris" data-s="${s2}"><span class="art"><span class="eart">${ic}</span></span><span class="gtx"><b>${nm}</b><span class="tg">${tg}</span></span></button>`).join('')}</div>`
    :`${live.length?`<h3 class="h6"><span class="livedot"></span>En direct · ${ONLINE.length} en ligne</h3><div class="lobby6 two">${live.map(x=>tile(x,1)).join('')}</div>`:''}
    <h3 class="h6">${LCAT==='all'?'Tous les jeux':CAT6.find(c=>c[0]===LCAT)[1]} · ${rest.length}</h3><div class="lobby6">${rest.map(x=>tile(x)).join('')}</div>
    ${LCAT==='all'?`<button class="lrow2" data-act="lcat" data-v="paris" style="margin-top:12px"><span>⚽ Paris sportifs, courses et loto</span><span class="note">Ouvrir ›</span></button>`:''}`}`};
const JART=`<svg viewBox="0 0 132 132" width="118" height="118"><ellipse cx="70" cy="118" rx="54" ry="8" fill="#000" opacity=".35"/>${[96,80,64].map(y=>`<ellipse cx="52" cy="${y+12}" rx="30" ry="9" fill="#9a6512"/><rect x="22" y="${y}" width="60" height="12" fill="url(#gGoldUI)"/><ellipse cx="52" cy="${y}" rx="30" ry="9" fill="#ffe39a"/>`).join('')}<ellipse cx="96" cy="108" rx="26" ry="8" fill="#9a6512"/><rect x="70" y="98" width="52" height="10" fill="url(#gGoldUI)"/><ellipse cx="96" cy="98" rx="26" ry="8" fill="#ffe39a"/><circle cx="88" cy="40" r="26" fill="url(#gGoldUI)" stroke="#7a4f0c" stroke-width="2"/><circle cx="88" cy="40" r="19" fill="none" stroke="#9a6512" stroke-width="2" stroke-dasharray="4 3"/><path d="M82 29h12M82 39h10M82 29v22" stroke="#5c3a06" fill="none" stroke-width="4" stroke-linecap="round"/><path class="spark" d="M112 16l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#fff4c9"/></svg>`;
