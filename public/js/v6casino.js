/* ====================== V6 : roulette à cheval, tirs au but, tickets à thème ====================== */
/* ---------- Roulette : tapis vertical (téléphone) ou horizontal (ordi), mises à cheval ---------- */
const RLAB=k=>{if(BLABEL[k])return BLABEL[k];const t=k[0],r=k.slice(1);if(t==='n')return'le '+r;if(t==='s')return'à cheval '+r.replace('-',' · ');if(t==='q')return r==='0'?'0-1-2-3':'carré '+(+r)+'-'+(+r+1)+'-'+(+r+3)+'-'+(+r+4);if(t==='t')return'transversale '+(3*r-2)+'-'+(3*r);if(t==='x')return'sixain '+(3*r-2)+' à '+(3*r+3);return k};
function roCover(k){const t=k[0],r=k.slice(1);if(t==='n')return[+r];if(t==='s')return r.split('-').map(Number);if(t==='q')return r==='0'?[0,1,2,3]:[+r,+r+1,+r+3,+r+4];if(t==='t')return[3*r-2,3*r-1,3*r];if(t==='x')return[3*r-2,3*r-1,3*r,3*r+1,3*r+2,3*r+3];return[]}
const _roWin=roWin;roWin=function(k,n){if('sqtx'.includes(k[0])&&k!=='c1')return roCover(k).includes(n);return _roWin(k,n)};
let RB=null;
function rbLayout(W){const hz=W>=620;if(hz){const zw=50,cw=(W-zw-56)/12,rh=54;return{hz,W,zw,cw,rh,H:3*rh+88}}const dz=46,ev=56,cw=(W-dz-ev)/3,zh=44,rh=Math.max(32,Math.min(40,cw*.62));return{hz,W,cw,rh,zh,dz,ev,H:zh+12*rh+38}}
function rbPx(L,u,v){return L.hz?[L.zw+v*L.cw,(3-u)*L.rh]:[u*L.cw,L.zh+v*L.rh]}
function rbKeyCenter(L,k){const t=k[0],r=k.slice(1),cr=n=>[(n-1)%3,(n-1)/3|0];
  if(t==='n'){const n=+r;if(n===0)return L.hz?[L.zw/2,1.5*L.rh]:[1.5*L.cw,L.zh/2];const[c,rr]=cr(n);return rbPx(L,c+.5,rr+.5)}
  if(t==='s'){const[a,b]=r.split('-').map(Number);if(a===0){const[c]=cr(b);return rbPx(L,c+.5,0)}const[c,rr]=cr(a);return b===a+1?rbPx(L,c+1,rr+.5):rbPx(L,c+.5,rr+1)}
  if(t==='q'){if(r==='0')return rbPx(L,0,0);const[c,rr]=cr(+r);return rbPx(L,c+1,rr+1)}
  if(t==='t')return rbPx(L,0,+r-.5);if(t==='x')return rbPx(L,0,+r);
  const b=document.querySelector(`#rbo [data-b="${k}"]`);if(!b)return[0,0];return[b.offsetLeft+b.offsetWidth/2,b.offsetTop+b.offsetHeight/2]}
function rbKeyAt(L,px,py){let u,v;if(L.hz){v=(px-L.zw)/L.cw;u=3-py/L.rh}else{u=px/L.cw;v=(py-L.zh)/L.rh}u=Math.max(0,Math.min(2.999,u));v=Math.max(0,Math.min(11.999,v));
  const c=Math.floor(u),r=Math.floor(v),fu=u-c,fv=v-r,E=.26,n=3*r+c+1;
  if(c===0&&fu<E){if(fv<E&&r>0)return'x'+r;if(fv>1-E&&r<11)return'x'+(r+1);if(fv<E&&r===0)return'q0';return't'+(r+1)}
  const xc=fu>1-E&&c<2?c+1:fu<E&&c>0?c-1:null,yr=fv>1-E&&r<11?r+1:fv<E&&r>0?r-1:null;
  if(fv<E&&r===0&&xc===null)return's0-'+n;
  if(xc!==null&&yr!==null){const cm=Math.min(c,xc),rm=Math.min(r,yr);return'q'+(3*rm+cm+1)}
  if(xc!==null){const m=3*r+Math.min(c,xc)+1;return's'+m+'-'+(m+1)}
  if(yr!==null){const m=3*Math.min(r,yr)+c+1;return's'+m+'-'+(m+3)}
  return'n'+n}
