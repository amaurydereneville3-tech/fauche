/* ---------- Mines ---------- */
let MI={phase:'idle',n:3,rev:[],bet:0,mult:1,next:0,grid:null,boom:-1};
BUSY.push(()=>MI.phase==='run');
const miMult=(k,n)=>{let m=.97;for(let i=0;i<k;i++)m*=(25-i)/(25-n-i);return m};
GAME_VIEW.mines=el=>{const run=MI.phase==='run',k=MI.rev.length;
  el.innerHTML=`<div class="lrow2"><span>Multiplicateur <b class="num" style="color:var(--gold)">${x2(run?MI.mult:1)}</b></span><span class="note">Prochaine case : ${x2(miMult(k+1,MI.n))}</span></div>
  <div class="mgrid">${Array.from({length:25},(_,i)=>{const r=MI.rev.includes(i),show=MI.phase==='done'&&MI.grid;const mine=show&&MI.grid[i];
    const cls=r?'gem':show&&mine?'mine'+(i===MI.boom?'':' dim'):show?'gem dim':'';return`<button data-act="mitile" data-v="${i}" class="${cls}" ${!run||r?'disabled':''} aria-label="Case ${i+1}">${r?'💎':show?(mine?'💣':'💎'):''}</button>`}).join('')}</div>
  ${run?`<button class="btn gold big" data-act="miout" ${k?'':'disabled'}>Encaisser · ${eur(MI.bet*MI.mult)}</button>`
  :`${stakeUI('mines')}<div class="seg">${[1,3,5,10,20].map(n=>`<button data-act="min" data-v="${n}" class="${MI.n===n?'on':''}">${n} 💣</button>`).join('')}</div><button class="btn gold big" data-act="migo">Jouer · <span data-sl="mines">${eur(ST.mines)}</span></button>`}
  <p class="note">Plus il y a de bombes, plus chaque case rapporte.</p>`};
ACT.min=el=>{MI.n=+el.dataset.v;render()};
ACT.migo=async()=>{if(!canBet(ST.mines))return;try{await api('miStart',{amt:ST.mines,n:MI.n});MI={...MI,phase:'run',rev:[],bet:ST.mines,mult:1,grid:null,boom:-1};render()}catch(e){}};
ACT.mitile=async el=>{if(MI.phase!=='run')return;const i=+el.dataset.v;el.disabled=true;let r;try{r=await api('miPick',{i})}catch(e){return}
  if(r.boom){MI.phase='done';MI.grid=r.grid;MI.boom=i;snd('boom');shake();vib(200);render();return}
  if(r.auto){MI.phase='done';MI.grid=r.grid;MI.rev.push(i);render();burst(26);toast('Toutes les cases ! +'+eur(r.payout-MI.bet));return}
  MI.rev.push(i);MI.mult=r.mult;snd('pop');render()};
ACT.miout=async()=>{try{const r=await api('miOut');MI.phase='done';MI.grid=r.grid;MI.boom=-1;render();burst(r.mult>=3?26:12);snd('win');toast('Encaissé '+x2(r.mult)+' : +'+eur(r.payout-MI.bet))}catch(e){}};

/* ---------- Plinko ---------- */
let PL={balls:[],last:-1,lastT:0};
BUSY.push(()=>PL.balls.length>0);
GAME_VIEW.plinko=el=>{el.innerHTML=`<div class="plinko"><canvas id="plc"></canvas></div>${stakeUI('plinko')}
  <div class="row2"><button class="btn gold big" data-act="pldrop" data-v="1">Lâcher 1 bille</button><button class="btn big" data-act="pldrop" data-v="5">Lâcher 5 billes</button></div>
  <p class="note">Chaque bille coûte la mise. Les bords paient ×10, le centre ×0,5.</p>`;plDraw()};
ACT.pldrop=el=>{const n=+el.dataset.v,b=ST.plinko;if(b<1)return toast('Choisis une mise.');if(b*n>S.cash)return toast('Pas assez d\'argent pour '+n+' billes.');
  for(let i=0;i<n;i++)setTimeout(async()=>{try{const r=await api('plinko',{amt:b});PL.balls.push({path:r.path,m:r.m,t0:performance.now(),bet:b,done:false});snd('chip');if(PL.balls.length===1)requestAnimationFrame(plLoop)}catch(e){}},i*T(260))};
