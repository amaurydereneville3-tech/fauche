/* ====================== V6 : nouveaux jeux ====================== */
GAMES.forEach(g=>delete g.nw);
GAMES.push(
  {id:'wshow',ic:'🎡',nm:'Grande Roue',tg:'Le show en direct, bonus jusqu\'à ×80',c:'#0e7c86',b:'live',nw:1,lv:2,cat:'table'},
  {id:'ballon',ic:'🎈',nm:'Le Ballon',tg:'Gonfle… sans le faire éclater',c:'#ff4d6d',nw:1,lv:1,cat:'instant'},
  {id:'lingots',ic:'🧱',nm:'Empile les lingots',tg:'Vise juste, monte jusqu\'à ×25',c:'#e3b558',nw:1,lv:2,cat:'instant'},
  {id:'pousse',ic:'🪙',nm:'Pousse-pièces',tg:'La machine de fête foraine',c:'#c48a1c',nw:1,cat:'machines'},
  {id:'dt',ic:'🐉',nm:'Dragon Tigre',tg:'Une carte chacun, la plus forte gagne',c:'#c3343a',nw:1,lv:3,cat:'cartes'},
  {id:'kebab',ic:'🥙',nm:'Kebab Royal',tg:'La machine qui sent la sauce blanche',c:'#e08a1e',nw:1,lv:3,cat:'machines'},
  {id:'daron',ic:'👨',nm:'Le Daron',tg:'Trois appels manqués = tours gratuits',c:'#2d6cdf',nw:1,lv:5,cat:'machines'},
  {id:'monaco',ic:'🦹',nm:'Braquage à Monaco',tg:'Le casse le plus chic de la Côte',c:'#c3343a',nw:1,lv:7,cat:'machines'},
  {id:'battle',ic:'⚔️',nm:'Caisses en duel',tg:'Ta caisse contre la sienne, le meilleur rafle tout',c:'#a35cf0',nw:1,lv:4,cat:'special'},
  {id:'rps',ic:'✊',nm:'Pierre-feuille-ciseaux',tg:'Contre le videur ou contre un pote',c:'#5fd39a',nw:1,b:'multi',cat:'instant'});
Object.assign(GART,{
  wshow:sv(`<circle cx="50" cy="44" r="34" fill="#16141a"/>${Array.from({length:16},(_,i)=>{const a0=i/16*Math.PI*2-Math.PI/2,a1=(i+1)/16*Math.PI*2-Math.PI/2,c=['#e3b558','#2d6cdf','#c3343a','#e3b558','#7b3fc4','#1f8a5b','#e3b558','#2d6cdf','#e08a1e','#e3b558','#c3343a','#ff5fb2','#e3b558','#2d6cdf','#0e7c86','#c3343a'][i];return`<path d="M50 44L${50+32*Math.cos(a0)} ${44+32*Math.sin(a0)}A32 32 0 0 1 ${50+32*Math.cos(a1)} ${44+32*Math.sin(a1)}Z" fill="${c}"/>`}).join('')}<circle cx="50" cy="44" r="9" fill="url(#gGoldUI)"/><path d="M50 4l-6 9h12z" fill="#fff"/>`),
  ballon:sv(`<path d="M50 62C46 70 54 72 50 80" stroke="#f6efe4" stroke-width="1.2" fill="none"/><ellipse cx="50" cy="34" rx="22" ry="27" fill="#ff4d6d"/><ellipse cx="42" cy="24" rx="5" ry="8" fill="#fff" opacity=".45"/><path d="M47 60h6l-3 4z" fill="#c3203a"/><text x="78" y="20" font-size="11" font-weight="900" font-family="sans-serif" fill="#fff6c2">×8</text>`),
  lingots:sv(`${[[22,58,56],[28,46,44],[34,34,32],[38,22,24]].map(([x,y,w])=>`<path d="M${x} ${y+10}L${x+4} ${y}H${x+w-4}L${x+w} ${y+10}Z" fill="url(#gGoldUI)" stroke="#9a6512"/>`).join('')}<path d="M18 12h30" stroke="#f2c14e" stroke-width="5" stroke-dasharray="7 3"/><path d="M52 12l6-4v8z" fill="#f2c14e"/>`),
  pousse:sv(`<rect x="10" y="8" width="80" height="62" rx="8" fill="#3a1d24" stroke="#c48a1c" stroke-width="2"/><rect x="16" y="20" width="68" height="10" rx="2" fill="#5a2a32"/>${[[26,50],[40,46],[54,52],[68,47],[33,58],[61,59],[47,60]].map(([x,y])=>coinA(x,y,6)).join('')}<path d="M18 66h64" stroke="#f2c14e" stroke-width="2"/>${coinA(50,14,6)}`),
  dt:sv(`<rect x="4" y="10" width="44" height="60" rx="8" fill="#5a1d24"/><rect x="52" y="10" width="44" height="60" rx="8" fill="#1d3a5a"/>`+cardA(13,24,'K','♥',-6,1)+cardA(61,24,'9','♠',6)+`<text x="26" y="20" text-anchor="middle" font-size="7" font-weight="900" font-family="sans-serif" fill="#ffb3b3">DRAGON</text><text x="74" y="20" text-anchor="middle" font-size="7" font-weight="900" font-family="sans-serif" fill="#b3d4ff">TIGRE</text>`),
  kebab:sv(`<rect x="8" y="10" width="84" height="60" rx="10" fill="#e08a1e"/><rect x="13" y="18" width="74" height="44" rx="5" fill="#2a1508"/>${[16,30,44,58,72].map(x=>`<rect x="${x}" y="21" width="12" height="38" rx="2.5" fill="#fff8e8"/>`).join('')}<text x="50" y="47" text-anchor="middle" font-size="20">🥙</text>`),
  daron:sv(`<rect x="8" y="10" width="84" height="60" rx="10" fill="#2d6cdf"/><rect x="13" y="18" width="74" height="44" rx="5" fill="#0d1b3a"/>${[16,30,44,58,72].map(x=>`<rect x="${x}" y="21" width="12" height="38" rx="2.5" fill="#fff8e8"/>`).join('')}<text x="50" y="47" text-anchor="middle" font-size="20">📞</text>`),
  monaco:sv(`<rect x="8" y="10" width="84" height="60" rx="10" fill="#c3343a"/><rect x="13" y="18" width="74" height="44" rx="5" fill="#2a0a10"/>${[16,30,44,58,72].map(x=>`<rect x="${x}" y="21" width="12" height="38" rx="2.5" fill="#fff8e8"/>`).join('')}<text x="50" y="47" text-anchor="middle" font-size="20">💎</text>`),
  battle:sv(`<path d="M8 30l18-10 18 10v20l-18 10-18-10z" fill="#a35cf0"/><path d="M56 30l18-10 18 10v20l-18 10-18-10z" fill="#e3b558"/><path d="M44 18l12 24M56 18L44 42" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`),
  rps:sv(`<circle cx="28" cy="42" r="20" fill="#1f8a5b"/><circle cx="72" cy="42" r="20" fill="#c3343a"/><text x="28" y="50" text-anchor="middle" font-size="22">✊</text><text x="72" y="50" text-anchor="middle" font-size="22">✌️</text><text x="50" y="47" text-anchor="middle" font-size="10" font-weight="900" font-family="sans-serif" fill="#fff6c2">VS</text>`)});
LIVE_IDS.length=0;LIVE_IDS.push('crash','ro','wshow');

