/* ====================== Outils ====================== */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const T=ms=>RM?Math.min(ms,60):ms;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.random()*a.length|0];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const fr=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0});
function eur(n){const a=Math.abs(n);let t;if(a>=1e9)t=(n/1e9).toFixed(1).replace('.',',')+' Md';else if(a>=1e6)t=(n/1e6).toFixed(a>=1e7?0:2).replace('.',',')+' M';else t=fr.format(Math.round(n));return t+' €'}
const x2=n=>'×'+(+n).toFixed(2).replace('.',',');
function short(v){return v>=1e6?v/1e6+'M':v>=1000?v/1000+'k':''+v}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const easeOutCubic=t=>1-Math.pow(1-t,3),easeOutQuart=t=>1-Math.pow(1-t,4),easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
let SKEW=0; const now=()=>Date.now()+SKEW; // horloge alignée sur le serveur
const secs=t=>Math.max(0,Math.ceil((t-now())/1000));
function vib(p){try{if(SOUND()&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const SOUND=()=>store.get('fauche-son')!=='0';

/* ====================== Sons ====================== */
let AC=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=false}}return AC||null}
document.addEventListener('pointerdown',()=>{const a=ac();if(a&&a.state==='suspended')a.resume()});
function tone(f,d,type='sine',v=.12,when=0,f2){const a=ac();if(!a||!SOUND())return;const t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v=.2,when=0,lp=1200){const a=ac();if(!a||!SOUND())return;const t=a.currentTime+when,b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.value=lp;g.gain.value=v;s.buffer=b;s.connect(f).connect(g).connect(a.destination);s.start(t)}
function snd(n){try{switch(n){case'chip':tone(2200,.04,'square',.03);tone(1500,.05,'square',.03,.03);break;case'card':noise(.07,.18,0,3000);break;case'tick':tone(1400,.03,'square',.03);break;
  case'win':[523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.1,i*.08));break;case'big':[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.25,'triangle',.11,i*.07));noise(.4,.05,.3,6000);break;
  case'lose':tone(300,.35,'sawtooth',.06,0,120);break;case'boom':noise(.9,.5,0,500);tone(90,.6,'sine',.25,0,40);break;case'coin':tone(1568,.08,'square',.04);tone(2093,.15,'square',.04,.07);break;
  case'pop':tone(600,.08,'sine',.1,0,1200);break;case'ring':for(let i=0;i<3;i++){tone(440,.35,'sine',.08,i*.9);tone(480,.35,'sine',.08,i*.9)}break;case'notif':tone(1046,.1,'sine',.08);tone(1568,.15,'sine',.08,.1);break;
  case'level':[392,523,659,784,1047].forEach((f,i)=>tone(f,.22,'square',.05,i*.09));break}}catch(e){}}

/* ====================== État & serveur ====================== */
let S=null; // état du joueur envoyé par le serveur
let sock=null;
const BUS={};function on(ev,fn){(BUS[ev]=BUS[ev]||[]).push(fn)}
function api(name,p){return new Promise((res,rej)=>{if(!sock||!sock.connected){toast('Pas de connexion au serveur.');return rej(new Error('offline'))}
  sock.emit('api',name,p||{},r=>{if(r&&r.ok)res(r.r);else{const m=(r&&r.err)||'Erreur';toast(m);rej(new Error(m))}})})}
const quiet=p=>p.catch(()=>null);
const LV=()=>S?S.lvl:1;
function title(){return S&&S.titleSel?S.titleSel:D.title(LV())}
const me=()=>S?S.pseudo:'';
const tierIdx=()=>S?S.tier:0;
const itemInfo=D.itemInfo;
let shown=0,cashAnim;
function animateCash(){const el=$('#cash'),from=shown,to=S.cash;cancelAnimationFrame(cashAnim);el.className='cash '+(to>from?'up':to<from?'down':'');if(to>from+.5)snd('coin');
  const t0=performance.now(),d=RM?1:600;const f=n=>{const t=Math.min(1,(n-t0)/d);shown=from+(to-from)*easeOutCubic(t);el.textContent=eur(shown);if(t<1)cashAnim=requestAnimationFrame(f);else{shown=to;setTimeout(()=>el.className='cash',400)}};cashAnim=requestAnimationFrame(f)}
