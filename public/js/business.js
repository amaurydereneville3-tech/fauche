/* ====================== Business ====================== */
VIEWS.marches=v=>{v.innerHTML=`<h2>Business</h2><p class="sub">${sub.marches==='bourse'?'Les mêmes cours pour tous les joueurs, en direct. Levier jusqu\'à ×100 : attention à la liquidation.':sub.marches==='biz'?'Rachète des entreprises : elles te rapportent de l\'argent chaque heure, même hors ligne.':'Des objets uniques en vente pendant 2 minutes, contre les autres joueurs.'}</p>
  ${segHTML('marches',[['bourse','📈 Bourse'],['biz','🏪 Entreprises'],['auc','🔨 Enchères']])}<div id="mv" class="section" style="margin-top:12px"></div>`;({bourse:rBourse,biz:rBiz,auc:rAuc})[sub.marches]($('#mv'))};

/* ---------- Bourse ---------- */
let PR={},HI={},MK={sel:'BTC',lev:10},MO=null;
const fmtP=p=>p<1?p.toFixed(4).replace('.',','):p<100?p.toFixed(2).replace('.',','):fr.format(p);
const chg=id=>PR[id]?(PR[id].p/PR[id].open-1)*100:0;
const posVal=p=>{const px=PR[p.a]?PR[p.a].p:p.entry;return Math.max(0,p.margin+p.margin*p.lev*p.side*(px/p.entry-1))};
function rBourse(v){const a=D.ASSETS.find(x=>x.id===MK.sel);
  v.innerHTML=`<div class="mo"><div style="display:flex;justify-content:space-between;align-items:center"><b>Monte ou descend ?</b><span class="note">Bitcoin · 10 s · ×1,9</span></div><div class="p" id="moP">…</div><div id="moZone"></div></div>
   <div class="list">${D.ASSETS.map(x=>`<button class="asset ${x.id===MK.sel?'on':''}" data-act="asel" data-v="${x.id}"><span><span class="nm">${x.nm}</span><br><span class="tk">${x.id} · ${x.t}</span></span><canvas class="spark" data-spark="${x.id}"></canvas><span><span class="pr" data-pr="${x.id}">…</span><br><span class="ch" data-ch="${x.id}"></span></span></button>`).join('')}</div>
   <div class="trade"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${a.nm}</b><span class="num" data-pr="${a.id}">…</span></div><canvas class="bigchart" id="bigc"></canvas>
     <div class="seg">${[1,10,100].map(l=>`<button data-act="lev" data-v="${l}" class="${MK.lev===l?'on':''}">Levier ×${l}</button>`).join('')}</div>${stakeUI('mk')}
     <div class="row2"><button class="btn gold" data-act="mkopen" data-v="1">▲ Acheter</button><button class="btn" data-act="mkopen" data-v="-1" style="border-color:#5e2026;color:var(--lose)">▼ Parier sur la baisse</button></div>
     <p class="note">Avec ×${MK.lev}, une variation de ${100/MK.lev} % contre toi efface ta mise.</p></div><h3>Mes positions</h3><div class="list" id="posList"></div>`;
  api('mkJoin').then(r=>{PR=r.p;HI=r.h;updMk()}).catch(()=>{});onLeave(()=>quiet(api('mkLeave')));renderMO();updMk()}
on('mk',d=>{PR=d.p;Object.keys(PR).forEach(k=>{(HI[k]=HI[k]||[]).push(PR[k].p);if(HI[k].length>80)HI[k].shift()});if(tab==='marches'&&sub.marches==='bourse')updMk()});
function renderMO(){const z=$('#moZone');if(!z)return;if(MO)z.innerHTML=`<div class="note">Tu as parié ${MO.dir>0?'▲ sur la hausse':'▼ sur la baisse'} à ${fmtP(MO.entry)} € · <b data-secs="${MO.end}">${secs(MO.end)}</b> s</div>${timerBar(MO.end,10000)}`;
  else z.innerHTML=stakeUI('mo')+`<div class="row2"><button class="btn gold" data-act="mo" data-v="1">▲ Monte</button><button class="btn" data-act="mo" data-v="-1">▼ Descend</button></div>`}