/* ---------- Le Ballon ---------- */
let BL={mode:1,phase:'idle',k:0,bet:0,msg:'Gonfle le ballon : chaque coup de pompe augmente le gain. S\'il éclate, tu perds tout.',cls:'',busy:false};ST.ballon=50;
BUSY.push(()=>BL.phase==='run'||BL.busy);
GAME_VIEW.ballon=el=>{const M=D.BALMODES[BL.mode],run=BL.phase==='run',m=D.balM(BL.k,M),sc=Math.min(1.75,.55+BL.k*.045),risk=BL.k>0?Math.min(1,BL.k*M.p*1.4):0;
  el.innerHTML=`<div class="seg">${D.BALMODES.map((x,i)=>`<button data-act="blmode" data-v="${i}" class="${BL.mode===i?'on':''}" ${run?'disabled':''}>${x.nm}</button>`).join('')}</div>
  <div class="blstage ${BL.phase==='pop'?'popped':''}"><div class="blmult num ${BL.k?'on':''}">${x2(m)}</div>
    <div class="blwrap" id="blw" style="--s:${sc};--shake:${risk}"><svg viewBox="0 0 120 170" class="blsvg" aria-hidden="true"><defs><radialGradient id="blg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffb3c1"/><stop offset=".45" stop-color="${['#ff4d6d','#ff7a2e','#a35cf0'][BL.mode]}"/><stop offset="1" stop-color="${['#9a1030','#9a3a10','#4a1a8a'][BL.mode]}"/></radialGradient></defs>
      <path d="M60 128C55 140 66 150 58 168" stroke="#f6efe4" stroke-width="1.6" fill="none"/><ellipse cx="60" cy="66" rx="48" ry="58" fill="url(#blg)"/><ellipse cx="42" cy="40" rx="10" ry="17" fill="#fff" opacity=".4"/><path d="M53 122h14l-7 9z" fill="${['#9a1030','#9a3a10','#4a1a8a'][BL.mode]}"/></svg></div>
    <div class="pump"><span class="ph" id="pph"></span><span class="pb"></span></div></div>
  <div class="msg ${BL.cls}">${BL.msg}</div>
  ${run?`<div class="lrow2"><span>${BL.k} coup${BL.k>1?'s':''} de pompe · prochain ${x2(D.balM(BL.k+1,M))}</span><b class="num" style="color:var(--gold)">${BL.k?eur(BL.bet*m):'—'}</b></div>
    <div class="row2"><button class="btn big" data-act="blout" ${BL.k&&!BL.busy?'':'disabled'}>Encaisser</button><button class="btn gold big" data-act="blpump" ${BL.busy?'disabled':''}>Pomper !</button></div>`
  :`${stakeUI('ballon')}<button class="btn gold big" data-act="blgo">Prendre un ballon · <span data-sl="ballon">${eur(ST.ballon)}</span></button>`}
  <p class="note">Mode ${M.nm} : ${Math.round(M.p*100)} % de risque d'éclater à chaque coup de pompe.</p>`};
ACT.blmode=el=>{if(BL.phase==='run')return;BL.mode=+el.dataset.v;render()};
ACT.blgo=async()=>{if(!canBet(ST.ballon))return;try{await api('blStart',{amt:ST.ballon,mode:BL.mode});Object.assign(BL,{phase:'run',k:0,bet:ST.ballon,msg:'Pompe ! Encaisse quand tu le sens.',cls:''});snd('pop');render()}catch(e){}};
ACT.blpump=async()=>{if(BL.phase!=='run'||BL.busy)return;BL.busy=true;holdCash=1;const ph=$('#pph');if(ph){ph.classList.remove('go');void ph.offsetWidth;ph.classList.add('go')}snd('tick');vib(15);let r;
  try{r=await api('blPump')}catch(e){BL.busy=false;release();return}await sleep(T(260));BL.busy=false;
  if(r.pop){BL.phase='pop';BL.k=r.k;BL.msg='BOUM ! Le ballon a éclaté. Perdu '+eur(BL.bet)+'.';BL.cls='lose';render();snd('boom');shake();vib([100,50,200]);confetti(['#ff4d6d','#ffb3c1','#fff']);setTimeout(()=>{if(BL.phase==='pop'){BL.phase='idle';render()}},T(1400));release();return}
  BL.k=r.k;if(r.done){BL.phase='idle';BL.msg='Ballon maximum ! +'+eur(r.pay-BL.bet);BL.cls='win';render();burst(40);snd('big');release();return}
  if(r.m>=5&&r.m<5.3)snd('level');render();release()};