let holdCash=0; // retient l'affichage pendant une animation (gains révélés après)
function updTop(){if(!S)return;if(!holdCash)animateCash();const t=S.tier;$('#tierLbl').textContent='Carte '+D.TIERS[t].name;const mc=$('#minicard');mc.className='minicard tier-'+t;mc.style.background=S.card.col?D.CARDCOL[S.card.col]:'';
  const L=D.levelOf(S.xp);$('#lvl').innerHTML=`Niv. <b>${L.l}</b> · ${title()}`;$('#xpb').style.width=(L.cur/L.need*100)+'%';
  const g=giftReady();$('#gift').classList.toggle('on',g);$('#giftDot').hidden=!g;
  const b=$('#banner'),jp=JACKPOT>now();b.hidden=!jp;if(jp)b.textContent='🎰 JACKPOT GÉANT : la machine à sous paie double pendant encore '+Math.ceil((JACKPOT-now())/60000)+' min'}
function release(){holdCash=0;updTop()}
let wantRender=false;function needRender(){wantRender=true}
let JACKPOT=0;
function parisDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now()))}
function giftReady(){const d=parisDate();return S&&(S.daily.chest!==d||S.daily.wheel!==d)}

/* ====================== Navigation ====================== */
const TABS=[['home','🏠','Accueil'],['casino','🎰','Casino'],['paris','⚽','Paris'],['marches','📈','Business'],['shop','🛍️','Boutique'],['social','💬','Social'],['moi','👤','Moi']];
let tab='home',sub={home:null,casino:null,paris:'sport',marches:'bourse',shop:'luxe',social:'chat',moi:'profil'};
let unread=0;
function nav(){$('#nav').innerHTML=TABS.map(([k,i,l])=>`<button data-act="tab" data-v="${k}" class="${k===tab?'on':''}" aria-label="${l}"><span class="i" aria-hidden="true">${i}</span>${l}${k==='social'&&unread?`<span class="unread">${unread>9?'9+':unread}</span>`:''}</button>`).join('')}
const VIEWS={};
let cleanup=[];
function leaveRooms(){cleanup.forEach(f=>{try{f()}catch(e){}});cleanup=[]}
function onLeave(f){cleanup.push(f)}
let lastKey='';
function render(){if(!S)return;const key=tab+'/'+(sub[tab]||'');if(key!==lastKey){leaveRooms();lastKey=key}const vv=$('#view');VIEWS[tab](vv);if(key!==render.k){render.k=key;vv.classList.remove('vin');void vv.offsetWidth;vv.classList.add('vin')}renderSlip()}
function go(t,s){tab=t;if(s!==undefined)sub[t]=s;nav();render();scrollTo(0,0)}
const ACT={};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const f=ACT[el.dataset.act];if(f)f(el,e)});
const BUSY=[];function busyAny(){return BUSY.some(f=>f())}
ACT.tab=el=>{if(busyAny())return toast('Termine ta partie avant de changer d\'écran.');if(el.dataset.v==='social'){unread=0}snd('tick');go(el.dataset.v)};
ACT.sub=el=>{if(busyAny())return toast('Termine ta partie avant de changer d\'écran.');sub[el.dataset.k]=el.dataset.v==='null'?null:el.dataset.v;snd('tick');render();if(el.dataset.k==='casino')scrollTo(0,0)};
function segHTML(k,opts){return`<div class="seg">${opts.map(([v,l])=>`<button data-act="sub" data-k="${k}" data-v="${v}" class="${sub[k]===v?'on':''}">${l}</button>`).join('')}</div>`}