function plGeom(c){const w=c.clientWidth,h=w*1.05,sx=w/14,sy=(h-70)/12;return{w,h,sx,sy,top:24}}
function plPos(G,r,s){return[G.w/2+(s-r/2)*G.sx,G.top+r*G.sy]}
function plLoop(n){const step=T(115);PL.balls.forEach(b=>{if(b.done)return;if((n-b.t0)/step>=13){b.done=true;PL.last=b.path[12];PL.lastT=n;snd(b.m>=2?'win':'tick');if(b.m>=4)burst(14)}});
  PL.balls=PL.balls.filter(b=>!b.done||n-b.t0<13*step+200);plDraw(n);if(PL.balls.length)requestAnimationFrame(plLoop)}
function plDraw(n=performance.now()){const c=$('#plc');if(!c)return;const G=plGeom(c),dpr=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(G.w*dpr)){c.width=Math.round(G.w*dpr);c.height=Math.round(G.h*dpr);c.style.height=G.h+'px'}
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,G.w,G.h);g.fillStyle='rgba(244,237,227,.75)';
  for(let r=0;r<12;r++)for(let j=0;j<r+3;j++){const x=G.w/2+(j-(r+2)/2)*G.sx,y=G.top+r*G.sy+G.sy*.5;g.beginPath();g.arc(x,y,2.6,0,Math.PI*2);g.fill()}
  const by=G.top+12*G.sy+8;D.PLM.forEach((m,k)=>{const x=G.w/2+(k-6)*G.sx,hot=PL.last===k&&n-PL.lastT<500;const col=m>=4?'#ff5f6d':m>=2?'#e08a1e':m>=1.1?'#e3b558':m>=1?'#5fd39a':'#2d6cdf';
    g.fillStyle=col;g.globalAlpha=hot?1:.85;const bw=G.sx-3,bh=26;g.beginPath();g.roundRect(x-bw/2,by+(hot?4:0),bw,bh,6);g.fill();g.globalAlpha=1;g.fillStyle='#160f1a';g.font=`700 ${G.sx<26?8:9.5}px "JetBrains Mono",monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText(m+'×',x,by+bh/2+(hot?4:0))});
  const step=T(115);PL.balls.forEach(b=>{if(b.done)return;const k=Math.min(12.999,(n-b.t0)/step),r=Math.floor(k),f=k-r;const[x0,y0]=plPos(G,r,b.path[r]);const[x1,y1]=r<12?plPos(G,r+1,b.path[r+1]):[x0,by];
    const x=x0+(x1-x0)*f,y=y0+(y1-y0)*f-Math.sin(Math.PI*f)*G.sy*.35;g.beginPath();g.arc(x,y,6,0,Math.PI*2);const gr=g.createRadialGradient(x-2,y-2,1,x,y,6);gr.addColorStop(0,'#fff3c4');gr.addColorStop(1,'#e08a1e');g.fillStyle=gr;g.fill()})}

/* ---------- Plus haut plus bas ---------- */
const HV=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
let HL={phase:'idle',card:null,prev:null,mult:1,bet:0,steps:0,skips:3,msg:'',cls:''};
BUSY.push(()=>HL.phase==='run');
const hProb=(c,up)=>{const r=HV.indexOf(c.r);return up?(12-r)/13:r/13};
GAME_VIEW.hilo=el=>{const run=HL.phase==='run';const c=HL.card||{r:'7',s:'♥'};const pu=hProb(c,true),pd=hProb(c,false);
  el.innerHTML=`<div class="felt"><div class="hilo" id="hlBox"></div><div class="msg ${HL.cls}" id="hlMsg">${HL.msg||(run?'Multiplicateur '+x2(HL.mult)+' · '+HL.steps+' bonne(s) réponse(s)':'La carte suivante sera-t-elle plus haute ou plus basse ? L\'As est la plus forte.')}</div></div>
  ${run?`<div class="row2"><button class="btn gold" data-act="hlg" data-v="1" ${pu?'':'disabled'}>▲ Plus haut · ${pu?x2(.96/pu*HL.mult):'—'}</button><button class="btn gold" data-act="hlg" data-v="0" ${pd?'':'disabled'}>▼ Plus bas · ${pd?x2(.96/pd*HL.mult):'—'}</button></div>
    <div class="row2"><button class="btn" data-act="hlskip" ${HL.skips?'':'disabled'}>Passer la carte (${HL.skips})</button><button class="btn" data-act="hlout" ${HL.steps?'':'disabled'}>Encaisser ${eur(HL.bet*HL.mult)}</button></div>`
  :`${stakeUI('hilo')}<button class="btn gold big" data-act="hlgo">Commencer · <span data-sl="hilo">${eur(ST.hilo)}</span></button>`}<p class="note">Carte identique = perdu.</p>`;
  const box=$('#hlBox');if(HL.prev){const p=cardEl(HL.prev,false,false,true);p.classList.add('ghost');box.appendChild(p)}box.appendChild(cardEl(c,!HL.card,false,true))};
ACT.hlgo=async()=>{if(!canBet(ST.hilo))return;try{const r=await api('hlStart',{amt:ST.hilo});HL={phase:'run',card:r.card,prev:null,mult:1,bet:r.bet,steps:0,skips:3,msg:'',cls:''};snd('card');render()}catch(e){}};
ACT.hlskip=async()=>{try{const r=await api('hlSkip');HL.prev=r.prev;HL.card=r.card;HL.skips=r.skips;snd('card');render()}catch(e){}};
ACT.hlg=async el=>{try{const r=await api('hlGuess',{up:el.dataset.v==='1'});HL.prev=r.prev;HL.card=r.card;snd('card');
  if(r.ok){HL.mult=r.mult;HL.steps=r.steps;HL.msg='';snd('pop')}else{HL.phase='done';HL.msg='Raté ! Perdu '+eur(HL.bet);HL.cls='lose';shake()}render()}catch(e){}};
ACT.hlout=async()=>{try{const r=await api('hlOut');HL.phase='done';HL.msg='Encaissé '+x2(r.mult)+' : +'+eur(r.payout-HL.bet);HL.cls='win';burst(14);snd('win');render()}catch(e){}};

/* ---------- Le 421 ---------- */
let DI={phase:'idle',d:[4,2,1],keep:[0,0,0],rolls:0,dd:[6,6,6],msg:'Fais mieux que le croupier en 3 lancers maximum.',cls:'',score:'4-2-1',dscore:''};
BUSY.push(()=>DI.phase!=='idle'&&DI.phase!=='done');
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=(v,i,keep,act,red)=>`<button class="die ${keep?'keep':''} ${red?'red':''}" ${act?`data-act="dikeep" data-v="${i}"`:'tabindex="-1"'} aria-label="Dé ${v}">${Array.from({length:9},(_,k)=>`<i class="${PIPS[v].includes(k)?'p':''}"></i>`).join('')}</button>`;
GAME_VIEW.d421=el=>{const play=DI.phase==='roll',bz=DI.phase==='busy'||DI.phase==='dealer';
  el.innerHTML=`<div class="felt"><div class="dlab">Croupier ${DI.dscore?'· '+DI.dscore:''}</div><div class="dice" id="dd" style="margin:8px 0 16px">${DI.dd.map((v,i)=>dieHTML(v,i,0,0,1)).join('')}</div>
    <div class="msg ${DI.cls}">${DI.msg}</div><div class="dice" id="pd">${DI.d.map((v,i)=>dieHTML(v,i,DI.keep[i],play)).join('')}</div><div class="dlab" style="margin-top:12px">Toi · ${DI.score}${play?' · lancer '+DI.rolls+'/3':''}</div></div>
  ${play||bz?`<p class="note center">Touche les dés à garder, puis relance.</p><div class="row2"><button class="btn" data-act="diroll" ${DI.rolls>=3||bz?'disabled':''}>Relancer</button><button class="btn gold" data-act="distop" ${bz?'disabled':''}>Je garde</button></div>`
  :`${stakeUI('d421')}<button class="btn gold big" data-act="digo">Lancer les dés · <span data-sl="d421">${eur(ST.d421)}</span></button>`}
  <ul class="note" style="padding-left:18px;margin:0"><li>421 : ×10 · Brelan d'As : ×6 · Brelan : ×4 · Suite : ×3 · Victoire simple : ×2</li><li>Égalité : mise rendue.</li></ul>`};
async function shakeDice(sel,mask){$$(sel+' .die').forEach((d,i)=>{if(!mask||!mask[i])d.classList.add('roll')});snd('card');await sleep(T(500))}
ACT.digo=async()=>{if(!canBet(ST.d421))return;try{DI.phase='busy';const r=await api('diStart',{amt:ST.d421});Object.assign(DI,{d:r.d,rolls:1,keep:[0,0,0],msg:'',cls:'',score:r.score.l,dscore:''});render();await shakeDice('#pd');DI.phase='roll';render()}catch(e){DI.phase='idle'}};
ACT.dikeep=el=>{const i=+el.dataset.v;DI.keep[i]=DI.keep[i]?0:1;snd('tick');render()};
ACT.diroll=async()=>{if(DI.phase!=='roll')return;DI.phase='busy';try{const r=await api('diRoll',{keep:DI.keep});const k=[...DI.keep];Object.assign(DI,{d:r.d,rolls:r.rolls,score:r.score.l});render();await shakeDice('#pd',k);
  DI.phase='roll';if(r.rolls>=3||r.score.v===1000)return ACT.distop();render()}catch(e){DI.phase='roll';render()}};
ACT.distop=async()=>{DI.phase='dealer';DI.msg='Au tour du croupier…';render();let r;try{r=await api('diStop')}catch(e){DI.phase='idle';return}
  for(const st of r.seq){DI.dd=st.d;render();await shakeDice('#dd',st.keep);await sleep(T(350))}
  DI.dscore=r.dealer.l;if(r.payout>r.bet){DI.msg=`${r.player.l} bat ${r.dealer.l} : +${eur(r.payout-r.bet)}`;DI.cls='win';burst(14);snd('win')}else if(r.payout){DI.msg='Égalité, mise rendue.';DI.cls=''}else{DI.msg=`${r.dealer.l} bat ${r.player.l}. Perdu ${eur(r.bet)}`;DI.cls='lose'}
  DI.phase='done';render()};

/* ---------- Tickets à gratter ---------- */
let GR={t:null,cells:[],win:0,done:true,ticket:'p'};
BUSY.push(()=>GR.t&&!GR.done);
GAME_VIEW.gratte=el=>{const t=D.TICKETS.find(x=>x.id===GR.ticket);
  el.innerHTML=`<div class="seg">${D.TICKETS.map(x=>`<button data-act="grt" data-v="${x.id}" class="${GR.ticket===x.id?'on':''}">${x.nm} · ${eur(x.pr)}</button>`).join('')}</div>
  ${GR.t?`<div class="scratch" style="background:linear-gradient(135deg,${GR.t.c},#2a1d05)"><div class="grid9">${GR.cells.map(v=>`<div class="${GR.done&&GR.win&&v===GR.win*GR.t.pr?'w':''}">${eur(v)}</div>`).join('')}</div>${GR.done?'':'<canvas id="scr" aria-label="Zone à gratter"></canvas>'}</div>
    <div class="msg ${GR.done?(GR.win?'win':'lose'):''}">${GR.done?(GR.win?'Trois fois '+eur(GR.win*GR.t.pr)+' : gagné !':'Pas de chance cette fois.'):'Gratte avec ton doigt. Trois montants identiques = tu gagnes ce montant.'}</div>${GR.done?'':'<button class="btn" data-act="grall">Tout gratter</button>'}`:'<div class="empty">Choisis un ticket et achète-le pour commencer.</div>'}
  <button class="btn gold big" data-act="grbuy" ${GR.t&&!GR.done?'disabled':''}>Acheter un ${t.nm} · ${eur(t.pr)}</button><p class="note">Gros lot : 1 000 fois le prix du ticket.</p>`;if(GR.t&&!GR.done)grInit()};
ACT.grt=el=>{if(GR.t&&!GR.done)return;GR.ticket=el.dataset.v;render()};
ACT.grbuy=async()=>{const t=D.TICKETS.find(x=>x.id===GR.ticket);if(!canBet(t.pr))return;try{const r=await api('gratte',{t:t.id});GR={...GR,t,cells:r.cells,win:r.mult,done:false};snd('chip');render()}catch(e){}};
function grInit(){const c=$('#scr');if(!c)return;const r=c.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);c.width=r.width*dpr;c.height=r.height*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);
  const gr=g.createLinearGradient(0,0,r.width,r.height);gr.addColorStop(0,'#cfcfd4');gr.addColorStop(.5,'#9a9aa2');gr.addColorStop(1,'#d9d9de');g.fillStyle=gr;g.fillRect(0,0,r.width,r.height);
  g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<400;i++)g.fillRect(Math.random()*r.width,Math.random()*r.height,1.5,1.5);g.fillStyle='#55555c';g.font='800 18px "Unbounded",sans-serif';g.textAlign='center';g.fillText('GRATTE ICI',r.width/2,r.height/2+6);
  g.globalCompositeOperation='destination-out';let down=false,n=0,last=null;const at=e=>{const b=c.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
  const scr=e=>{const[x,y]=at(e);g.lineWidth=34;g.lineCap='round';g.beginPath();if(last)g.moveTo(last[0],last[1]);else g.moveTo(x,y);g.lineTo(x,y);g.stroke();last=[x,y];if(++n%8===0){if(Math.random()<.5)snd('tick');grCheck(c,g)}};
  c.onpointerdown=e=>{down=true;last=null;c.setPointerCapture(e.pointerId);scr(e)};c.onpointermove=e=>{if(down)scr(e)};c.onpointerup=c.onpointercancel=()=>{down=false;last=null;grCheck(c,g)}}