ACT.blout=()=>play(async()=>{if(BL.phase!=='run'||!BL.k)return;const r=await api('blOut');BL.phase='idle';BL.msg='Encaissé à '+x2(r.m)+' : +'+eur(r.pay-BL.bet);BL.cls='win';render();burst(r.m>=5?30:12);snd('win')});
function confetti(cols){if(RM)return;for(let i=0;i<40;i++){const c=document.createElement('div');c.className='conf';c.style.background=pick(cols);c.style.left=innerWidth/2+'px';c.style.top=innerHeight*.4+'px';document.body.appendChild(c);
  const a=rnd(0,Math.PI*2),d=rnd(60,240);c.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+200}px) rotate(${rnd(-720,720)}deg)`,opacity:0}],{duration:rnd(900,1500),easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>c.remove()}}

/* ---------- Empile les lingots ---------- */
let LG={phase:'idle',bet:0,lvl:0,w:5,rows:[],t0:0,ph:0,msg:'Arrête la barre pile au-dessus de la précédente. Ce qui dépasse tombe.',cls:'',busy:false,cur:0};ST.lingots=50;
BUSY.push(()=>LG.phase==='run'||LG.busy);
GAME_VIEW.lingots=el=>{const run=LG.phase==='run';
  el.innerHTML=`<div class="lgwrap"><div class="lgboard" id="lgB">${Array.from({length:D.LGTOP},(_,r)=>{const row=D.LGTOP-1-r,R=LG.rows[row];return`<div class="lgrow ${row===LG.lvl&&run?'cur':''}">${Array.from({length:D.LGW},(_,c)=>`<i class="${R&&c>=R[0]&&c<R[0]+R[1]?'bar':''}"></i>`).join('')}</div>`}).join('')}<div class="lgmov" id="lgM"></div></div>
    <div class="lgladder">${D.LGMULT.slice(1).map((m,i)=>`<span class="${i+1===LG.lvl?'on':i+1<LG.lvl?'ok':''}">${x2(m).replace(',00','')}</span>`).reverse().join('')}</div></div>
  <div class="msg ${LG.cls}">${LG.msg}</div>
  ${run?`<div class="row2"><button class="btn big" data-act="lgout" ${LG.lvl&&!LG.busy?'':'disabled'}>Encaisser ${LG.lvl?eur(LG.bet*D.LGMULT[LG.lvl]):''}</button><button class="btn gold big" data-act="lgtap" ${LG.busy?'disabled':''}>Poser !</button></div>`
  :`${stakeUI('lingots')}<button class="btn gold big" data-act="lggo">Commencer · <span data-sl="lingots">${eur(ST.lingots)}</span></button>`}`;
  lgLoop()};
let lgOn=false;
function lgLoop(){if(lgOn)return;lgOn=true;const f=()=>{const m=$('#lgM'),b=$('#lgB');if(!m||!b){lgOn=false;return}
  if(LG.phase==='run'&&!LG.busy){const x=D.lgPos(now()-LG.t0,LG.w,LG.lvl,LG.ph),cw=b.clientWidth/D.LGW,rh=b.clientHeight/D.LGTOP;LG.cur=x;
    m.style.display='block';m.style.left=(x*cw)+'px';m.style.width=(LG.w*cw)+'px';m.style.top=((D.LGTOP-1-LG.lvl)*rh)+'px';m.style.height=rh+'px'}else if(LG.phase!=='run')m.style.display='none';requestAnimationFrame(f)};requestAnimationFrame(f)}
ACT.lggo=async()=>{if(!canBet(ST.lingots))return;let r;try{r=await api('lgStart',{amt:ST.lingots})}catch(e){return}Object.assign(LG,{phase:'run',bet:ST.lingots,lvl:0,w:5,rows:[],t0:r.t0,ph:r.ph,msg:'Tape « Poser » (ou le plateau) au bon moment !',cls:''});snd('pop');render()};
ACT.lgtap=async()=>{if(LG.phase!=='run'||LG.busy)return;LG.busy=true;holdCash=1;const ms=now()-LG.t0;let r;try{r=await api('lgTap',{ms})}catch(e){LG.busy=false;release();return}
  if(r.lose){LG.phase='idle';LG.busy=false;LG.msg='Raté ! La pile s\'effondre. Perdu '+eur(LG.bet)+'.';LG.cls='lose';render();snd('boom');shake();release();return}
  const cut=LG.w-r.w;LG.rows[r.lvl-1]=[r.x,r.w];LG.w=r.w;LG.lvl=r.lvl;snd(cut?'tick':'coin');vib(20);
  if(r.done){LG.phase='idle';LG.busy=false;LG.msg=(r.lvl>=D.LGTOP?'SOMMET ATTEINT ! ':'')+'Encaissé '+x2(r.m)+' : +'+eur(r.pay-LG.bet);LG.cls='win';render();burst(50);snd('big');release();return}
  LG.t0=r.t0;LG.ph=r.ph;LG.busy=false;LG.msg=cut?`${cut} lingot${cut>1?'s':''} tombé${cut>1?'s':''}… Il en reste ${r.w}.`:'Parfait ! Tout est aligné.';LG.cls=cut?'':'win';render();release()};
ACT.lgout=()=>play(async()=>{if(LG.phase!=='run'||!LG.lvl)return;const r=await api('lgOut');LG.phase='idle';LG.msg='Encaissé '+x2(r.m)+' : +'+eur(r.pay-LG.bet);LG.cls='win';render();burst(r.m>=5?30:12);snd('win')});
document.addEventListener('pointerdown',e=>{if(e.target.closest('#lgB')&&LG.phase==='run')ACT.lgtap()});

/* ---------- Pousse-pièces ---------- */
let PP={busy:false,lane:1,msg:'Choisis une colonne et lâche ta pièce. Le pousseur fait tomber ce qui dépasse.',cls:'',pile:null,anim:null};ST.pousse=20;
BUSY.push(()=>PP.busy);
GAME_VIEW.pousse=el=>{el.innerHTML=`<div class="ppcab"><div class="pptop">${[0,1,2].map(i=>`<button class="pplane ${PP.lane===i?'on':''}" data-act="pplane" data-v="${i}" aria-label="Colonne ${i+1}">▼</button>`).join('')}</div><canvas id="ppc" aria-label="Machine pousse-pièces"></canvas></div>
  <div class="msg ${PP.cls}" id="ppMsg">${PP.msg}</div>${stakeUI('pousse')}<button class="btn gold big" data-act="ppgo" ${PP.busy?'disabled':''}>Lâcher une pièce · <span data-sl="pousse">${eur(ST.pousse)}</span></button>
  <details class="paydetails"><summary>Ce qui peut tomber</summary><div class="paytable">${D.PPDIST.filter(x=>x[0]).map(([m,p])=>`<div><span>${m>=10?'Lingot d\'or ':m>=3?'Grosse avalanche ':'Quelques pièces '}</span><b class="num">${x2(m).replace(',00','')}</b></div>`).join('')}</div></details>`;ppStart()};
ACT.pplane=el=>{if(PP.busy)return;PP.lane=+el.dataset.v;$$('.pplane').forEach((b,i)=>b.classList.toggle('on',i===PP.lane));snd('tick')};
function ppInitPile(W,H){const pile=[];for(let i=0;i<46;i++)pile.push({x:rnd(20,W-20),y:rnd(H*.45,H*.86),r:rnd(9,12),vy:0,fall:false,bar:false});return pile}
let ppOn=false;
function ppStart(){if(ppOn)return;ppOn=true;const loop=t=>{const c=$('#ppc');if(!c){ppOn=false;return}const dpr=Math.min(2,devicePixelRatio||1),W=c.clientWidth,H=c.clientHeight;if(c.width!==W*dpr){c.width=W*dpr;c.height=H*dpr}
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);if(!PP.pile)PP.pile=ppInitPile(W,H);
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a1018');bg.addColorStop(1,'#120810');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const push=H*.22+Math.sin(t/700)*H*.07;g.fillStyle='#5a2a32';g.fillRect(10,push-26,W-20,26);g.fillStyle='#7a3a44';g.fillRect(10,push-6,W-20,6);
  g.strokeStyle='#c48a1c';g.lineWidth=3;g.beginPath();g.moveTo(6,H*.92);g.lineTo(W-6,H*.92);g.stroke();
  PP.pile.forEach(p=>{if(p.fall){p.vy+=.5;p.y+=p.vy}});PP.pile=PP.pile.filter(p=>p.y<H+30);
  const a=PP.anim;if(a){const k=Math.min(1,(t-a.t0)/650);a.coin.y=-10+(a.ty+10)*easeInOut(k);if(k>=1&&!a.landed){a.landed=1;PP.pile.push({...a.coin,vy:0});snd('chip');
      const n=Math.min(36,Math.round(a.m*3));const front=PP.pile.filter(p=>!p.fall).sort((x,y)=>y.y-x.y);for(let i=0;i<n&&i<front.length;i++)setTimeout(()=>{front[i].fall=true;front[i].vy=rnd(0,2);if(i%3===0)snd('coin')},200+i*70);
      if(a.m>=10)setTimeout(()=>{PP.pile.push({x:W/2,y:H*.8,r:16,bar:true,fall:true,vy:0});snd('big')},300);
      for(let i=0;i<n;i++)PP.pile.push({x:rnd(20,W-20),y:rnd(H*.45,H*.75),r:rnd(9,12),vy:0,fall:false});a.done&&setTimeout(a.done,250+n*70)}}
  PP.pile.concat(a&&!a.landed?[a.coin]:[]).forEach(p=>{if(p.bar){g.fillStyle='#f2c14e';g.strokeStyle='#9a6512';g.lineWidth=2;g.beginPath();g.moveTo(p.x-26,p.y+10);g.lineTo(p.x-18,p.y-8);g.lineTo(p.x+18,p.y-8);g.lineTo(p.x+26,p.y+10);g.closePath();g.fill();g.stroke();return}
    const gr=g.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,1,p.x,p.y,p.r);gr.addColorStop(0,'#fff4c9');gr.addColorStop(.5,'#f2c14e');gr.addColorStop(1,'#9a6512');g.fillStyle=gr;g.beginPath();g.ellipse(p.x,p.y,p.r,p.r*.72,0,0,Math.PI*2);g.fill();g.strokeStyle='#7a4f0c';g.lineWidth=1;g.stroke()});
  requestAnimationFrame(loop)};requestAnimationFrame(loop)}
ACT.ppgo=async()=>{if(PP.busy||!canBet(ST.pousse))return;PP.busy=true;holdCash=1;let r;try{r=await api('ppDrop',{amt:ST.pousse,lane:PP.lane})}catch(e){PP.busy=false;release();return}const c=$('#ppc');const W=c?c.clientWidth:320,H=c?c.clientHeight:280;
  const b=$('[data-act="ppgo"]');if(b)b.disabled=true;const m=$('#ppMsg');if(m){m.textContent='La pièce tombe…';m.className='msg'}
  await new Promise(res=>{PP.anim={t0:performance.now(),coin:{x:W*(.2+PP.lane*.3)+rnd(-10,10),y:-10,r:11,fall:false,vy:0},ty:H*.38,m:r.m,done:res}});PP.anim=null;
  PP.busy=false;PP.msg=r.m>=10?'LINGOT D\'OR ! +'+eur(r.pay-ST.pousse):r.pay>ST.pousse?'Ça tombe ! +'+eur(r.pay-ST.pousse):r.pay?'Tu récupères '+eur(r.pay):'Rien n\'est tombé… le pousseur te nargue.';PP.cls=r.pay>ST.pousse?'win':r.pay?'':'lose';
  const mm=$('#ppMsg');if(mm){mm.textContent=PP.msg;mm.className='msg '+PP.cls}if(b)b.disabled=false;if(r.m>=10){burst(40);snd('big')}else if(r.pay>ST.pousse)snd('win');release()};

/* ---------- Pierre-feuille-ciseaux ---------- */
const HANDS=[['✊','Pierre'],['✋','Feuille'],['✌️','Ciseaux']];
let RP={mode:'bot',busy:false,res:null,opp:0,msg:'Le videur du casino t\'attend. Pierre, feuille ou ciseaux ?',cls:''};ST.rps=50;
BUSY.push(()=>RP.busy);
GAME_VIEW.rps=el=>{const opps=ONLINE.filter(p=>p.id!==S.id);
  el.innerHTML=`<div class="seg"><button data-act="rpmode" data-v="bot" class="${RP.mode==='bot'?'on':''}">Contre le videur</button><button data-act="rpmode" data-v="pvp" class="${RP.mode==='pvp'?'on':''}">Défier un joueur</button></div>
  <div class="rpsarena"><div class="rpside"><span class="who">${avHTML(46)}<b>Toi</b></span><span class="hand" id="rpMe">${RP.res?HANDS[RP.res.me][0]:'✊'}</span></div><span class="vs">VS</span>
    <div class="rpside"><span class="who">${RP.mode==='bot'?`<span class="avatar av2" style="--as:46px">${CROUP_SVG}</span><b>Le videur</b>`:RP.opp?`${fc(opps.find(p=>p.id===RP.opp)||{},46)}<b>${esc((opps.find(p=>p.id===RP.opp)||{}).pseudo||'?')}</b>`:'<span class="fface">❔</span><b>Choisis un joueur</b>'}</span><span class="hand flip" id="rpHim">${RP.res?HANDS[RP.res.him][0]:'✊'}</span></div></div>
  <div class="msg ${RP.cls}" id="rpMsg">${RP.msg}</div>
  ${RP.mode==='pvp'?`<div class="opp">${opps.slice(0,10).map(p=>`<button data-act="rpopp" data-v="${p.id}" class="${RP.opp===p.id?'on':''}"><span class="av">${fc(p,36)}</span><b>${esc(p.pseudo)}</b></button>`).join('')||'<div class="empty">Personne d\'autre en ligne. Invite tes potes !</div>'}</div>`:''}
  ${stakeUI('rps')}<div class="rpsbtns">${HANDS.map(([i,n],k)=>`<button class="btn gold" data-act="rpgo" data-v="${k}" ${RP.busy||(RP.mode==='pvp'&&!RP.opp)?'disabled':''}><span style="font-size:24px">${i}</span>${n}</button>`).join('')}</div>
  <p class="note">${RP.mode==='bot'?'Gagné : ×1,96. Égalité : mise rendue.':'Ton pote a 60 secondes pour accepter. Le gagnant rafle les deux mises (2 % pour la maison).'}</p>`};
ACT.rpmode=el=>{if(RP.busy)return;RP.mode=el.dataset.v;RP.res=null;RP.msg=RP.mode==='bot'?'Le videur du casino t\'attend.':'Choisis un joueur en ligne, ta mise, puis ton coup secret.';RP.cls='';render()};
ACT.rpopp=el=>{RP.opp=+el.dataset.v;render()};
async function rpShake(){const a=$('#rpMe'),b=$('#rpHim');[a,b].forEach(x=>x&&(x.textContent='✊'));for(let i=0;i<3;i++){[a,b].forEach(x=>{if(x){x.classList.remove('bump');void x.offsetWidth;x.classList.add('bump')}});snd('tick');await sleep(T(320))}}
ACT.rpgo=async el=>{if(RP.busy||!canBet(ST.rps))return;const m=+el.dataset.v;
  if(RP.mode==='pvp'){try{await api('rpsInvite',{to:RP.opp,m,amt:ST.rps});RP.msg='Défi envoyé ! Ton coup est secret. Résultat dès qu\'il répond.';RP.cls='gold';render();snd('pop')}catch(e){}return}
  RP.busy=true;holdCash=1;let r;try{r=await api('rpsBot',{m,amt:ST.rps})}catch(e){RP.busy=false;release();return}const msg=$('#rpMsg');if(msg){msg.textContent='Pierre… feuille… ciseaux…';msg.className='msg'}await rpShake();
  RP.res={me:m,him:r.h};RP.busy=false;RP.msg=r.res==='win'?'Gagné ! +'+eur(r.pay-ST.rps):r.res==='draw'?'Égalité, mise rendue.':'Perdu. Le videur rigole.';RP.cls=r.res==='win'?'win':r.res==='lose'?'lose':'';render();snd(r.res==='win'?'win':r.res==='lose'?'lose':'tick');if(r.res==='win')burst(14);release()};
on('rpsRes',r=>whenFree(()=>{modal(`<p class="mt">Pierre-feuille-ciseaux contre ${esc(r.vs)}</p><div class="rpsarena small"><div class="rpside"><b>Toi</b><span class="hand">${HANDS[r.me][0]}</span></div><span class="vs">VS</span><div class="rpside"><b>${esc(r.vs)}</b><span class="hand">${HANDS[r.him][0]}</span></div></div>
  <div class="msg ${r.res==='win'?'win':r.res==='lose'?'lose':''}">${r.res==='win'?'Gagné ! +'+eur(r.prize-r.amt):r.res==='lose'?'Perdu '+eur(r.amt):'Égalité, mise rendue.'}</div><button class="btn gold" data-close>OK</button>`);if(r.res==='win'){burst(20);snd('win')}else snd(r.res==='lose'?'lose':'tick')}));
let RPI=null;
EVT.rps=ev=>{RPI=ev;snd('notif');modal(`<div class="center">${fc({av:ev.av},72)}</div><p class="mt">${esc(ev.from)} te défie !</p><p>Pierre-feuille-ciseaux pour <b class="num">${eur(ev.amt)}</b>. Il a déjà choisi son coup en secret.</p>
  <div class="rpsbtns">${HANDS.map(([i,n],k)=>`<button class="btn gold" data-act="rpans" data-v="${k}"><span style="font-size:24px">${i}</span>${n}</button>`).join('')}</div><button class="btn" data-act="rpno">Refuser (petit joueur)</button>`)};
ACT.rpno=async()=>{try{await api('rpsAnswer',{id:RPI.id,yes:false})}catch(e){}closeModal()};
ACT.rpans=async el=>{let r;try{r=await api('rpsAnswer',{id:RPI.id,yes:true,m:+el.dataset.v})}catch(e){closeModal();return}
  modal(`<p class="mt">Contre ${esc(r.vs)}</p><div class="rpsarena small"><div class="rpside"><b>Toi</b><span class="hand">${HANDS[r.me][0]}</span></div><span class="vs">VS</span><div class="rpside"><b>${esc(r.vs)}</b><span class="hand">${HANDS[r.him][0]}</span></div></div>
  <div class="msg ${r.res==='win'?'win':r.res==='lose'?'lose':''}">${r.res==='win'?'Gagné ! +'+eur(r.prize-r.amt):r.res==='lose'?'Perdu '+eur(r.amt):'Égalité, mise rendue.'}</div><button class="btn gold" data-close>OK</button>`);if(r.res==='win'){burst(20);snd('win')}};
PROF_EXTRA.push(p=>p.on?`<button class="btn" data-act="rpchal" data-v="${p.id}">✊ Pierre-feuille-ciseaux</button>`:'');
ACT.rpchal=el=>{closeModal();RP.mode='pvp';RP.opp=+el.dataset.v;go('casino','rps')};

/* ---------- Dragon Tigre ---------- */
let DT={bets:{},prev:null,chip:10,busy:false,d:null,t:null,msg:'Dragon ou Tigre : une carte chacun, la plus haute gagne. L\'as est la plus faible.',cls:'',hist:[]};
BUSY.push(()=>DT.busy);
GAME_VIEW.dt=el=>{const tot=sumO(DT.bets);
  el.innerHTML=`<div class="felt dtfelt"><div class="dtrow"><div class="dtside dragon"><span class="lbl">DRAGON</span><div class="cards" id="dtD"></div></div><div class="dtside tiger"><span class="lbl">TIGRE</span><div class="cards" id="dtT"></div></div></div>
    <div class="msg ${DT.cls}">${DT.msg}</div><div class="hist">${DT.hist.slice(0,18).map(h=>`<span style="background:${h==='d'?'#c3343a':h==='t'?'#2d6cdf':'#1f8a5b'}">${h==='d'?'D':h==='t'?'T':'='}</span>`).join('')}</div></div>
  <div class="baczones">${[['d','Dragon','paie 1 pour 1','#c3343a'],['tie','Égalité','paie 8 pour 1','#1f8a5b'],['t','Tigre','paie 1 pour 1','#2d6cdf']].map(([k,n,o,c])=>`<button class="bz2" data-act="dtb" data-v="${k}" style="--zc:${c}" ${DT.busy?'disabled':''}><b>${n}</b><small>${o}</small>${DT.bets[k]?chipSpan(DT.bets[k]):''}</button>`).join('')}</div>
  <div class="stake"><div class="betline2"><span>Choisis un jeton, puis touche une zone</span><b class="num">Total ${eur(tot)}</b></div>${chipRack('dtRack','dtchip',DT.chip)}${chipFoot(DT,'dt')}</div>
  <button class="btn gold big" data-act="dtgo" ${DT.busy?'disabled':''}>Retourner les cartes · ${eur(tot)}</button><p class="note">En cas d'égalité, les mises sur Dragon et Tigre sont rendues à moitié.</p>`;
  if(DT.d)$('#dtD').appendChild(cardEl(DT.d,false,false,true));else $('#dtD').insertAdjacentHTML('beforeend',backCard);if(DT.t)$('#dtT').appendChild(cardEl(DT.t,false,false,true));else $('#dtT').insertAdjacentHTML('beforeend',backCard)};