GAME_VIEW.ro=el=>{el.innerHTML=`<div class="felt ro6"><div class="wheelwrap6" id="ww"><canvas id="wheel" aria-label="Roue de roulette"></canvas><div class="rres" id="rres"></div></div>
    <div class="rotop"><div class="hist" id="rhist"></div><div class="msg" id="roMsg"></div><div id="roTime"></div></div></div>
  <div class="players" id="roPl"></div><div class="rbwrap"><div class="rb" id="rb"></div></div>
  <p class="note center" id="rbHint">Touche un numéro, une ligne entre deux numéros (à cheval) ou un coin (carré).</p>
  <div class="stake"><div class="betline2"><span>Choisis un jeton</span><b class="num" id="roTot"></b></div><div class="rack" id="roRack">${RACK.filter(v=>v<=Math.max(1000,S.cash*1.01)).map(v=>chipBtn(v,`data-act="rochip" data-v="${v}"`,RO.chip===v?'on':'')).join('')}</div>
    <div class="row4"><button class="btn sm" data-act="roundo">Annuler</button><button class="btn sm" data-act="rodbl">×2</button><button class="btn sm" data-act="rorep">Remiser</button><button class="btn sm" data-act="rorules">Gains</button></div></div>
  <button class="btn gold big" data-act="rogo" id="roGo">Valider mes mises</button>`;
  rbBuild();api('roJoin').then(r=>{RO.mine=r.mine||{};roUI()}).catch(()=>{});onLeave(()=>quiet(api('roLeave')));roStart();roUI()};
function rbBuild(){const box=$('#rb');if(!box)return;const L=rbLayout(box.parentElement.clientWidth);RB=L;box.style.height=L.H+'px';let h='';
  const btn=(k,x,y,w,hh,lab,cls='')=>`<button class="rbo ${cls}" data-b="${k}" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px">${lab}</button>`;
  const nums=[];for(let n=1;n<=36;n++){const c=(n-1)%3,r=(n-1)/3|0;const[x,y]=L.hz?[L.zw+r*L.cw,(2-c)*L.rh]:[c*L.cw,L.zh+r*L.rh];nums.push(`<button class="rbn ${colOf(n)}" data-n="${n}" style="left:${x}px;top:${y}px;width:${L.cw}px;height:${L.rh}px" aria-label="Numéro ${n}"><span>${n}</span></button>`)}
  if(L.hz){h+=`<button class="rbn g zero" data-n="0" style="left:0;top:0;width:${L.zw}px;height:${3*L.rh}px" aria-label="Zéro"><span>0</span></button>`;
    [3,2,1].forEach((c,i)=>h+=btn('c'+c,L.zw+12*L.cw,i*L.rh,56,L.rh,'2:1'));
    [1,2,3].forEach(d=>h+=btn('d'+d,L.zw+(d-1)*4*L.cw,3*L.rh+4,4*L.cw,40,BLABEL['d'+d]));
    [['low','1-18'],['even','Pair'],['red','<i class="dia r"></i>'],['black','<i class="dia k"></i>'],['odd','Impair'],['high','19-36']].forEach(([k,l],i)=>h+=btn(k,L.zw+i*2*L.cw,3*L.rh+48,2*L.cw,40,l))}
  else{h+=`<button class="rbn g zero" data-n="0" style="left:0;top:0;width:${3*L.cw}px;height:${L.zh}px" aria-label="Zéro"><span>0</span></button><div class="rbcorner" style="left:${3*L.cw}px;top:0;width:${L.dz+L.ev}px;height:${L.zh}px">⚡ Éclair</div>`;
    [1,2,3].forEach(d=>h+=btn('d'+d,3*L.cw,L.zh+(d-1)*4*L.rh,L.dz,4*L.rh,`<span class="vt">${BLABEL['d'+d]}</span>`));
    [['low','1-18'],['even','Pair'],['red','<i class="dia r"></i>'],['black','<i class="dia k"></i>'],['odd','Impair'],['high','19-36']].forEach(([k,l],i)=>h+=btn(k,3*L.cw+L.dz,L.zh+i*2*L.rh,L.ev,2*L.rh,`<span class="vt">${l}</span>`));
    [1,2,3].forEach(c=>h+=btn('c'+c,(c-1)*L.cw,L.zh+12*L.rh,L.cw,38,'2:1'))}
  box.innerHTML=h+nums.join('')+'<div class="rbchips" id="rbc"></div><div class="rbo-wrap" id="rbo"></div>';
  const ow=$('#rbo');$$('#rb .rbo').forEach(b=>ow.appendChild(b));
  box.onpointermove=e=>{if(e.pointerType!=='mouse')return;const k=rbFromEvent(e);rbHL(k,false)};box.onpointerleave=()=>rbHL(null)}