function grCheck(c,g){const d=g.getImageData(0,0,c.width,c.height).data;let clear=0,tot=0;for(let i=3;i<d.length;i+=64){tot++;if(d[i]===0)clear++}if(clear/tot>.55)grDone()}
ACT.grall=()=>grDone();
function grDone(){if(GR.done)return;GR.done=true;quiet(api('grDone'));render();if(GR.win){burst(GR.win>=20?36:14);snd(GR.win>=20?'big':'win')}}

/* ---------- Duel pile ou face ---------- */
let DU={opp:null,side:0,busy:false,rot:0,msg:'Choisis un joueur en ligne (ou le croupier), ta mise et ton côté.',cls:''};
BUSY.push(()=>DU.busy);
GAME_VIEW.duel=el=>{const opps=ONLINE.filter(p=>p.id!==S.id);if(DU.opp&&DU.opp!=='bot'&&!opps.some(p=>p.id===DU.opp))DU.opp=null;if(!DU.opp)DU.opp='bot';
  el.innerHTML=`<div class="opp"><button data-act="duopp" data-v="bot" class="${DU.opp==='bot'?'on':''}"><span class="av">🎩</span><b>Le croupier</b><span class="note">toujours dispo</span></button>
    ${opps.slice(0,8).map(p=>`<button data-act="duopp" data-v="${p.id}" class="${DU.opp===p.id?'on':''}"><span class="av">${p.face}</span><b>${esc(p.pseudo)}</b><span class="note">niv. ${p.lvl}</span></button>`).join('')}</div>
  ${opps.length?'':'<p class="note">Personne d\'autre n\'est en ligne pour l\'instant. Invite tes potes !</p>'}
  <div class="felt"><div class="coinwrap"><div class="coin3d" id="coin" style="transform:rotateY(${DU.rot}deg)"><div>PILE</div><div class="bk">FACE</div></div></div><div class="msg ${DU.cls}">${esc(DU.msg)}</div></div>
  ${stakeUI('duel')}<div class="row2"><button class="btn ${DU.side===0?'gold':''}" data-act="duside" data-v="0">Pile</button><button class="btn ${DU.side===1?'gold':''}" data-act="duside" data-v="1">Face</button></div>
  <button class="btn gold big" data-act="dugo" ${DU.busy?'disabled':''}>${DU.opp==='bot'?'Lancer la pièce':'Envoyer le défi'} · <span data-sl="duel">${eur(ST.duel)}</span></button><p class="note">Le gagnant rafle la mise des deux joueurs. Un vrai joueur a 45 secondes pour accepter.</p>`};