ACT.mo=async el=>{if(MO||!canBet(ST.mo))return;try{const r=await api('moBet',{amt:ST.mo,dir:+el.dataset.v});MO={...r,end:now()+10000};renderMO()}catch(e){}};
on('moRes',d=>{MO=null;if(d.payout>d.amt){toast('Bien vu ! +'+eur(d.payout-d.amt));burst(14);snd('win')}else if(d.payout)toast('Prix identique, mise rendue.');else toast('Raté. −'+eur(d.amt));if(tab==='marches'&&sub.marches==='bourse')renderMO()});
ACT.asel=el=>{MK.sel=el.dataset.v;render()};
ACT.lev=el=>{MK.lev=+el.dataset.v;render()};
ACT.mkopen=async el=>{if(!canBet(ST.mk))return;try{await api('mkOpen',{a:MK.sel,lev:MK.lev,side:+el.dataset.v,amt:ST.mk});toast((+el.dataset.v>0?'Achat ':'Vente à découvert ')+MK.sel+' ×'+MK.lev+' : '+eur(ST.mk));snd('chip')}catch(e){}};
ACT.mkclose=async el=>{try{const r=await api('mkClose',{id:+el.dataset.v});toast('Position fermée : '+(r.pnl>=0?'+':'')+eur(r.pnl));if(r.pnl>0)burst(12)}catch(e){}};
function drawLine(c,data,col,fill){if(!c||!data||data.length<2)return;const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(!w)return;if(c.width!==w*dpr){c.width=w*dpr;c.height=h*dpr}
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);const mn=Math.min(...data),mx=Math.max(...data),rg=mx-mn||1;const X=i=>i/(data.length-1)*(w-4)+2,Y=v=>h-4-(v-mn)/rg*(h-8);
  if(fill){g.strokeStyle='rgba(169,152,171,.15)';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.moveTo(0,h*k/4);g.lineTo(w,h*k/4);g.stroke()}}
  g.beginPath();data.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.strokeStyle=col;g.lineWidth=fill?2:1.5;g.lineJoin='round';g.stroke();
  if(fill){g.lineTo(X(data.length-1),h);g.lineTo(X(0),h);g.closePath();const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,col+'55');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fill();g.beginPath();g.arc(X(data.length-1),Y(data[data.length-1]),3.5,0,Math.PI*2);g.fillStyle=col;g.fill()}}
function updMk(){if(!PR.BTC)return;D.ASSETS.forEach(a=>{const c=chg(a.id),col=c>=0?'#5fd39a':'#ff7a6b';$$(`[data-pr="${a.id}"]`).forEach(e=>e.textContent=fmtP(PR[a.id].p)+' €');
    const ch=document.querySelector(`[data-ch="${a.id}"]`);if(ch){ch.textContent=(c>=0?'+':'')+c.toFixed(2).replace('.',',')+' %';ch.className='ch '+(c>=0?'upc':'dnc')}drawLine(document.querySelector(`[data-spark="${a.id}"]`),(HI[a.id]||[]).slice(-40),col,false)});
  drawLine($('#bigc'),HI[MK.sel],chg(MK.sel)>=0?'#5fd39a':'#ff7a6b',true);const mp=$('#moP');if(mp){mp.textContent=fmtP(PR.BTC.p)+' €';mp.className='p '+(MO?(PR.BTC.p>MO.entry?'upc':PR.BTC.p<MO.entry?'dnc':''):'')}
  const pl=$('#posList');if(pl)pl.innerHTML=S.pos.length?S.pos.map(p=>{const val=posVal(p),pnl=val-p.margin,pct=pnl/p.margin*100;
    return`<div class="lrow2"><span style="min-width:0"><b>${p.side>0?'▲':'▼'} ${p.a} ×${p.lev}</b><br><small class="note">Mise ${eur(p.margin)} · entrée ${fmtP(p.entry)} €</small></span><span style="display:flex;gap:8px;align-items:center"><b class="num ${pnl>=0?'upc':'dnc'}">${pnl>=0?'+':''}${eur(pnl)}<br><small>${pct>=0?'+':''}${pct.toFixed(0)} %</small></b><button class="btn sm" data-act="mkclose" data-v="${p.id}">Fermer</button></span></div>`}).join(''):'<div class="empty">Aucune position. Achète ou parie sur la baisse au-dessus.</div>'}