function rbFromEvent(e){const box=$('#rb'),r=box.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,L=RB;const t=e.target.closest('[data-b]');if(t)return t.dataset.b;
  if(L.hz?x<L.zw:y<L.zh*.74)return'n0';if(L.hz?(x>L.zw+12*L.cw||y>3*L.rh):(x>3*L.cw||y>L.zh+12*L.rh))return null;return rbKeyAt(L,x,y)}
function rbHL(k,flash){$$('#rb .rbn.cov').forEach(b=>b.classList.remove('cov'));const h=$('#rbHint');if(!k){return}const cov=k[0]==='n'||'sqtx'.includes(k[0])&&!BLABEL[k]?roCover(k):[];cov.forEach(n=>{const b=document.querySelector(`#rb .rbn[data-n="${n}"]`);if(b)b.classList.add('cov')});
  if(h&&cov.length>1)h.innerHTML=`<b style="color:var(--gold)">${RLAB(k)}</b> · paie ×${D.ROPAY[k[0]]-1} pour 1`;if(flash)setTimeout(()=>{if(!document.querySelector('#rb:hover'))$$('#rb .rbn.cov').forEach(b=>b.classList.remove('cov'))},700)}
document.addEventListener('click',e=>{const box=e.target.closest('#rb');if(!box)return;const k=rbFromEvent(e);if(!k)return;e.stopPropagation();roPlace(k)},true);
function roPlace(k){if(!RO.st||RO.st.phase!=='bet')return toast('Attends le prochain tour.');if(sumB(RO.local)+RO.chip>S.cash)return toast('Pas assez d\'argent pour ce jeton.');RO.local[k]=(RO.local[k]||0)+RO.chip;(RO.hist2=RO.hist2||[]).push([k,RO.chip]);snd('chip');vib(8);rbHL(k,true);roUI()}
ACT.roundo=()=>{const h=RO.hist2||[];const x=h.pop();if(!x)return;RO.local[x[0]]-=x[1];if(RO.local[x[0]]<=0)delete RO.local[x[0]];roUI()};
ACT.rodbl=()=>{const all={...RO.mine,...{}};const base=sumB(RO.local)?RO.local:RO.mine;const add=sumB(base);if(!add)return;if(sumB(RO.local)+add>S.cash)return toast('Pas assez d\'argent pour doubler.');for(const k in base)RO.local[k]=(RO.local[k]||0)+base[k];snd('chip');roUI()};
ACT.rorep=()=>{const p=RO.prev;if(!p||!sumB(p))return toast('Pas de mise précédente.');if(sumB(p)>S.cash)return toast('Pas assez pour remiser.');RO.local={...p};snd('chip');roUI()};
ACT.roclr=()=>{RO.local={};RO.hist2=[];roUI()};
const _rogo=ACT.rogo;ACT.rogo=async()=>{const snap={...RO.local};await _rogo();if(!sumB(RO.local)){RO.prev={...(RO.prevAcc||{})};for(const k in snap)RO.prev[k]=(RO.prev[k]||0)+snap[k];RO.prevAcc=RO.prev;RO.hist2=[]}};
on('ro',d=>{if(d.phase==='bet'&&RO.prevAcc&&RO.prevRound!==d.round){RO.prevRound=d.round;RO.prevAcc=null}const w=$('#ww');if(w)w.classList.toggle('spin',d.phase!=='bet')});
roUI=function(){const d=RO.st;if(!d||!$('#rb'))return;const all={...RO.mine};for(const k in RO.local)all[k]=(all[k]||0)+RO.local[k];
  const L=RB,ch=$('#rbc');if(ch&&L)ch.innerHTML=Object.entries(all).map(([k,a])=>{const[x,y]=rbKeyCenter(L,k);return`<span class="rbchip ${RO.local[k]?'pend':''}" style="left:${x}px;top:${y}px">${chipSpan(a)}</span>`}).join('');
  $$('#rb .rbn').forEach(b=>{const n=+b.dataset.n;b.classList.toggle('hit',d.phase==='res'&&d.n===n);const li=d.light&&d.light.n===n&&d.phase!=='bet';b.classList.toggle('light',!!li);b.querySelector('.lt')?.remove();if(li)b.insertAdjacentHTML('beforeend',`<span class="lt">⚡×${d.light.k}</span>`)});
  $$('#rb .rbo').forEach(b=>b.classList.toggle('hit',d.phase==='res'&&d.n!==null&&roWin(b.dataset.b,d.n)));
  $('#rhist').innerHTML=d.hist.slice(0,12).map(n=>`<span style="background:${n===0?'var(--green)':REDS.has(n)?'var(--red)':'var(--black)'}">${n}</span>`).join('');
  $('#roTot').textContent='Validé '+eur(sumB(RO.mine))+(sumB(RO.local)?' · en attente '+eur(sumB(RO.local)):'');
  const msg=$('#roMsg');msg.className='msg';msg.textContent=d.phase==='bet'?'Faites vos jeux !':d.phase==='spin'?(d.light?`⚡ ÉCLAIR sur le ${d.light.n} : ×${d.light.k} sur le plein ! Rien ne va plus…`:'Rien ne va plus…'):`${d.n} ${d.n===0?'vert':REDS.has(d.n)?'rouge':'noir'}${d.light&&d.light.n===d.n?' · ⚡ ÉCLAIR ×'+d.light.k:''}`;
  $('#roTime').innerHTML=d.phase==='bet'?`<div class="countdown"><span>Lancement dans <b data-secs="${d.endsAt}">${secs(d.endsAt)}</b> s</span>${timerBar(d.endsAt,20000)}</div>`:'';
  $('#roPl').innerHTML=d.players.map(p=>`<span class="${p.pseudo===S.pseudo?'me':''} ${d.phase==='res'?(p.win>p.total?'ok':'ko'):''}">${fc(p,22)} ${esc(p.pseudo)} · ${eur(p.total)}${d.phase==='res'&&p.win?' → '+eur(p.win):''}</span>`).join('')||'<span class="note">Aucun joueur sur ce tour.</span>';
  const g=$('#roGo');g.disabled=d.phase!=='bet'||!sumB(RO.local);g.textContent=d.phase==='bet'?(sumB(RO.local)?'Valider mes mises · '+eur(sumB(RO.local)):'Pose tes jetons'):'Attends le prochain tour';
  const ww=$('#ww');if(ww)ww.classList.toggle('spin',d.phase!=='bet');
  if(d.phase==='res'&&$('#rres'))$('#rres').innerHTML=`<b style="background:${d.n===0?'var(--green)':REDS.has(d.n)?'var(--red)':'var(--black)'}">${d.n}</b>`;else if($('#rres'))$('#rres').innerHTML=''};