ACT.dtchip=el=>pickChip(el,'dtRack',DT);ACT.dtb=el=>addChip(DT,el.dataset.v);clrRep(DT,'dt');
ACT.dtgo=()=>play(async()=>{const tot=sumO(DT.bets);if(DT.busy||!tot)return toast('Pose au moins un jeton.');DT.busy=true;let r;try{r=await api('dtPlay',{bets:DT.bets})}catch(e){DT.busy=false;return}
  DT.d=null;DT.t=null;DT.msg='…';DT.cls='';render();await sleep(T(300));DT.d=r.d;render();snd('card');await sleep(T(700));DT.t=r.t;render();snd('card');await sleep(T(500));
  DT.hist.unshift(r.w);DT.msg=(r.w==='d'?'Le Dragon gagne':r.w==='t'?'Le Tigre gagne':'Égalité !')+'. '+(r.pay>r.tot?'+'+eur(r.pay-r.tot):r.pay===r.tot?'Mise rendue.':r.pay?'Tu récupères '+eur(r.pay):'Perdu '+eur(r.tot));
  DT.cls=r.pay>r.tot?'win':r.pay<r.tot?'lose':'';DT.prev={...DT.bets};DT.bets={};DT.busy=false;render();if(r.pay>r.tot){burst(r.w==='tie'?30:14);snd('win')}});