/* ---------- Entreprises ---------- */
function rBiz(v){const inc=S.income;const base=S.pending,t0=performance.now();
  v.innerHTML=`<div class="income"><div style="display:flex;justify-content:space-between"><span class="note">À encaisser</span><span class="note">${eur(inc)} / heure</span></div><div class="big" id="pend">${eur(base)}</div><p class="note">Le coffre se remplit pendant 8 h maximum.</p><button class="btn gold" data-act="collect" ${base<1&&inc<=0?'disabled':''}>Encaisser</button></div>
  ${D.BIZ.map(b=>{const own=S.biz.includes(b.id);return`<div class="biz ${own?'own':''}"><span class="ic" aria-hidden="true">${b.ic}</span><b class="nm">${b.nm}</b>${own?`<button class="btn sm" data-act="bizup" data-v="${b.id}" ${(S.bizLv[b.id]||1)>=5||S.cash<D.bizUpCost(b,S.bizLv[b.id])?'disabled':''}>${(S.bizLv[b.id]||1)>=5?'Niv. max':'Niv. '+(S.bizLv[b.id]||1)+' → '+((S.bizLv[b.id]||1)+1)+' · '+eur(D.bizUpCost(b,S.bizLv[b.id]))}</button>`:`<button class="btn gold sm" data-act="bizbuy" data-v="${b.id}" ${S.cash<b.pr?'disabled':''}>${eur(b.pr)}</button>`}<span class="note">Rapporte ${eur(D.bizInc(b,S.bizLv[b.id]))} / heure${own?'':' · rentable en '+Math.round(b.pr/b.inc)+' h'}</span></div>`}).join('')}
  <h3>Loyers de ton immobilier</h3>${D.SHOP.filter(x=>x.rent).map(x=>`<div class="lrow2"><span>${x.ic} ${x.nm}</span><span class="num ${S.items.includes(x.id)?'upc':''}">${S.items.includes(x.id)?'+':''}${eur(x.rent)} / h</span></div>`).join('')}<p class="note">Achète les biens immobiliers dans la Boutique : ils te versent un loyer.</p>`;
  const iv=setInterval(()=>{const e=$('#pend');if(!e){clearInterval(iv);return}const capH=8,el=(now()-S.lastCollect)/3600000;e.textContent=eur(Math.floor(Math.min(capH,el)*inc))},1000);onLeave(()=>clearInterval(iv))}
ACT.collect=async()=>{try{const r=await api('collect');toast('Encaissé : +'+eur(r.p));burst(16);needRender()}catch(e){}};
ACT.bizbuy=async el=>{try{await api('bizBuy',{id:el.dataset.v});burst(20);snd('big');needRender()}catch(e){}};

/* ---------- Enchères ---------- */
let AU=null;
function rAuc(v){v.innerHTML='<div id="aucW" class="section"></div>';api('aucJoin').then(r=>{AU=r.a;aucUI()}).catch(()=>{});onLeave(()=>quiet(api('aucLeave')));aucUI()}
on('auc',a=>{const prev=AU;AU=a;if(a&&prev&&a.log[0]&&(!prev.log[0]||prev.log[0].v!==a.log[0].v))snd('tick');if(tab==='marches'&&sub.marches==='auc')aucUI()});
function aucUI(){const w=$('#aucW');if(!w)return;const A=AU;if(!A){w.innerHTML='<div class="empty">Prochaine vente dans un instant…</div>';return}const it=D.SPECIAL[A.id],mine=A.uid===S.id,nb=Math.round(A.top*1.1/100)*100;
  w.innerHTML=`<div class="auction"><span class="ic" aria-hidden="true">${it.ic}</span><b style="font-size:17px">${it.nm}</b><span class="note">Valeur estimée ${eur(it.pr)} · objet unique de collection</span>
    <div><span class="note">Enchère actuelle</span><div class="top">${eur(A.top)}</div><span class="note">${mine?'Tu es en tête !':esc(A.leader)}</span></div>
    ${A.done?'':timerBar(A.end,120000)}<b class="num">${A.done?'Terminé':'<span data-secs="'+A.end+'">'+secs(A.end)+'</span> s'}</b>
    ${A.done?`<div class="msg ${mine?'win':''}">${mine?'Adjugé, c\'est à toi !':'Vendu à '+esc(A.leader)}</div>`:`<button class="btn gold big" data-act="bid" ${mine||S.cash<nb?'disabled':''}>${mine?'Tu es en tête':'Enchérir '+eur(nb)}</button>`}</div>
  <div class="bidlog">${A.log.map(x=>`<div>${x.who===S.pseudo?'<b>Toi</b>':esc(x.who)} · <span class="num">${eur(x.v)}</span></div>`).join('')}</div>
  <p class="note">Ton argent est bloqué tant que tu es en tête. Si quelqu'un surenchérit, il t'est rendu. Une offre dans les 10 dernières secondes prolonge la vente.</p>`}
ACT.bid=async()=>{try{await api('bid');snd('chip')}catch(e){}};