addEventListener('resize',()=>{if(tab==='casino'&&sub.casino==='ro'&&$('#rb')){rbBuild();roUI()}});
ACT.rorules=()=>modal(`<p class="mt">Gains de la roulette</p><ul><li>Plein (1 numéro) : ×35 pour 1.</li><li>À cheval (2 numéros, sur la ligne entre eux) : ×17.</li><li>Transversale (3 numéros, bord gauche d'une rangée) : ×11.</li><li>Carré (4 numéros, au coin) : ×8.</li><li>Sixain (6 numéros, bord gauche entre deux rangées) : ×5.</li><li>Douzaine ou colonne 2:1 : ×2. Rouge, noir, pair, impair, 1-18, 19-36 : ×1.</li><li>⚡ Éclair : un tour sur deux, un numéro reçoit un multiplicateur (×2, ×3 ou ×5) sur les mises en plein.</li></ul><button class="btn gold" data-close>Compris</button>`);

/* ---------- Tirs au but : un vrai gardien ---------- */
const GK_SVG=`<svg viewBox="0 0 60 84" aria-hidden="true"><ellipse cx="30" cy="82" rx="16" ry="2.5" fill="#000" opacity=".35"/><path d="M22 56L18 78H25L30 62L35 78H42L38 56Z" fill="#1a1a22"/><rect x="17" y="76" width="9" height="5" rx="2" fill="#111"/><rect x="34" y="76" width="9" height="5" rx="2" fill="#111"/>
<path d="M16 30C16 24 22 22 30 22C38 22 44 24 44 30L42 58H18Z" fill="#f2c14e"/><path d="M24 32h12M30 26v30" stroke="#9a6512" stroke-width="1.5" opacity=".6"/><text x="30" y="47" text-anchor="middle" font-size="10" font-weight="900" font-family="sans-serif" fill="#7a4f0c">1</text>
<path d="M16 30L6 18M44 30L54 18" stroke="#f2c14e" stroke-width="7" stroke-linecap="round"/><circle cx="5" cy="15" r="5.5" fill="#39d98a" stroke="#1f8a5b"/><circle cx="55" cy="15" r="5.5" fill="#39d98a" stroke="#1f8a5b"/>
<circle cx="30" cy="13" r="9" fill="#d9a074"/><path d="M21 11C21 4 39 4 39 11C35 8 25 8 21 11Z" fill="#1c1412"/><circle cx="27" cy="13" r="1.3" fill="#111"/><circle cx="33" cy="13" r="1.3" fill="#111"/><path d="M27 17.5Q30 19 33 17.5" stroke="#5a2a22" stroke-width="1.2" fill="none"/></svg>`;
const BALL_SVG=`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#222" stroke-width="1.5"/><path d="M20 11l7 5-3 8h-8l-3-8z" fill="#222"/><path d="M20 11V3M27 16l7-3M24 24l5 7M16 24l-5 7M13 16l-7-3" stroke="#222" stroke-width="1.5"/></svg>`;
GAME_VIEW.pen=el=>{const run=PE.phase==='run',M=D.PKMODES[PE.mode];
  el.innerHTML=`<div class="seg">${D.PKMODES.map((m,i)=>`<button data-act="pemode" data-v="${i}" class="${PE.mode===i?'on':''}" ${run?'disabled':''}>${m.nm}</button>`).join('')}</div>
  <div class="pitch6"><div class="goal6" id="goal6"><div class="net6"></div>${PZ5.map((z,i)=>`<button class="tgt6 ${PE.saves.includes(i)&&PE.shot!==null?'saved':''}" data-act="peshot" data-v="${i}" style="left:${z[0]}%;top:${z[1]}%" ${run&&!PE.busy?'':'disabled'} aria-label="Viser la zone ${i+1}"></button>`).join('')}
      <div class="gk6" id="gk6">${GK_SVG}</div></div><div class="spot6"></div><div class="ball6" id="ball6">${BALL_SVG}</div>
    <div class="pscore">${Array.from({length:D.PMAX},(_,i)=>`<i class="${i<PE.goals?'ok':''}"></i>`).join('')}</div></div>
  <div class="msg ${PE.cls}">${PE.last||'Choisis où tirer. Le gardien couvre '+M.k+' zone'+(M.k>1?'s':'')+' sur 5.'}</div>
  ${run?`<div class="lrow2"><span>${PE.goals} but${PE.goals>1?'s':''} · prochain tir ${x2(D.peM(PE.goals+1,M))}</span><b class="num" style="color:var(--gold)">${PE.goals?eur(PE.bet*D.peM(PE.goals,M)):'—'}</b></div><button class="btn big" data-act="peout" ${PE.goals&&!PE.busy?'':'disabled'}>Encaisser</button>`
  :`${stakeUI('pen')}<button class="btn gold big" data-act="pego">Poser le ballon · <span data-sl="pen">${eur(ST.pen)}</span></button>`}`};