/* ---------- Machines à thème ---------- */
const TS={};
Object.keys(D.TSLOTS).forEach(th=>{const T=D.TSLOTS[th],sym=s=>s==='W'?`<b class="wild">${T.map.W}</b>`:s==='7'?`<b class="tseven">${T.map['7']}</b>`:(T.map[s]||s);
  TS[th]={grid:[['🍒','7','🍋'],['🔔','W','⭐'],['💎','💰','🍇'],['🍋','7','🍒'],['⭐','🔔','💎']],busy:false,fs:0,fsTot:0,msg:`10 lignes. 3 ${T.map['💰']} = tours gratuits. Cinq ${T.map['7']} sur une ligne = ${D.TSJACK} fois la mise par ligne.`,cls:'',hits:[]};ST[th]=50;
  const S6=TS[th];BUSY.push(()=>S6.busy);
  GAME_VIEW[th]=el=>{el.innerHTML=`<div class="gcab tslot th-${th} ${S6.fs?'fsmode':''}" style="--th:${T.c}"><div class="tsname">${T.nm.toUpperCase()}</div>${S6.fs?`<div class="fsbar">TOURS GRATUITS · ${S6.fsTot-S6.fs+1}/${S6.fsTot} · gains ×2</div>`:''}
      <div class="greels">${S6.grid.map((col,c)=>`<div class="greel"><div class="gstrip" id="ts${c}">${col.map((s,r)=>`<div class="gsym ${S6.hits.includes(c+'-'+r)?'hit':''}">${sym(s)}</div>`).join('')}</div></div>`).join('')}</div>
      <div class="msg ${S6.cls}" id="tsMsg" style="margin-top:10px">${S6.msg}</div></div>
    ${stakeUI(th)}<button class="btn gold big" data-act="tspin" data-v="${th}" ${S6.busy?'disabled':''}>Lancer · <span data-sl="${th}">${eur(ST[th])}</span></button>
    <details class="paydetails"><summary>Table des gains (par ligne, mise ÷ 10)</summary><div class="paytable">${D.GSYM.filter(x=>x.p).map(x=>`<div><span>${sym(x.s)} ×3/4/5</span><b class="num">${x.p[0]}/${x.p[1]}/${x.p[2]||D.TSJACK}</b></div>`).join('')}</div><p class="note">${T.map.W} remplace tout sauf ${T.map['💰']}. 3, 4 ou 5 ${T.map['💰']} : 8, 12 ou 20 tours gratuits à gains doubles.</p></details>`};
  TS[th].reels=async(fin,fast)=>{await Promise.all(fin.map((f,c)=>new Promise(res=>{const st=$('#ts'+c);if(!st)return res();const all=[...S6.grid[c],...Array.from({length:10+c*5},gRoll),...f];st.innerHTML=all.map(s=>`<div class="gsym">${sym(s)}</div>`).join('');st.style.transition='none';st.style.transform='translateY(0)';void st.offsetHeight;
    const d=RM?.15:(fast?.7:1)+c*.22;st.style.transition=`transform ${d}s cubic-bezier(.12,.7,.22,1.03)`;st.style.transform=`translateY(-${(all.length-3)*GH}px)`;setTimeout(()=>{snd('tick');st.style.transition='none';st.innerHTML=f.map(s=>`<div class="gsym">${sym(s)}</div>`).join('');st.style.transform='translateY(0)';res()},d*1000+40)})));S6.grid=fin}});
ACT.tspin=el=>{const th=el.dataset.v,S6=TS[th];return play(async()=>{if(S6.busy||!canBet(ST[th]))return;S6.busy=true;let r;try{r=await api('tslotSpin',{th,amt:ST[th]})}catch(e){S6.busy=false;return}S6.hits=[];S6.msg='Ça tourne…';S6.cls='';render();let fw=0;
  for(let k=0;k<r.spins.length;k++){const sp=r.spins[k];if(sp.free){S6.fs=r.spins.length-k;S6.fsTot=Math.max(S6.fsTot,r.spins.length-1);render()}await S6.reels(sp.grid,sp.free);S6.hits=sp.hits;if(sp.jack){snd('big');burst(60)}if(sp.free)fw+=sp.win;
    S6.msg=sp.jack?'SUPER GAIN : '+eur(sp.jack)+' !':sp.free?(sp.win?'+'+eur(sp.win)+' · ':'')+'total des tours gratuits '+eur(fw):sp.sc>=3?'TOURS GRATUITS !':sp.win?'+'+eur(sp.win):'…';S6.cls=sp.win||sp.sc>=3?'win':'';render();
    if(!sp.free&&sp.sc>=3){snd('level');burst(30);await sleep(T(1500))}else await sleep(T(sp.win?800:350))}
  S6.fs=0;S6.fsTot=0;S6.busy=false;const t=r.total,b=r.bet;S6.msg=t>b?(t>=b*20?'MÉGA GAIN ! ':'Gagné ! ')+'+'+eur(t-b):t?'Tu récupères '+eur(t):'Perdu. Relance !';S6.cls=t>b?'win':t?'':'lose';render();if(t>b){burst(t>=b*20?50:14);snd('win')}})};