ACT.duopp=el=>{if(DU.busy)return;DU.opp=el.dataset.v==='bot'?'bot':+el.dataset.v;render()};
ACT.duside=el=>{if(DU.busy)return;DU.side=+el.dataset.v;render()};
async function coinFlip(res){const nr=Math.ceil(DU.rot/360)*360+360*(RM?1:8)+(res?180:0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));DU.rot=nr;const cn=$('#coin');if(cn)cn.style.transform=`rotateY(${nr}deg)`;snd('pop');await sleep(T(2300))}
ACT.dugo=async()=>{if(DU.busy||!canBet(ST.duel))return;
  if(DU.opp==='bot'){DU.busy=true;DU.msg='Le croupier lance la pièce…';DU.cls='';render();let r;try{r=await api('duelBot',{amt:ST.duel,side:DU.side})}catch(e){DU.busy=false;render();return}
    await coinFlip(r.res);DU.busy=false;DU.msg=(r.res?'Face':'Pile')+(r.win?' ! Gagné +'+eur(ST.duel):' … perdu '+eur(ST.duel));DU.cls=r.win?'win':'lose';if(r.win){burst(16);snd('win')}else snd('lose');render();return}
  try{await api('duelAsk',{to:DU.opp,amt:ST.duel,side:DU.side});DU.msg='Défi envoyé ! En attente de la réponse…';DU.cls='gold';render()}catch(e){}};