/* ====================== Mise ====================== */
const RACK=[10,50,100,500,1000,5000,10000,100000,1000000];
const CHIPC={10:'#2d6cdf',50:'#c3343a',100:'#1f8a5b',500:'#3a3340',1000:'#7b3fc4',5000:'#e08a1e',10000:'#b8902e',100000:'#0e7c86',1000000:'#8c1f4f'};
const chipColor=v=>CHIPC[v]||'#2d6cdf';
function chipBtn(v,attrs,cls=''){return`<button class="cchip ${cls}" style="--c:${chipColor(v)}" ${attrs} aria-label="${fr.format(v)} €"><span>${short(v)}</span></button>`}
function chipSpan(v,label){const c=[...RACK].reverse().find(x=>x<=v)||10;return`<span class="cchip sm" style="--c:${chipColor(c)}" aria-hidden="true"><span>${label||short(v)}</span></span>`}
const ST={bj:50,sl:20,pa:20,mk:100,mo:50,crash:50,mines:50,plinko:10,hilo:50,d421:50,duel:100,race:50,bn:50,pk:0,loan:500};
const stakeHook={};
function stakeUI(k){const rack=RACK.filter(v=>v<=Math.max(1000,S.cash*1.01));
  return`<div class="stake"><div class="sv"><button class="sbtn" data-act="sa" data-k="${k}" data-v="clr" aria-label="Mise à zéro">✕</button><button class="sbtn" data-act="sa" data-k="${k}" data-v="half">½</button>
  <label class="sin"><span>Ta mise</span><input id="st-${k}" type="text" inputmode="numeric" value="${fr.format(ST[k])}" data-sin="${k}" aria-label="Montant de la mise"></label>
  <button class="sbtn" data-act="sa" data-k="${k}" data-v="dbl">×2</button><button class="sbtn" data-act="sa" data-k="${k}" data-v="max">Max</button></div>
  <div class="rack">${rack.map(v=>chipBtn(v,`data-act="sa" data-k="${k}" data-v="+${v}"`)).join('')}</div></div>`}
function setStake(k,val){ST[k]=Math.max(0,Math.min(Math.floor(val||0),k==='loan'?1e7:Math.floor(S.cash)));const i=$('#st-'+k);if(i&&document.activeElement!==i)i.value=fr.format(ST[k]);$$(`[data-sl="${k}"]`).forEach(e=>e.textContent=eur(ST[k]));stakeHook[k]&&stakeHook[k]()}
ACT.sa=el=>{const k=el.dataset.k,v=el.dataset.v;let n=ST[k];snd('chip');if(v==='clr')n=0;else if(v==='half')n=Math.floor(n/2);else if(v==='dbl')n=n*2;else if(v==='max')n=S.cash;else n=n+ +v.slice(1);
  if(k!=='loan'&&n>S.cash&&v!=='max')toast('Tu n\'as que '+eur(S.cash)+'.');setStake(k,n);const i=$('#st-'+k);if(i)i.value=fr.format(ST[k])};
document.addEventListener('input',e=>{const k=e.target.dataset?.sin;if(k)setStake(k,+e.target.value.replace(/\D/g,''))});
document.addEventListener('change',e=>{const k=e.target.dataset?.sin;if(k)e.target.value=fr.format(ST[k])});
function canBet(b){if(b<1){toast('Choisis une mise.');return false}if(b>S.cash){toast('Pas assez d\'argent. Passe à la banque !');return false}return true}