Object.assign(AUTO_FN,{kebab:()=>ACT.tspin({dataset:{v:'kebab'}}),daron:()=>ACT.tspin({dataset:{v:'daron'}}),monaco:()=>ACT.tspin({dataset:{v:'monaco'}})});
['kebab','daron','monaco'].forEach(g=>{const o=GAME_VIEW[g];GAME_VIEW[g]=el=>{o(el);const big=el.querySelector('.btn.big.gold');if(big)big.insertAdjacentHTML('afterend',autoUI(g))}});

/* ---------- Caisses en duel ---------- */
let BT={sel:0,busy:false,res:null,msg:'Ta caisse contre celle d\'un adversaire. La plus grosse valeur rafle les deux.',cls:''};
BUSY.push(()=>BT.busy);
GAME_VIEW.battle=el=>{const c=D.CRATES[BT.sel];
  el.innerHTML=`<div class="seg">${D.CRATES.map((x,i)=>`<button data-act="btsel" data-v="${i}" class="${BT.sel===i?'on':''}" ${BT.busy?'disabled':''}>${x.nm} · ${eur(x.pr)}</button>`).join('')}</div>
  <div class="btarena"><div class="btside"><span class="who">${avHTML(40)}<b>Toi</b></span><div class="spinner sm"><div class="strip" id="btA"></div><span class="marker"></span></div><b class="num" id="btAv">${BT.res?eur(BT.res.a):'?'}</b></div>
    <span class="vs">VS</span><div class="btside"><span class="who"><span class="fface">😈</span><b id="btOpp">${BT.res?esc(BT.res.opp):'Adversaire'}</b></span><div class="spinner sm"><div class="strip" id="btB"></div><span class="marker"></span></div><b class="num" id="btBv">${BT.res?eur(BT.res.b):'?'}</b></div></div>
  <div class="msg ${BT.cls}" id="btMsg">${BT.msg}</div><button class="btn gold big" data-act="btgo" ${BT.busy||S.cash<c.pr?'disabled':''}>Lancer le duel · ${eur(c.pr)}</button><p class="note">Les objets gagnés en duel sont convertis en argent (70 % de leur prix).</p>`;
  ['btA','btB'].forEach(id=>{const s=$('#'+id);if(s)s.innerHTML=Array.from({length:46},()=>tileHTML(pickLootC(c))).join('')})};