on('duelAsk',d=>{whenFree(()=>{modal(`<p class="mt">🪙 Défi en duel !</p><p><b>${esc(d.from)}</b> te défie à pile ou face pour <b>${eur(d.amt)}</b>. Il a choisi ${d.side}.</p><div class="row2"><button class="btn" data-act="duans" data-v="0" data-id="${d.id}">Refuser</button><button class="btn gold" data-act="duans" data-v="1" data-id="${d.id}">Accepter</button></div>`);snd('ring')})});
ACT.duans=async el=>{closeModal();try{const r=await api('duelAnswer',{id:+el.dataset.id,yes:el.dataset.v==='1'});if(r.refused)return;showDuel(r)}catch(e){}};
on('duelFlip',d=>showDuel(d));
async function showDuel(d){go('casino','duel');DU.busy=true;DU.msg=`${d.a} contre ${d.b} : la pièce tourne…`;DU.cls='';render();await coinFlip(d.res);DU.busy=false;
  DU.msg=`${d.res?'Face':'Pile'} ! ${d.win?'Tu gagnes '+eur(d.amt*2):d.winner+' gagne. −'+eur(d.amt)}`;DU.cls=d.win?'win':'lose';if(d.win){burst(16);snd('win')}else snd('lose');render()}

/* ---------- Bonneteau ---------- */
let BN={phase:'idle',pos:[0,1,2],ball:1,lift:-1,msg:'Suis la bille sous les gobelets. Paie ×2,8.',cls:'',cheat:false};
BUSY.push(()=>BN.phase==='shuffle'||BN.phase==='pick');
const CUPX=[6,36,66];
GAME_VIEW.bonneteau=el=>{el.innerHTML=`<div class="felt"><div class="cups" id="cups"><div class="ball" style="left:${CUPX[BN.pos[BN.ball]]+14}%;${BN.lift===BN.ball&&!BN.cheat?'':'opacity:0'}"></div>${[0,1,2].map(id=>`<button class="cup ${BN.lift===id?'lift':''}" data-act="bnpick" data-v="${id}" style="left:${CUPX[BN.pos[id]]}%" ${BN.phase==='pick'?'':'tabindex="-1"'} aria-label="Gobelet"><span class="c"></span></button>`).join('')}</div><div class="msg ${BN.cls}">${BN.msg}</div></div>
  ${BN.phase==='pick'?'<p class="note center">Touche le gobelet qui cache la bille.</p>':`${stakeUI('bn')}<button class="btn gold big" data-act="bngo" ${BN.phase==='shuffle'?'disabled':''}>Miser et mélanger · <span data-sl="bn">${eur(ST.bn)}</span></button>`}<p class="note">Le bonimenteur est rapide… et parfois pas très honnête.</p>`};