ACT.peshot=async el=>{if(PE.phase!=='run'||PE.busy)return;const z=+el.dataset.v;PE.busy=true;$$('.tgt6').forEach(b=>b.disabled=true);let r;try{r=await api('penShot',{z})}catch(e){PE.busy=false;render();return}
  const kz=r.saved?z:pick(r.saves.filter(x=>x!==z).length?r.saves.filter(x=>x!==z):[4]),G=$('#goal6'),gk=$('#gk6'),b=$('#ball6');
  if(G&&gk&&b){const gw=G.clientWidth,gh=G.clientHeight,tz=PZ5[kz],dx=(tz[0]-50)/100*gw,dy=(tz[1]-78)/100*gh,rot=kz===4?0:(tz[0]<50?-1:1)*(tz[1]<50?65:88);
    snd('pop');await sleep(T(120));gk.style.transform=`translate(calc(-50% + ${dx}px), ${dy}px) rotate(${rot}deg)`;
    const gr=G.getBoundingClientRect(),pr=b.parentElement.getBoundingClientRect(),bz=PZ5[z],bx=gr.left-pr.left+bz[0]/100*gw,by=gr.top-pr.top+bz[1]/100*gh;b.style.left=bx+'px';b.style.top=by+'px';b.style.transform='translate(-50%,-50%) scale(.55) rotate(720deg)';
    await sleep(T(560));if(r.saved){b.style.transition='all .5s cubic-bezier(.3,.6,.4,1)';b.style.top=(by+gh*.9)+'px';b.style.left=(bx+(bz[0]<50?-60:60))+'px';snd('lose')}else{G.classList.add('goalnet');snd('win')}await sleep(T(650))}
  PE.shot=z;PE.saves=r.saves;PE.busy=false;if(r.saved){PE.phase='done';PE.last='ARRÊTÉ ! Le gardien sort le grand jeu.';PE.cls='lose';shake();render();return}
  PE.goals=r.goals;PE.last='BUUUUT !';PE.cls='win';burst(10);vib(40);if(r.done){PE.phase='done';PE.last='5 buts sur 5 ! +'+eur(r.pay-PE.bet);render();burst(40);return}render()};