ACT.btsel=el=>{if(BT.busy)return;BT.sel=+el.dataset.v;BT.res=null;render()};
ACT.btgo=async()=>{if(BT.busy)return;const c=D.CRATES[BT.sel];if(!canBet(c.pr))return;BT.busy=true;holdCash=1;let r;try{r=await api('crBattle',{c:c.id})}catch(e){BT.busy=false;release();return}
  $$('[data-act="btgo"],[data-act="btsel"]').forEach(b=>b.disabled=true);$('#btOpp').textContent=r.opp;
  const run=(id,win)=>new Promise(res=>{const s=$('#'+id);if(!s)return res();const tiles=Array.from({length:46},()=>pickLootC(c));tiles[40]=win;s.innerHTML=tiles.map(tileHTML).join('');const box=s.parentElement,TW=90,target=40*TW+TW/2-box.clientWidth/2+rnd(-25,25),t0=performance.now(),dur=RM?300:4600;
    const f=t=>{const p=Math.min(1,(t-t0)/dur);s.style.transform=`translateX(${-target*(1-Math.pow(1-p,4))}px)`;if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
  snd('chip');await Promise.all([run('btA',r.mine),run('btB',r.his)]);$('#btAv').textContent=eur(r.a);$('#btBv').textContent=eur(r.b);
  BT.res=r;BT.busy=false;BT.msg=r.res==='win'?`Tu écrases ${r.opp} ! +${eur(r.pay-c.pr)}`:r.res==='draw'?'Égalité parfaite : chacun garde sa caisse.':`${r.opp} gagne avec ${eur(r.b)}. Dur.`;BT.cls=r.res==='win'?'win':r.res==='lose'?'lose':'';
  const m=$('#btMsg');if(m){m.textContent=BT.msg;m.className='msg '+BT.cls}$$('[data-act="btgo"],[data-act="btsel"]').forEach(b=>b.disabled=false);if(r.res==='win'){burst(30);snd('big')}else snd(r.res==='lose'?'lose':'tick');release()};

/* ---------- Grande Roue en direct ---------- */
let WSs={st:null,local:{},mine:{},chip:10,rot:0,anim:null,spun:0,img:null,shown:null};
const wsSegA=2*Math.PI/D.WSEG.length;
GAME_VIEW.wshow=el=>{el.innerHTML=`<div class="wsbox"><canvas id="wsc" aria-label="Grande roue"></canvas><span class="wspin" aria-hidden="true"></span><div class="wsover" id="wsO"></div></div>
  <div class="hist" id="wsH"></div><div class="msg" id="wsMsg"></div><div id="wsTime"></div><div class="players" id="wsPl"></div>
  <div class="wszones">${D.WKEYS.map(k=>`<button class="wsz ${D.WPAY[k]?'':'bonus'}" data-act="wsb" data-v="${k}" style="--zc:${D.WCOL[k]}"><b>${D.WNAME[k]}</b><small>${D.WPAY[k]?'paie ×'+String(D.WPAY[k]).replace('.',','):'bonus'}</small><span class="zc" data-z="${k}"></span></button>`).join('')}</div>
  <div class="stake"><div class="betline2"><span>Choisis un jeton, puis une case</span><b class="num" id="wsTot"></b></div>${chipRack('wsRack','wschip',WSs.chip)}<div class="row2"><button class="btn sm" data-act="wsclr">Effacer</button><button class="btn sm" data-act="wsrules">Règles</button></div></div>
  <button class="btn gold big" data-act="wsgo" id="wsGo">Valider mes mises</button>`;
  api('wsJoin').then(r=>{WSs.mine=r.mine||{};wsUI()}).catch(()=>{});onLeave(()=>quiet(api('wsLeave')));wsStart();wsUI()};
on('ws',d=>{const prev=WSs.st;WSs.st=d;if(d.phase==='bet'&&prev&&prev.phase!=='bet'){WSs.mine={};WSs.local={};WSs.shown=null}
  if(d.phase==='spin'&&WSs.spun!==d.spinAt){WSs.spun=d.spinAt;wsSpin(d)}if(tab==='casino'&&sub.casino==='wshow')wsUI()});
on('wsRes',d=>{const p=d.payout-d.total;if(p>0){burst(p>=d.total*10?40:16);snd('big');toast(D.WNAME[d.key]+' ! +'+eur(p))}else if(d.total)toast(D.WNAME[d.key]+' : perdu '+eur(d.total))});
function wsBuild(px){const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d'),R=px/2;g.translate(R,R);
  g.beginPath();g.arc(0,0,R,0,Math.PI*2);g.fillStyle='#2a1508';g.fill();g.beginPath();g.arc(0,0,R*.96,0,Math.PI*2);g.fillStyle='#c99a3e';g.fill();
  D.WSEG.forEach((k,i)=>{const a0=-Math.PI/2+(i-.5)*wsSegA;g.beginPath();g.moveTo(0,0);g.arc(0,0,R*.92,a0,a0+wsSegA);g.closePath();g.fillStyle=D.WCOL[k];g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.stroke();
    g.save();g.rotate(a0+wsSegA/2);g.translate(R*.78,0);g.rotate(Math.PI/2);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';const lb=D.WPAY[k]?k:k==='coin'?'PF':k==='hunt'?'CH':k==='pach'?'PA':'×2';g.font=`800 ${Math.round(px*(lb.length>1?.032:.04))}px "Unbounded",sans-serif`;g.fillText(lb,0,0);g.restore()});
  g.beginPath();g.arc(0,0,R*.3,0,Math.PI*2);const cg=g.createRadialGradient(-R*.08,-R*.08,2,0,0,R*.3);cg.addColorStop(0,'#fff4c9');cg.addColorStop(.5,'#f2c14e');cg.addColorStop(1,'#9a6512');g.fillStyle=cg;g.fill();
  g.fillStyle='#2a1d05';g.font=`800 ${Math.round(px*.05)}px "Unbounded",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('FAUCHÉ',0,0);return c}
let wsOn=false;
function wsStart(){const c=$('#wsc');if(!c)return;const css=Math.min(c.parentElement.clientWidth||320,340),dpr=Math.min(2,devicePixelRatio||1);c.width=c.height=Math.round(css*dpr);c.style.width=c.style.height=css+'px';WSs.img=wsBuild(c.width);
  if(wsOn)return;wsOn=true;let tick=-1;const loop=t=>{const cv=$('#wsc');if(!cv){wsOn=false;return}const a=WSs.anim;if(a){const k=Math.min(1,(t-a.t0)/a.dur);WSs.rot=a.r0+(a.r1-a.r0)*easeOutQuart(k);const sl=Math.floor((-WSs.rot+Math.PI*20)/wsSegA);if(sl!==tick){tick=sl;if(k<.97)snd('tick')}if(k>=1){WSs.anim=null;a.done&&a.done()}}else if(!WSs.st||WSs.st.phase==='bet')WSs.rot+=.0015;
    const g=cv.getContext('2d'),W=cv.width;g.clearRect(0,0,W,W);g.save();g.translate(W/2,W/2);g.rotate(WSs.rot);g.drawImage(WSs.img,-W/2,-W/2);g.restore();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
async function wsSpin(d){const segs=d.segs,left=Math.max(1500,d.spinAt+7000*segs.length-now()),per=left/segs.length;
  for(let j=0;j<segs.length;j++){const i=segs[j];let r1=-i*wsSegA;while(r1>WSs.rot-Math.PI*2*3)r1-=Math.PI*2;await new Promise(res=>{WSs.anim={t0:performance.now(),dur:RM?300:per-300,r0:WSs.rot,r1,done:res}});
    if(D.WSEG[i]==='top'&&j<segs.length-1){toast('Relance ×2 ! La roue repart');snd('level');burst(16);await sleep(250)}}}
function wsUI(){const d=WSs.st;if(!d||!$('#wsGo'))return;const all={...WSs.mine};for(const k in WSs.local)all[k]=(all[k]||0)+WSs.local[k];
  $$('.wsz .zc').forEach(z=>{const a=all[z.dataset.z];z.innerHTML=a?chipSpan(a):''});const key=d.segs&&d.segs.length&&d.phase!=='spin'?D.WSEG[d.segs.at(-1)]:null;$$('.wsz').forEach(b=>b.classList.toggle('hit',!!key&&b.dataset.v===key));
  $('#wsH').innerHTML=d.hist.map(h=>`<span style="background:${D.WCOL[h.k]}">${D.WPAY[h.k]?h.k:h.k==='coin'?'PF':h.k==='hunt'?'CH':'PA'}${h.m&&!D.WPAY[h.k]?' ×'+h.m:''}</span>`).join('');
  $('#wsTot').textContent='Validé '+eur(sumB(WSs.mine))+(sumB(WSs.local)?' · en attente '+eur(sumB(WSs.local)):'');
  const msg=$('#wsMsg');msg.className='msg';msg.textContent=d.phase==='bet'?'Faites vos jeux !':d.phase==='spin'?'La roue tourne…':d.phase==='bonus'?'BONUS : '+D.WNAME[key]+' !':key?(D.WNAME[key]+(d.bonus?' · ×'+d.bonus.m:'')):'';
  $('#wsTime').innerHTML=d.phase==='bet'?`<div class="countdown"><span>Lancement dans <b data-secs="${d.endsAt}">${secs(d.endsAt)}</b> s</span>${timerBar(d.endsAt,18000)}</div>`:'';
  $('#wsPl').innerHTML=d.players.map(p=>`<span class="${p.pseudo===S.pseudo?'me':''} ${d.phase==='res'?(p.win>p.total?'ok':'ko'):''}">${fc(p,22)} ${esc(p.pseudo)} · ${eur(p.total)}${d.phase==='res'&&p.win?' → '+eur(p.win):''}</span>`).join('')||'<span class="note">Aucun joueur sur ce tour.</span>';
  const g=$('#wsGo');g.disabled=d.phase!=='bet'||!sumB(WSs.local);g.textContent=d.phase==='bet'?(sumB(WSs.local)?'Valider mes mises · '+eur(sumB(WSs.local)):'Pose tes jetons'):'Attends le prochain tour';
  if(d.phase==='bonus'&&d.bonus&&WSs.shown!==d.spinAt){WSs.shown=d.spinAt;wsBonus(d.bonus,d.endsAt)}if(d.phase==='bet')$('#wsO').innerHTML=''}
async function wsBonus(b,ends){const o=$('#wsO');if(!o)return;snd('level');burst(20);
  if(b.type==='coin'){o.innerHTML=`<div class="wbonus"><b>PILE OU FACE</b><div class="coinflip" id="cf"><span class="f0">×${b.a}</span><span class="f1">×${b.b}</span></div></div>`;await sleep(T(600));const cf=$('#cf');if(cf){cf.style.transform=`rotateY(${1800+(b.side?180:0)}deg)`}await sleep(T(3200));snd('big')}
  else if(b.type==='hunt'){o.innerHTML=`<div class="wbonus"><b>CHASSE AU TRÉSOR</b><div class="hunt">${b.grid.map((m,i)=>`<span data-i="${i}">?</span>`).join('')}</div></div>`;await sleep(T(900));
    const cells=$$('.hunt span');for(let k=0;k<6;k++){cells.forEach(c=>c.classList.remove('hl'));const c=cells[Math.random()*12|0];if(c)c.classList.add('hl');snd('tick');await sleep(T(220))}cells.forEach(c=>c.classList.remove('hl'));
    cells.forEach((c,i)=>{c.textContent='×'+b.grid[i];c.classList.toggle('win',i===b.i)});snd('big')}
  else if(b.type==='pach'){o.innerHTML=`<div class="wbonus"><b>PACHINKO</b><div class="pach"><span class="pball" id="pb"></span><div class="pslots">${b.slots.map((m,i)=>`<span class="${i===b.i?'win':''}">×${m}</span>`).join('')}</div></div></div>`;
    const pb=$('#pb');await sleep(T(400));for(let r=1;r<=6;r++){if(!pb)break;const x=10+(b.i+.5)/10*80+(r<6?rnd(-14,14):0);pb.style.left=Math.max(4,Math.min(96,x))+'%';pb.style.top=(r*13)+'%';snd('tick');await sleep(T(450))}snd('big')}}
ACT.wschip=el=>{WSs.chip=+el.dataset.v;snd('chip');$$('#wsRack .cchip').forEach(c=>c.classList.toggle('on',+c.dataset.v===WSs.chip))};
ACT.wsb=el=>{if(!WSs.st||WSs.st.phase!=='bet')return toast('Attends le prochain tour.');const k=el.dataset.v;if(sumB(WSs.local)+WSs.chip>S.cash)return toast('Pas assez d\'argent pour ce jeton.');WSs.local[k]=(WSs.local[k]||0)+WSs.chip;snd('chip');wsUI()};
ACT.wsclr=()=>{WSs.local={};wsUI()};
ACT.wsgo=async()=>{if(!sumB(WSs.local))return;try{const r=await api('wsBet',{bets:WSs.local});WSs.mine=r.mine;WSs.local={};snd('chip')}catch(e){}wsUI()};
ACT.wsrules=()=>modal(`<p class="mt">La Grande Roue</p><ul><li>54 cases. Mise sur le chiffre où la roue va s'arrêter : 1 paie ×2,5, 2 paie ×4, 5 paie ×7, 10 paie ×13 (mise comprise).</li><li>Pile ou Face, Chasse au trésor, Pachinko : un jeu bonus se lance pour tout le monde, avec un multiplicateur jusqu'à ×80.</li><li>Relance ×2 : la roue repart et le gain suivant est doublé.</li><li>Un tour toutes les 30 secondes environ, pour tous les joueurs.</li></ul><button class="btn gold" data-close>Compris</button>`);

/* ---------- Petits boulots arcade ---------- */
let ARC=null;BUSY.push(()=>!!ARC);
const _rBanque=rBanque;rBanque=function(v){_rBanque(v);v.insertAdjacentHTML('beforeend',`<h3>Petits boulots en mode arcade</h3><p class="note" style="margin-top:-4px">Mieux payés si tu es bon. 30 secondes chrono.</p><div class="grid">${Object.entries(D.ARC).map(([id,j])=>`<button class="item" data-act="arcgo" data-v="${id}" style="text-align:left"><div class="ic" aria-hidden="true">${j.ic}</div><div class="nm">${j.nm}</div><div class="pr">${eur(j.pay)} ${id==='velo'?'la livraison':'l\'assiette'}</div><div class="note">${j.d}</div></button>`).join('')}</div>`)};
ACT.arcgo=async el=>{const id=el.dataset.v,j=D.ARC[id];let r;try{r=await api('arcStart',{id})}catch(e){return}ARC={id,score:0,left:r.dur,end:false};
  modal(`<p class="mt">${j.ic} ${j.nm}</p><div class="arcbar"><span>Score <b class="num" id="arcS">0</b></span><span>Gagné <b class="num" id="arcG" style="color:var(--gold)">0 €</b></span><span><b class="num" id="arcT">${r.dur}</b> s</span></div>
    <canvas id="arcC" class="arccv"></canvas><div class="arcpad">${id==='velo'?'<button class="btn" data-act="arcmv" data-v="-1" aria-label="Gauche">◀</button><button class="btn" data-act="arcmv" data-v="1" aria-label="Droite">▶</button>':''}</div><p class="note">${id==='velo'?'Change de voie pour esquiver les voitures et attraper les sacs de livraison 🛍️.':'Touche chaque assiette sale avant qu\'elle atteigne le bas de la pile.'}</p><div id="arcEnd"></div>`);
  (id==='velo'?arcVelo:arcPlonge)(j,r.dur)};
ACT.arcmv=el=>{if(ARC&&ARC.mv)ARC.mv(+el.dataset.v)};
function arcScore(j){const s=$('#arcS'),g=$('#arcG');if(s)s.textContent=ARC.score;if(g)g.textContent=eur(ARC.score*j.pay)}
async function arcFinish(){if(!ARC||ARC.end)return;ARC.end=true;const sc=ARC.score;let r;try{r=await api('arcEnd',{score:sc})}catch(e){ARC=null;closeModal();return}ARC=null;const e=$('#arcEnd');if(e)e.innerHTML=`<div class="msg win">Paie : +${eur(r.pay)}</div><button class="btn gold big" data-act="mclose">Encaisser</button>`;snd('win')}
function arcCanvas(){const c=$('#arcC');const dpr=Math.min(2,devicePixelRatio||1),W=c.clientWidth,H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return{c,g,W,H}}
function arcTimer(dur){const t0=performance.now();return()=>{const l=Math.max(0,dur-(performance.now()-t0)/1000);const e=$('#arcT');if(e)e.textContent=Math.ceil(l);return l}}
function arcVelo(j,dur){const{c,g,W,H}=arcCanvas(),lanes=3,lw=W/lanes;let lane=1,objs=[],last=0,speed=3,hit=0,next=0;const left=arcTimer(dur);ARC.mv=d=>{lane=Math.max(0,Math.min(2,lane+d));snd('tick')};
  let sx=null;c.onpointerdown=e=>{sx=e.clientX};c.onpointerup=e=>{if(sx===null)return;const dx=e.clientX-sx;if(Math.abs(dx)>20)ARC.mv(dx>0?1:-1);else ARC.mv(e.offsetX<W/2?-1:1);sx=null};
  const loop=t=>{if(!ARC||!$('#arcC')){return}const l=left();if(l<=0){arcFinish();return}speed=3+(dur-l)*.12;
    if(t>next){next=t+rnd(500,900)-(dur-l)*8;objs.push({lane:Math.random()*3|0,y:-40,bag:Math.random()<.42})}
    g.fillStyle='#2a2a32';g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,255,255,.4)';g.setLineDash([16,14]);g.lineDashOffset=-t/8;g.lineWidth=3;for(let i=1;i<lanes;i++){g.beginPath();g.moveTo(i*lw,0);g.lineTo(i*lw,H);g.stroke()}g.setLineDash([]);
    objs.forEach(o=>{o.y+=speed;g.font='34px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.bag?'🛍️':(o.ic||(o.ic=pick(['🚗','🚕','🚙']))),o.lane*lw+lw/2,o.y)});
    const py=H-50;objs=objs.filter(o=>{if(o.lane===lane&&Math.abs(o.y-py)<30){if(o.bag){ARC.score++;arcScore(j);snd('coin')}else if(t>hit){hit=t+900;snd('lose');vib(80);ARC.score=Math.max(0,ARC.score-1);arcScore(j);c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')}return false}return o.y<H+40});
    g.font='40px serif';g.fillText(t<hit&&Math.floor(t/100)%2?'':'🚲',lane*lw+lw/2,py);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
function arcPlonge(j,dur){const{c,g,W,H}=arcCanvas();let plates=[],next=0,miss=0;const left=arcTimer(dur);
  c.onpointerdown=e=>{const x=e.offsetX,y=e.offsetY;const p=plates.find(p=>!p.ok&&Math.hypot(p.x-x,p.y-y)<34);if(p){p.ok=1;ARC.score++;arcScore(j);snd('pop');vib(10)}};
  const loop=t=>{if(!ARC||!$('#arcC'))return;const l=left();if(l<=0){arcFinish();return}const sp=1.1+(dur-l)*.07;
    if(t>next){next=t+rnd(380,700)-(dur-l)*6;plates.push({x:rnd(40,W-40),y:-30,ok:0})}
    g.fillStyle='#1d3a4a';g.fillRect(0,0,W,H);g.fillStyle='#9fb8c8';g.fillRect(0,H-28,W,28);
    plates.forEach(p=>{p.y+=p.ok?-6:sp;g.beginPath();g.arc(p.x,p.y,24,0,Math.PI*2);g.fillStyle=p.ok?'#f6efe4':'#e9e2d0';g.fill();g.strokeStyle='#b9b2a0';g.lineWidth=2;g.stroke();if(!p.ok){g.fillStyle='rgba(120,80,30,.6)';g.beginPath();g.arc(p.x-6,p.y+3,6,0,Math.PI*2);g.arc(p.x+7,p.y-5,4,0,Math.PI*2);g.fill()}else{g.font='16px serif';g.textAlign='center';g.fillText('✨',p.x+14,p.y-14)}});
    plates=plates.filter(p=>{if(!p.ok&&p.y>H-30){miss++;snd('lose');return false}return p.y>-40&&p.y<H});requestAnimationFrame(loop)};requestAnimationFrame(loop)}
