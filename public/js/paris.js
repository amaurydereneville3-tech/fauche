/* ====================== Paris ====================== */
VIEWS.paris=v=>{v.innerHTML=`<h2>Paris</h2><p class="sub">${sub.paris==='sport'?'Les mêmes matchs pour tout le monde, joués en direct. Parie avant le coup d\'envoi.':sub.paris==='race'?'Une course toutes les 40 secondes environ, pour tous les joueurs.':'Un tirage chaque soir à 20 h pour tout le monde. Coche 5 numéros sur 30.'}</p>
  ${segHTML('paris',[['sport','⚽ Sport'],['race','🏁 Courses'],['loto','🎱 Loto du soir']])}<div id="pv" class="section" style="margin-top:12px"></div>`;
  ({sport:rSport,race:rRace,loto:rLoto})[sub.paris]($('#pv'))};

/* ---------- Sport en direct ---------- */
let SP={matches:[]},SLIP=new Map();
function rSport(v){v.innerHTML=`<div id="spList" class="section"></div><h3>Mes tickets</h3><div class="list" id="spTickets"></div>`;
  api('sportJoin').then(r=>{SP=r;spUI()}).catch(()=>{});onLeave(()=>quiet(api('sportLeave')));spUI()}
on('sport',d=>{SP=d;if(tab==='paris'&&sub.paris==='sport')spUI()});
function mm(ms){const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function spUI(){const L=$('#spList');if(!L)return;
  L.innerHTML=SP.matches.map(m=>{const up=m.state==='up',live=m.state==='live';[...SLIP.keys()].forEach(id=>{const x=SP.matches.find(y=>y.id===id);if(!x||x.state!=='up')SLIP.delete(id)});
    return`<div class="match"><div class="head"><span>${m.sp}</span><span>${up?`Coup d'envoi dans <b class="num" data-kick="${m.kick}">${mm(m.kick-now())}</b>`:live?`<span class="livebadge" style="position:static">${m.min}'</span>`:'Terminé'}</span></div>
    <div class="teams">${esc(m.h)} <span class="num" style="color:${live?'var(--gold)':'var(--muted)'}">${up?'vs':m.score.join(' - ')}</span> ${esc(m.a)}</div>
    ${up?`<div class="odds">${m.odds.map((o,k)=>`<button data-act="odd" data-m="${m.id}" data-k="${k}" class="${SLIP.get(m.id)===k?'on':''}"><small>${esc(m.lbl[k])}</small><b>${o.toFixed(2).replace('.',',')}</b></button>`).join('')}</div>`:''}</div>`}).join('');
  const t=$('#spTickets');if(t)t.innerHTML=(S.slips||[]).length?S.slips.map(s=>`<div class="lrow2"><span style="min-width:0"><b>${s.sels.length>1?'Combiné':'Simple'} · ${eur(s.amt)} à ${String(s.odds).replace('.',',')}</b><br><small class="note">${s.sels.map(x=>esc(x.label)+' ('+esc(x.match)+')').join(' · ')}</small></span><span class="tag ${s.res==='lose'?'bad':''}">${!s.done?'En cours':s.res==='win'?'+'+eur(s.payout-s.amt):s.res==='refund'?'Remboursé':'Perdu'}</span></div>`).join(''):'<div class="empty">Aucun ticket pour l\'instant.</div>';renderSlip()}
setInterval(()=>$$('[data-kick]').forEach(e=>e.textContent=mm(+e.dataset.kick-now())),1000);
function slipOdds(){let o=1;SLIP.forEach((k,id)=>{const m=SP.matches.find(x=>x.id===id);if(m)o*=m.odds[k]});return o}
function renderSlip(){const s=$('#slip');if(tab!=='paris'||sub.paris!=='sport'||!SLIP.size){s.innerHTML='';return}
  s.innerHTML=`<div class="slipbar"><div class="in"><span>${SLIP.size} sélection${SLIP.size>1?'s':''} · cote <span class="num">${slipOdds().toFixed(2).replace('.',',')}</span></span><button class="btn" data-act="slipopen">Mon ticket</button></div></div>`}
ACT.odd=el=>{const id=+el.dataset.m,k=+el.dataset.k;if(SLIP.get(id)===k)SLIP.delete(id);else SLIP.set(id,k);snd('tick');spUI()};
ACT.slipopen=()=>{stakeHook.pa=()=>{const e=$('#gainPot');if(e)e.textContent=eur(ST.pa*slipOdds())};
  const rows=[...SLIP].map(([id,k])=>{const m=SP.matches.find(x=>x.id===id);return`<div class="lrow2"><span style="text-align:left;min-width:0"><b>${esc(m.lbl[k])}</b><br><small class="note">${esc(m.h)} – ${esc(m.a)}</small></span><span style="display:flex;gap:8px;align-items:center"><b class="num">${m.odds[k].toFixed(2).replace('.',',')}</b><button class="btn sm" data-act="slipdel" data-m="${id}" aria-label="Retirer">✕</button></span></div>`}).join('');
  modal(`<p class="mt">${SLIP.size>1?'Combiné':'Pari simple'}</p><div class="list">${rows}</div>${stakeUI('pa')}
  <div class="lrow2"><span>Cote <b class="num">${slipOdds().toFixed(2).replace('.',',')}</b></span><span>Gain possible <b class="num" id="gainPot" style="color:var(--gold)">${eur(ST.pa*slipOdds())}</b></span></div>
  <div class="row2"><button class="btn" data-close>Fermer</button><button class="btn gold" data-act="slipgo">Valider le pari</button></div><p class="note">Résultat à la fin des matchs, en direct pour tout le monde.</p>`)};
ACT.slipdel=el=>{SLIP.delete(+el.dataset.m);closeModal();spUI();if(SLIP.size)ACT.slipopen()};
ACT.slipgo=async()=>{if(!canBet(ST.pa))return;try{await api('sportBet',{sels:[...SLIP],amt:ST.pa});SLIP.clear();closeModal();toast('Pari validé, bonne chance !');snd('chip');spUI()}catch(e){}};

/* ---------- Loto du soir ---------- */
let LO={sel:[],next:''};
function rLoto(v){const L=S.loto;let top='';
  if(L&&!L.res)top=`<div class="box center"><b>Ton ticket pour le tirage du ${L.date.split('-').reverse().slice(0,2).join('/')} à 20 h</b><div class="lballs">${L.nums.map(n=>`<span class="lball">${n}</span>`).join('')}</div><p class="note">Si tu es en ligne à 20 h, tu verras le tirage en direct. Sinon, le résultat t'attend ici.</p></div>`;
  else if(L&&L.res&&!L.seen)top=`<div class="box center"><b>Le tirage a eu lieu !</b><button class="btn gold big" data-act="lodraw">Voir le résultat</button></div>`;
  const canBuy=!L||L.res;
  v.innerHTML=top+(canBuy?`<div class="box"><div style="display:flex;justify-content:space-between"><b>Coche 5 numéros</b><span class="num">${LO.sel.length}/5</span></div>
    <div class="lgrid">${Array.from({length:30},(_,i)=>i+1).map(n=>`<button data-act="losel" data-v="${n}" class="${LO.sel.includes(n)?'on':''}">${n}</button>`).join('')}</div>
    <div class="row2"><button class="btn" data-act="lorand">Au hasard</button><button class="btn gold" data-act="lobuy" ${LO.sel.length===5?'':'disabled'}>Valider · ${eur(D.LOTO_PRICE)}</button></div></div>`:'')+
  `<div class="list">${Object.entries(D.LOTO_GAIN).reverse().map(([k,g])=>`<div class="lrow2"><span>${k} bons numéros</span><b class="num" style="color:var(--gold)">${eur(g)}</b></div>`).join('')}</div>`}
ACT.losel=el=>{const n=+el.dataset.v;if(LO.sel.includes(n))LO.sel=LO.sel.filter(x=>x!==n);else if(LO.sel.length<5)LO.sel.push(n);snd('tick');render()};
ACT.lorand=()=>{LO.sel=shuffle([...Array(30).keys()].map(i=>i+1)).slice(0,5);render()};
ACT.lobuy=async()=>{try{const r=await api('lotoBuy',{nums:LO.sel});LO.sel=[];toast('Ticket validé pour le tirage de 20 h !');snd('chip');needRender()}catch(e){}};
async function lotoShow(nums,mine){modal(`<p class="mt">Tirage du loto</p><div class="lballs" id="ldr"></div>${mine?`<p class="note">Ton ticket : ${mine.join(' · ')}</p>`:''}<div class="msg" id="lres"></div><div id="lbtn"></div>`);
  for(const n of nums){await sleep(T(1100));const hit=mine&&mine.includes(n);const d=$('#ldr');if(!d)return;d.insertAdjacentHTML('beforeend',`<span class="lball ${hit?'hit':''}">${n}</span>`);snd(hit?'coin':'pop')}
  if(mine){const k=mine.filter(n=>nums.includes(n)).length,g=D.LOTO_GAIN[k]||0;$('#lres').textContent=k+' bon'+(k>1?'s':'')+' numéro'+(k>1?'s':'')+(g?' : tu gagnes '+eur(g)+' !':'. Pas de gain cette fois.');$('#lres').className='msg '+(g?'win':'');if(g)burst(g>=5000?40:16)}
  $('#lbtn').innerHTML='<button class="btn gold big" data-act="mclose">Continuer</button>';quiet(api('lotoSeen'))}
ACT.lodraw=()=>{const L=S.loto;if(L&&L.res)lotoShow(L.res.nums,L.nums)};
on('lotoDraw',d=>{const mine=S.loto&&S.loto.date===d.date?S.loto.nums:null;whenFree(()=>notif('🎱','Loto du soir','Le tirage commence ! Touche pour le regarder',()=>lotoShow(d.nums,mine)))});