/* ====================== Retours visuels ====================== */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)}
let nt,notifCb=null;
function notif(ic,from,body,cb){const n=$('#notif');n.innerHTML=`<span class="ic" aria-hidden="true">${ic}</span><span class="t"><span>${esc(from)}</span><span>maintenant</span></span><span class="b">${esc(body)}</span>`;notifCb=cb||null;n.classList.add('show');snd('notif');clearTimeout(nt);nt=setTimeout(()=>n.classList.remove('show'),cb?6000:4500)}
document.addEventListener('click',e=>{if(e.target.closest('#notif')){$('#notif').classList.remove('show');if(notifCb){const c=notifCb;notifCb=null;c()}}});
function shake(){const a=$('#app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function burst(n=18){if(RM)return;const x=innerWidth/2,y=innerHeight*.4;for(let i=0;i<n;i++){const c=document.createElement('div');c.className='coin';c.style.left=x+'px';c.style.top=y+'px';document.body.appendChild(c);
  const a=rnd(0,Math.PI*2),d=rnd(80,220);c.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+160}px) scale(.6)`,opacity:0}],{duration:rnd(700,1200),easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>c.remove()}}
let FEED=[];
function setFeed(){$('#ticker').innerHTML=FEED.length?FEED.join(' &nbsp;·&nbsp; '):'Bienvenue au casino !'}
let modalQ=[];
function modal(html,cls=''){const m=$('#modal');m.innerHTML=`<div class="mb ${cls}" role="dialog" aria-modal="true">${html}</div>`;m.hidden=false;m.onclick=e=>{if(e.target.closest('[data-close]'))closeModal()}}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';const n=modalQ.shift();if(n)setTimeout(n,300)}
const modalOpen=()=>!$('#modal').hidden;
function whenFree(fn){if(modalOpen()||busyAny())modalQ.push(fn);else fn()}
ACT.mclose=()=>{closeModal();render()};
function avHTML(size=64,a=S.av){return`<span class="avatar" style="--as:${size}px" aria-hidden="true">${a.acc?`<span class="acc">${a.acc}</span>`:''}${a.face}</span>`}
const THEMEV={pmu:{'--bg':'#1b1712','--surface':'#27211a','--surface2':'#322a21','--line':'#4a3e30','--gold':'#d9a441','--gold-deep':'#8f6420','--felt':'#2e4a2a','--felt-hi':'#456b3f','--felt-lo':'#1d301b','--felt-line':'#4d6e45'},
  vegas:{'--bg':'#170d21','--surface':'#241634','--surface2':'#301d45','--line':'#4a2c62','--gold':'#ff5fb2','--gold-deep':'#b8327a','--felt':'#3a1356','--felt-hi':'#5a2483','--felt-lo':'#220a35','--felt-line':'#6b2d93'},
  macao:{'--bg':'#1a0c0c','--surface':'#2a1414','--surface2':'#361b1b','--line':'#4d2626','--gold':'#f2c14e','--gold-deep':'#a8761e','--felt':'#6b1219','--felt-hi':'#931c25','--felt-lo':'#420a0f','--felt-line':'#9c2a30'}};
let curTheme='';
function applyTheme(){if(!S||S.theme===curTheme)return;curTheme=S.theme;const r=document.documentElement;Object.keys(THEMEV.pmu).forEach(k=>r.style.removeProperty(k));Object.entries(THEMEV[S.theme]||{}).forEach(([k,v])=>r.style.setProperty(k,v))}
function cardHTML(p=S){const t=p.tier,T=D.TIERS[t];return`<div class="ccard tier-${t} m-${p.card.mot}" style="${p.card.col?'background:'+D.CARDCOL[p.card.col]+';color:#fff':''}"><div class="t"><span>FAUCHÉ</span><span>${T.name.toUpperCase()}</span></div><div class="chipi"></div><div class="no">•••• •••• •••• 2026</div><div class="nm"><span>${esc(p.pseudo)}</span><span class="num">${eur(p.worth)}</span></div></div>`}
function cardEl(c,down,fly,xl){const d=document.createElement('div');d.className='pc'+(xl?' xl':'')+(down?' down':'')+(fly&&!RM?' fly':'');const red=c&&(c.s==='♥'||c.s==='♦');const r=c?c.r:'',s=c?c.s:'';
  d.innerHTML=`<div class="in"><div class="face ${red?'red':''}"><span class="c1">${r}<i>${s}</i></span><span class="mid">${s}</span><span class="c2">${r}<i>${s}</i></span></div><div class="back"></div></div>`;d.setAttribute('aria-label',down?'carte cachée':r+s);return d}
function cardStr(cs){return cs?{r:cs.slice(0,-1).replace('T','10'),s:cs.slice(-1)}:null}
function timerBar(endsAt,total){const left=Math.max(0,endsAt-now());return`<div class="timer"><i style="width:${Math.min(100,left/total*100)}%;transition:none" data-end="${endsAt}" data-total="${total}"></i></div>`}
setInterval(()=>{$$('[data-end]').forEach(e=>{const l=Math.max(0,+e.dataset.end-now());e.style.width=Math.min(100,l/+e.dataset.total*100)+'%'});$$('[data-secs]').forEach(e=>e.textContent=secs(+e.dataset.secs))},250);
