/* ====================== Crash en direct ====================== */
let CR=null,crAuto=0,crLoopOn=false;
BUSY.push(()=>false);
GAME_VIEW.crash=el=>{
  el.innerHTML=`<div class="chist" id="crHist"></div><div class="crashbox"><canvas id="crc"></canvas><div class="cmult" id="crm">…</div></div>
  <div id="crCtl" class="section"></div><h3>Sur ce vol</h3><div class="bots" id="crBots"></div>
  <p class="note">Tout le monde joue la même fusée. Elle peut exploser à tout moment, même à ×1,00.</p>`;
  quiet(api('crashJoin'));onLeave(()=>quiet(api('crashLeave')));crRender();crStart()};
on('crash',d=>{const prev=CR;CR=d;CR.pts=[];if(prev&&prev.phase==='fly'&&d.phase==='end'){const mine=d.bets.find(b=>b.uid===S.id);snd('boom');vib(200);if(mine&&!mine.out)shake()}
  if(prev&&prev.phase!=='fly'&&d.phase==='fly')snd('pop');if(tab==='casino'&&sub.casino==='crash')crRender()});
on('crashWin',d=>{burst(d.m>=5?30:12);snd(d.m>=5?'big':'win');toast('Encaissé à '+x2(d.m)+' : +'+eur(d.gain))});
function crMine(){return CR&&CR.bets.find(b=>b.uid===S.id)}
function crRender(){if(!CR||!$('#crCtl'))return;$('#crHist').innerHTML=CR.hist.map(h=>`<span class="${h<2?'lo':'hi'}">${x2(h)}</span>`).join('');
  const m=crMine(),c=$('#crCtl');const mode=CR.phase+(m?(m.out?'o':'m'):'0')+CR.round;
  if(c.dataset.mode===mode&&CR.phase!=='end'){}else if(CR.phase==='bet'){c.innerHTML=m?`<div class="lrow2"><span>Ta mise : <b class="num">${eur(m.amt)}</b>${crAuto?' · auto '+x2(crAuto):''}</span><span class="note">Décollage dans <b data-secs="${CR.endsAt}">${secs(CR.endsAt)}</b> s</span></div>`
    :stakeUI('crash')+`<div class="seg">${[[0,'Auto : non'],[1.5,'×1,5'],[2,'×2'],[5,'×5'],[10,'×10']].map(([v,l])=>`<button data-act="crauto" data-v="${v}" class="${crAuto===v?'on':''}">${l}</button>`).join('')}</div>
    <div class="countdown"><span>Décollage dans <b data-secs="${CR.endsAt}">${secs(CR.endsAt)}</b> s</span>${timerBar(CR.endsAt,8000)}</div><button class="btn gold big" data-act="crgo">Miser · <span data-sl="crash">${eur(ST.crash)}</span></button>`}
  else if(CR.phase==='fly'){c.innerHTML=m?(m.out?`<button class="btn big" disabled>Encaissé à ${x2(m.out)} · +${eur(m.amt*m.out-m.amt)}</button>`:`<button class="btn gold big" data-act="crout" id="crOut">Encaisser</button>`):`<div class="empty">Vol en cours. Mise au prochain décollage !</div>`}
  else c.innerHTML=`<div class="empty">Prochain vol dans <b data-secs="${CR.endsAt}">${secs(CR.endsAt)}</b> s…</div>`;
  c.dataset.mode=mode;
  $('#crBots').innerHTML=CR.bets.length?CR.bets.map(b=>`<div><span>${b.face} ${esc(b.pseudo)} · ${eur(b.amt)}</span><span class="${b.out?'ok':CR.phase==='end'?'ko':''}">${b.out?'encaissé '+x2(b.out):CR.phase==='end'?'explosé':'en vol…'}</span></div>`).join(''):'<div><span class="note">Personne n\'a encore misé.</span></div>';
  const e=$('#crm');if(CR.phase==='end'){e.textContent=(m&&m.out?x2(m.out)+' · ':'')+'CRASH '+x2(CR.crashAt);e.className='cmult '+(m&&m.out?'ok':'boom')}else if(CR.phase==='bet'){e.textContent='×1,00';e.className='cmult'}}