ACT.bngo=async()=>{if(BN.phase==='shuffle'||!canBet(ST.bn))return;let r;try{r=await api('bnStart',{amt:ST.bn})}catch(e){return}
  BN={...BN,phase:'shuffle',pos:[0,1,2],ball:r.ball,lift:r.ball,cheat:false,msg:'Regarde bien…',cls:''};BN.bet=ST.bn;render();await sleep(T(700));BN.lift=-1;render();await sleep(T(350));
  for(let s=0;s<r.swaps.length;s++){const[a,b]=r.swaps[s];const ia=BN.pos.indexOf(a),ib=BN.pos.indexOf(b);[BN.pos[ia],BN.pos[ib]]=[BN.pos[ib],BN.pos[ia]];$$('#cups .cup').forEach(c=>{c.style.left=CUPX[BN.pos[+c.dataset.v]]+'%'});snd('tick');await sleep(T(Math.max(170,320-s*15)))}
  BN.phase='pick';BN.msg='Alors, elle est où ?';render()};
ACT.bnpick=async el=>{if(BN.phase!=='pick')return;const id=+el.dataset.v;BN.phase='reveal';let r;try{r=await api('bnPick',{cup:id})}catch(e){BN.phase='idle';return}
  BN.cheat=r.cheat;BN.lift=id;BN.msg=r.win?'Bien vu ! +'+eur(r.payout-BN.bet):r.cheat?'Aucune bille ! Le bonimenteur l\'a escamotée…':'Raté, elle était ailleurs.';BN.cls=r.win?'win':'lose';render();
  if(r.win){burst(14);snd('win')}else snd('lose');if(!r.win&&!r.cheat){await sleep(T(600));BN.lift=BN.ball;render()}BN.phase='idle'};