/* ---------- Tickets à gratter à thème ---------- */
const TKI={coin:ICON.coin,clover:'🍀',kebab:'🥙',star:'⭐',crown:'👑',gem:'💎'};
if(!D.TICKETS.find(x=>x.id===GR.ticket))GR.ticket='f';
GAME_VIEW.gratte=el=>{const t=D.TICKETS.find(x=>x.id===GR.ticket),act=GR.t&&!GR.done;
  el.innerHTML=`<div class="tkpick">${D.TICKETS.map(x=>`<button data-act="grt" data-v="${x.id}" class="tkc ${GR.ticket===x.id?'on':''}" style="--tk:${x.c}" ${act?'disabled':''}><span class="tki">${TKI[x.th]||'🎟️'}</span><b>${x.nm}</b><span class="num">${eur(x.pr)}</span></button>`).join('')}</div>
  ${GR.t?`<div class="scratch tk-${GR.t.th}" style="background:linear-gradient(135deg,${GR.t.c},#2a1d05)"><div class="tkhead"><b>${GR.t.nm}</b><span>Gros lot ${eur(GR.t.pr*1000)}</span></div><div class="grid9">${GR.cells.map(v=>`<div class="${GR.done&&GR.win&&v===GR.win*GR.t.pr?'w':''}"><span class="ti">${TKI[GR.t.th]||''}</span>${eur(v)}</div>`).join('')}</div>${GR.done?'':'<canvas id="scr" aria-label="Zone à gratter"></canvas>'}</div>
    <div class="msg ${GR.done?(GR.win?'win':'lose'):''}">${GR.done?(GR.win?'Trois fois '+eur(GR.win*GR.t.pr)+' : gagné !':'Pas de chance cette fois.'):'Gratte avec ton doigt. Trois montants identiques = tu gagnes ce montant.'}</div>${GR.done?'':'<button class="btn" data-act="grall">Tout gratter</button>'}`:'<div class="empty">Choisis un ticket et achète-le pour commencer.</div>'}
  <button class="btn gold big" data-act="grbuy" ${act?'disabled':''}>Acheter « ${t.nm} » · ${eur(t.pr)}</button><p class="note">Gros lot : 1 000 fois le prix du ticket.</p>`;if(act)grInit()};

/* ---------- Grand écran : tapis horizontal et lobby plus large ---------- */
const _render6=render;render=function(){document.body.classList.toggle('wide',innerWidth>=900&&tab==='casino'&&(!sub.casino||sub.casino==='ro'));_render6()};
addEventListener('resize',()=>{const w=innerWidth>=900&&tab==='casino'&&(!sub.casino||sub.casino==='ro');if(w!==document.body.classList.contains('wide'))render()});