ACT.crauto=el=>{crAuto=+el.dataset.v;crRender()};
ACT.crgo=async()=>{if(!canBet(ST.crash))return;await quiet(api('crashBet',{amt:ST.crash,auto:crAuto}));snd('chip')};
ACT.crout=()=>quiet(api('crashOut'));
function crStart(){if(crLoopOn)return;crLoopOn=true;const loop=()=>{if(!$('#crc')){crLoopOn=false;return}
  if(CR&&CR.phase==='fly'){const ms=now()-CR.start,mm=Math.floor(D.crashM(ms)*100)/100;CR.pts.push([ms,mm]);const e=$('#crm');if(e){const m=crMine();e.textContent=x2(mm);e.className='cmult'+(m&&m.out?' ok':'')}
    const ob=$('#crOut'),m=crMine();if(ob&&m)ob.textContent='Encaisser · '+eur(m.amt*mm)}
  crDraw();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
function crDraw(){const c=$('#crc');if(!c||!CR)return;const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(c.width!==w*dpr){c.width=w*dpr;c.height=h*dpr}
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);let pts=CR.pts||[];
  if(CR.phase==='end'&&!pts.length){const total=Math.log(CR.crashAt)/.00013;for(let t=0;t<=total;t+=total/60)pts.push([t,D.crashM(t)]);CR.pts=pts}
  const tMax=Math.max(8000,(pts.at(-1)?.[0]||0)*1.15),mMax=Math.max(2,(pts.at(-1)?.[1]||1)*1.25);const X=t=>16+t/tMax*(w-40),Y=m=>h-20-(m-1)/(mMax-1)*(h-80);
  g.strokeStyle='rgba(169,152,171,.14)';g.lineWidth=1;g.fillStyle='rgba(169,152,171,.6)';g.font='10px "JetBrains Mono",monospace';
  [1,1.5,2,3,5,10,20,50,100].filter(m=>m<=mMax).forEach(m=>{const y=Y(m);g.beginPath();g.moveTo(16,y);g.lineTo(w,y);g.stroke();g.fillText(x2(m),w-44,y-3)});
  if(!pts.length||CR.phase==='bet')return;const boom=CR.phase==='end';const col=boom?'#ff7a6b':(getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()||'#e3b558');
  g.beginPath();g.moveTo(X(0),Y(1));pts.forEach(([t,m])=>g.lineTo(X(t),Y(m)));g.strokeStyle=col;g.lineWidth=3;g.stroke();g.lineTo(X(pts.at(-1)[0]),h-20);g.lineTo(X(0),h-20);g.closePath();
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,col+'55');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fill();const[lt,lm]=pts.at(-1);g.font='28px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(boom?'💥':'🚀',X(lt),Y(lm));g.textAlign='start';g.textBaseline='alphabetic'}

/* ====================== Roulette en direct ====================== */
const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const colOf=n=>n===0?'g':REDS.has(n)?'r':'k';
const SEG=2*Math.PI/37;
const BLABEL={red:'Rouge',black:'Noir',even:'Pair',odd:'Impair',low:'1-18',high:'19-36',d1:'1-12',d2:'13-24',d3:'25-36',c1:'2:1',c2:'2:1',c3:'2:1'};
let RO={st:null,local:{},mine:{},chip:10,wa:0,rel:-Math.PI/2,r:.595,anim:null,spunFor:0};
const sumB=o=>Object.values(o).reduce((a,b)=>a+b,0);
GAME_VIEW.ro=el=>{
  el.innerHTML=`<div class="felt"><div class="wheelwrap"><canvas id="wheel" aria-label="Roue de roulette"></canvas><div class="rres" id="rres"></div></div><div class="hist" id="rhist"></div><div class="msg" id="roMsg"></div><div id="roTime"></div></div>
  <div class="players" id="roPl"></div>
  <div class="board" id="board"><button class="bz" data-act="rob" data-b="n0">0</button>
    <div class="bnums">${Array.from({length:36},(_,i)=>i+1).map(n=>`<button class="${colOf(n)}" data-act="rob" data-b="n${n}">${n}</button>`).join('')}</div>
    <div class="b3">${[1,2,3].map(c=>`<button class="bo" data-act="rob" data-b="c${c}">2:1</button>`).join('')}</div>
    <div class="b3">${[1,2,3].map(d=>`<button class="bo" data-act="rob" data-b="d${d}">${BLABEL['d'+d]}</button>`).join('')}</div>
    <div class="b6"><button class="bo" data-act="rob" data-b="low">1-18</button><button class="bo" data-act="rob" data-b="even">Pair</button><button class="bo r" data-act="rob" data-b="red" aria-label="Rouge">◆</button><button class="bo k" data-act="rob" data-b="black" aria-label="Noir">◆</button><button class="bo" data-act="rob" data-b="odd">Impair</button><button class="bo" data-act="rob" data-b="high">19-36</button></div></div>
  <div class="stake"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted)"><span>Choisis un jeton, puis tape le tapis</span><b class="num" style="color:var(--fg)" id="roTot"></b></div>
    <div class="rack" id="roRack">${RACK.filter(v=>v<=Math.max(1000,S.cash*1.01)).map(v=>chipBtn(v,`data-act="rochip" data-v="${v}"`,RO.chip===v?'on':'')).join('')}</div>
    <div class="row2"><button class="btn sm" data-act="roclr">Effacer mes jetons non validés</button><button class="btn sm" data-act="rorules">Gains</button></div></div>
  <button class="btn gold big" data-act="rogo" id="roGo">Valider mes mises</button>`;
  api('roJoin').then(r=>{RO.mine=r.mine||{};roUI()}).catch(()=>{});onLeave(()=>quiet(api('roLeave')));roStart();roUI()};
on('ro',d=>{const prev=RO.st;RO.st=d;if(d.phase==='bet'&&prev&&prev.phase!=='bet'){RO.mine={};RO.local={}}
  if(d.phase==='spin'&&RO.spunFor!==d.spinAt){RO.spunFor=d.spinAt;roSpin(d.n,d.spinAt)}if(tab==='casino'&&sub.casino==='ro')roUI()});
on('roRes',d=>{const p=d.payout-d.total;if(p>0){burst(p>=d.total*5?36:16);snd('big');toast(d.n+' ! Gagné +'+eur(p))}else if(d.payout)toast(d.n+' : tu récupères '+eur(d.payout));else toast(d.n+' : perdu '+eur(d.total))});
function roUI(){const d=RO.st;if(!d||!$('#board'))return;const all={...RO.mine};for(const k in RO.local)all[k]=(all[k]||0)+RO.local[k];
  $$('#board [data-b]').forEach(b=>{b.querySelector('.cchip')?.remove();const a=all[b.dataset.b];b.classList.toggle('hit',d.phase==='res'&&d.n!==null&&roWin(b.dataset.b,d.n));if(a)b.insertAdjacentHTML('beforeend',chipSpan(a))});
  $('#rhist').innerHTML=d.hist.slice(0,12).map(n=>`<span style="background:${n===0?'var(--green)':REDS.has(n)?'var(--red)':'var(--black)'}">${n}</span>`).join('');
  $('#roTot').textContent='Validé '+eur(sumB(RO.mine))+(sumB(RO.local)?' · en attente '+eur(sumB(RO.local)):'');
  const msg=$('#roMsg');msg.className='msg';msg.textContent=d.phase==='bet'?'Faites vos jeux !':d.phase==='spin'?'Rien ne va plus…':`${d.n} ${d.n===0?'vert':REDS.has(d.n)?'rouge':'noir'}`;
  $('#roTime').innerHTML=d.phase==='bet'?`<div class="countdown"><span>Lancement dans <b data-secs="${d.endsAt}">${secs(d.endsAt)}</b> s</span>${timerBar(d.endsAt,20000)}</div>`:'';
  $('#roPl').innerHTML=d.players.map(p=>`<span class="${p.pseudo===S.pseudo?'me':''} ${d.phase==='res'?(p.win>p.total?'ok':'ko'):''}">${p.face} ${esc(p.pseudo)} · ${eur(p.total)}${d.phase==='res'&&p.win?' → '+eur(p.win):''}</span>`).join('')||'<span class="note">Aucun joueur sur ce tour.</span>';
  const g=$('#roGo');g.disabled=d.phase!=='bet'||!sumB(RO.local);g.textContent=d.phase==='bet'?(sumB(RO.local)?'Valider mes mises · '+eur(sumB(RO.local)):'Pose tes jetons'):'Attends le prochain tour';
  if(d.phase==='res'&&$('#rres'))$('#rres').innerHTML=`<b style="background:${d.n===0?'var(--green)':REDS.has(d.n)?'var(--red)':'var(--black)'}">${d.n}</b>`;else if($('#rres'))$('#rres').innerHTML=''}
function roWin(k,n){if(k[0]==='n')return +k.slice(1)===n;if(n===0)return false;switch(k){case'red':return REDS.has(n);case'black':return!REDS.has(n);case'even':return n%2===0;case'odd':return n%2===1;case'low':return n<=18;case'high':return n>=19}
  if(k[0]==='d')return Math.ceil(n/12)===+k[1];if(k[0]==='c')return((n-1)%3)+1===+k[1];return false}
ACT.rochip=el=>{RO.chip=+el.dataset.v;snd('chip');$$('#roRack .cchip').forEach(c=>c.classList.toggle('on',+c.dataset.v===RO.chip))};
ACT.rob=el=>{if(!RO.st||RO.st.phase!=='bet')return toast('Attends le prochain tour.');const k=el.dataset.b;if(sumB(RO.local)+RO.chip>S.cash)return toast('Pas assez d\'argent pour ce jeton.');RO.local[k]=(RO.local[k]||0)+RO.chip;snd('chip');roUI()};
ACT.roclr=()=>{RO.local={};roUI()};
ACT.rogo=async()=>{const b=RO.local;if(!sumB(b))return;try{const r=await api('roBet',{bets:b});RO.mine=r.mine;RO.local={};if(r.moved)toast('🔥 Flambeur : ton jeton '+(BLABEL[r.moved[0]]||r.moved[0].slice(1))+' a glissé sur le '+r.moved[1].slice(1));snd('chip')}catch(e){}roUI()};
ACT.rorules=()=>modal(`<p class="mt">Gains de la roulette</p><ul><li>Un numéro plein : payé 35 fois la mise.</li><li>Douzaine ou colonne (2:1) : payé 2 fois.</li><li>Rouge, noir, pair, impair, 1-18, 19-36 : payé 1 fois.</li><li>Roulette européenne à un seul zéro. Si le 0 sort, seules les mises sur le 0 gagnent.</li><li>Un tour toutes les 30 secondes environ, pour tous les joueurs.</li></ul><button class="btn gold" data-close>Compris</button>`);
function buildWheel(px){const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d'),R=px/2;g.translate(R,R);const ring=(r,f)=>{g.beginPath();g.arc(0,0,R*r,0,Math.PI*2);g.fillStyle=f;g.fill()};
  const wood=g.createRadialGradient(0,0,R*.8,0,0,R);wood.addColorStop(0,'#5a3519');wood.addColorStop(1,'#2a170b');ring(1,wood);ring(.93,'#c99a3e');const track=g.createRadialGradient(0,0,R*.8,0,0,R*.91);track.addColorStop(0,'#3b2414');track.addColorStop(1,'#1d110a');ring(.91,track);
  for(let i=0;i<37;i++){const a0=-Math.PI/2+(i-.5)*SEG,n=WHEEL[i];g.beginPath();g.moveTo(0,0);g.arc(0,0,R*.8,a0,a0+SEG);g.closePath();g.fillStyle=n===0?'#1f8a5b':REDS.has(n)?'#c3343a':'#151215';g.fill();
    g.save();g.rotate(a0+SEG/2+Math.PI/2);g.fillStyle='#fff';g.font=`700 ${Math.round(px*.04)}px "JetBrains Mono",monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText(n,0,-R*.725);g.restore()}
  g.beginPath();g.arc(0,0,R*.65,0,Math.PI*2);g.fillStyle='rgba(0,0,0,.28)';g.fill();g.strokeStyle='#d8b25a';g.lineWidth=Math.max(1,px*.004);
  for(let i=0;i<37;i++){const a=-Math.PI/2+(i-.5)*SEG;g.beginPath();g.moveTo(Math.cos(a)*R*.53,Math.sin(a)*R*.53);g.lineTo(Math.cos(a)*R*.8,Math.sin(a)*R*.8);g.stroke()}
  g.beginPath();g.arc(0,0,R*.65,0,Math.PI*2);g.stroke();g.beginPath();g.arc(0,0,R*.8,0,Math.PI*2);g.stroke();const cone=g.createRadialGradient(-R*.1,-R*.1,R*.05,0,0,R*.54);cone.addColorStop(0,'#8a5a2c');cone.addColorStop(1,'#3a2212');ring(.54,cone);
  g.fillStyle='#d8b25a';for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2);g.fillRect(-R*.02,-R*.3,R*.04,R*.3);g.beginPath();g.arc(0,-R*.3,R*.04,0,Math.PI*2);g.fill();g.restore()}ring(.08,'#f0c96f');return c}
function roSpin(n,spinAt){const i=WHEEL.indexOf(n);let r1=-Math.PI/2+i*SEG;const r0=RO.rel;while(r1>r0-Math.PI*2*5)r1-=Math.PI*2;const left=Math.max(800,spinAt+6000-now());
  RO.anim={t0:performance.now(),dur:RM?600:left,w0:RO.wa,dw:Math.PI*2*(RM?.1:1.3),r0,r1,done(){RO.rel=((RO.rel%(Math.PI*2))+Math.PI*2)%(Math.PI*2);RO.wa%=Math.PI*2}}}
let roLoopOn=false;
function roStart(){const cvs=$('#wheel');if(!cvs)return;const css=Math.min(cvs.parentElement.clientWidth||300,300),dpr=Math.min(2,devicePixelRatio||1);cvs.width=cvs.height=Math.round(css*dpr);cvs.style.width=cvs.style.height=css+'px';RO.img=buildWheel(cvs.width);
  if(roLoopOn)return;roLoopOn=true;let last=performance.now(),lastTick=0;
  const loop=n=>{const c=$('#wheel');if(!c){roLoopOn=false;return}const dt=Math.min(.05,(n-last)/1000);last=n;
    if(RO.anim){const a=RO.anim,t=Math.min(1,(n-a.t0)/a.dur);RO.wa=a.w0+a.dw*easeOutCubic(t);const p=Math.min(1,t/.84);RO.rel=a.r0+(a.r1-a.r0)*easeOutQuart(p);
      let r=.855;if(p>.5){const q=Math.min(1,(p-.5)/.5);r=.855-(.855-.595)*easeInOut(q);if(q>.55&&q<1)r+=Math.abs(Math.sin(q*26))*.03*(1-q)}RO.r=r;const slot=Math.floor(RO.rel/SEG);if(slot!==lastTick&&p<1){lastTick=slot;if(p>.3)snd('tick')}
      if(t>=1){RO.anim=null;a.done()}}else RO.wa+=dt*(RM?0:.1);
    const g=c.getContext('2d'),W=c.width,R=W/2;g.clearRect(0,0,W,W);g.save();g.translate(R,R);g.rotate(RO.wa);g.drawImage(RO.img,-R,-R);g.restore();
    const ba=RO.wa+RO.rel,bx=R+Math.cos(ba)*R*RO.r,by=R+Math.sin(ba)*R*RO.r,br=R*.035;const bg=g.createRadialGradient(bx-br*.4,by-br*.4,br*.1,bx,by,br);bg.addColorStop(0,'#fff');bg.addColorStop(1,'#bdb6aa');
    g.beginPath();g.arc(bx,by,br,0,Math.PI*2);g.fillStyle=bg;g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=br;g.fill();g.shadowBlur=0;requestAnimationFrame(loop)};requestAnimationFrame(loop)}

/* ====================== Courses en direct ====================== */
let RCs=null,rcPick=null,rcMine=null;
function rRace(v){
  v.innerHTML=`<div id="rcWrap"></div>`;api('raceJoin').then(r=>{rcMine=r.mine;rcUI()}).catch(()=>{});onLeave(()=>quiet(api('raceLeave')));rcUI()}
on('race',d=>{const prev=RCs;RCs=d;if(prev&&prev.phase!=='bet'&&d.phase==='bet'){rcMine=null;rcPick=null}if(tab==='paris'&&sub.paris==='race'){if(prev&&prev.phase===d.phase&&d.phase==='run')rcMove();else if(prev&&prev.phase===d.phase&&d.phase==='bet'&&$('#rcPl'))rcPl();else rcUI()}});
on('raceRes',d=>{if(d.pay){burst(20);snd('big');toast('Ton cheval… enfin ton concurrent a gagné ! +'+eur(d.pay-d.amt))}else toast('Pari perdu sur cette course.')});
function rcUI(){const w=$('#rcWrap');if(!w||!RCs)return;const d=RCs,R=D.RACES[d.type];
  w.innerHTML=`<div class="lrow2"><b>${R.ic} ${R.nm}</b>${d.phase==='bet'?`<span class="note">Départ dans <b data-secs="${d.endsAt}">${secs(d.endsAt)}</b> s</span>`:d.phase==='run'?'<span class="livebadge" style="position:static">EN DIRECT</span>':'<span class="note">Arrivée</span>'}</div>
  ${d.phase==='bet'?timerBar(d.endsAt,25000):''}
  <div class="track ${R.cls}">${R.run.map((n,i)=>`<div class="lane"><span class="runner flip" id="rn${i}" style="left:calc(${d.pos[i]||0}% * .82);--rc:${R.col[i]}"><b>${i+1}</b><span>${R.ic}</span></span></div>`).join('')}</div>
  <div class="comm" id="comm">${esc(d.comm)}</div>
  <div class="runners">${R.run.map((n,i)=>`<button data-act="rcpick" data-v="${i}" class="${(rcMine?rcMine.runner:rcPick)===i?'on':''}" ${d.phase!=='bet'||rcMine?'disabled':''}><span><b style="color:${R.col[i]}">${i+1}</b> · ${n}${d.winner===i?' 🏆':''}</span><b class="num">${d.odds[i].toFixed(2).replace('.',',')}</b></button>`).join('')}</div>
  ${rcMine?`<div class="lrow2"><span>Ton pari : <b>${eur(rcMine.amt)}</b> sur le n°${rcMine.runner+1}</span></div>`:d.phase==='bet'?`${stakeUI('race')}<button class="btn gold big" data-act="rcgo" ${rcPick===null?'disabled':''}>${rcPick===null?'Choisis un concurrent':'Parier '+eur(ST.race)+' sur le n°'+(rcPick+1)}</button>`:''}
  <div class="players" id="rcPl"></div>`;rcPl()}
function rcPl(){const e=$('#rcPl');if(e)e.innerHTML=RCs.players.map(p=>`<span class="${p.pseudo===S.pseudo?'me':''}">${p.face} ${esc(p.pseudo)} · n°${p.runner+1} · ${eur(p.amt)}</span>`).join('')}
function rcMove(){const d=RCs;d.pos.forEach((x,i)=>{const e=$('#rn'+i);if(e)e.style.left=`calc(${Math.min(100,x)}% * .82)`});const c=$('#comm');if(c)c.textContent=d.comm}
ACT.rcpick=el=>{rcPick=+el.dataset.v;snd('tick');rcUI()};
stakeHook.race=()=>{const b=document.querySelector('[data-act="rcgo"]');if(b&&rcPick!==null)b.textContent='Parier '+eur(ST.race)+' sur le n°'+(rcPick+1)};
ACT.rcgo=async()=>{if(rcPick===null||!canBet(ST.race))return;try{await api('raceBet',{runner:rcPick,amt:ST.race});rcMine={runner:rcPick,amt:ST.race};snd('chip')}catch(e){}rcUI()};