/* ---------- Machine à pince ---------- */
let PZ={x:50,busy:false,price:100,prizes:[],msg:'Place la pince au-dessus d\'un objet, puis descends.',cls:''};
BUSY.push(()=>PZ.busy);
GAME_VIEW.pince=el=>{if(!PZ.prizes.length){api('pzPrizes',{price:PZ.price}).then(r=>{PZ.prizes=r.prizes;render()}).catch(()=>{});el.innerHTML='<div class="empty">Chargement de la machine…</div>';return}
  el.innerHTML=`<div class="seg">${D.PZPRICE.map(p=>`<button data-act="pzp" data-v="${p}" class="${PZ.price===p?'on':''}">Essai à ${eur(p)}</button>`).join('')}</div>
  <div class="claw" id="claw"><div class="arm" id="arm" style="left:${PZ.x}%"><div class="rope" id="rope"></div><div class="hook">🪝</div></div>${PZ.prizes.map((p,i)=>`<div class="prize" id="pz${i}" style="left:${p.x}%">${p.ic}<small>${short(p.v)}</small></div>`).join('')}<div class="glass"></div></div>
  <div class="msg ${PZ.cls}">${PZ.msg}</div>
  <div class="row3"><button class="btn" data-act="pzmove" data-v="-6" ${PZ.busy?'disabled':''}>◀</button><button class="btn gold" data-act="pzgo" ${PZ.busy?'disabled':''}>Descendre · ${eur(PZ.price)}</button><button class="btn" data-act="pzmove" data-v="6" ${PZ.busy?'disabled':''}>▶</button></div>
  <p class="note">Les objets ont tendance à glisser au dernier moment. C'est le jeu.</p>`};
ACT.pzp=async el=>{if(PZ.busy)return;PZ.price=+el.dataset.v;try{const r=await api('pzPrizes',{price:PZ.price});PZ.prizes=r.prizes;render()}catch(e){}};
ACT.pzmove=el=>{if(PZ.busy)return;PZ.x=Math.max(6,Math.min(94,PZ.x+ +el.dataset.v));const a=$('#arm');if(a)a.style.left=PZ.x+'%';snd('tick')};
ACT.pzgo=async()=>{if(PZ.busy||!canBet(PZ.price))return;let r;try{r=await api('pzGo',{x:PZ.x})}catch(e){return}PZ.busy=true;PZ.msg='La pince descend…';PZ.cls='';render();
  const rope=$('#rope');await sleep(30);rope.style.height='190px';await sleep(T(950));
  if(r.grab){const pe=$('#pz'+r.i);pe.style.transition=`bottom ${RM?.1:.9}s ease-in-out`;rope.style.height='30px';pe.style.bottom='200px';await sleep(T(500));
    if(r.slip){pe.style.bottom='12px';PZ.msg='NOOON ! Ça a glissé au dernier moment…';PZ.cls='lose';snd('lose')}else{await sleep(T(450));PZ.msg=`Attrapé : ${r.prize.ic} d'une valeur de ${eur(r.payout)} !`;PZ.cls='win';burst(20);snd('big')}}
  else{rope.style.height='30px';await sleep(T(900));PZ.msg=r.near?'La pince a frôlé l\'objet… sans le prendre.':'La pince a attrapé du vide.';PZ.cls='lose'}
  PZ.prizes=r.prizes;PZ.busy=false;render()};
