/* ====================== V5 en ligne : lobby, nouveaux jeux ====================== */
const sumO=o=>Object.values(o).reduce((a,b)=>a+b,0);
const dkey=()=>parisDate();
GAMES.forEach(g=>delete g.nw);
GAMES.splice(2,0,
  {id:'tourney',ic:'🏆',nm:'Tournoi éclair',tg:'20 tours, record du jour en ligne',c:'#e3b558',nw:1},
  {id:'heist',ic:'💼',nm:'Braquage',tg:'Le casse du siècle… ou la cellule',c:'#5a6b7a',nw:1},
  {id:'gold',ic:'👑',nm:'Machine Dorée',tg:'Jackpot commun à tous les joueurs',c:'#f0c96f',nw:1},
  {id:'chicken',ic:'🐔',nm:'La Poule',tg:'Traverse sans finir en nuggets',c:'#e08a1e',nw:1,lv:1},
  {id:'pen',ic:'⚽',nm:'Tirs au but',tg:'Marque, encaisse ou retente',c:'#1f8a5b',nw:1,lv:2},
  {id:'sicbo',ic:'🎲',nm:'Sic Bo',tg:'Trois dés, des dizaines de paris',c:'#c3343a',nw:1,lv:3},
  {id:'mega',ic:'🍭',nm:'Bonanza Megaways',tg:'Jusqu\'à 117 649 façons de gagner',c:'#ff5fb2',nw:1,lv:4},
  {id:'holdem',ic:'🂠',nm:'Casino Hold\'em',tg:'Ton poker contre la banque',c:'#2d6cdf',nw:1,lv:5},
  {id:'craps',ic:'🎯',nm:'Craps',tg:'Le jeu de dés de Las Vegas',c:'#7b3fc4',nw:1,lv:6},
  {id:'vp',ic:'🂡',nm:'Vidéo poker',tg:'Garde tes cartes, vise la royale',c:'#2d6cdf',nw:1},
  {id:'bac',ic:'🎴',nm:'Baccarat',tg:'Joueur, Banquier ou Égalité',c:'#c3343a',nw:1},
  {id:'wheel',ic:'🎪',nm:'Roue géante',tg:'Mise sur la case qui tombe',c:'#ff5fb2',nw:1},
  {id:'tower',ic:'🗼',nm:'La Tour',tg:'Grimpe sans tomber dans le piège',c:'#0e7c86',nw:1},
  {id:'keno',ic:'🔢',nm:'Keno',tg:'Coche tes numéros',c:'#7b3fc4',nw:1},
  {id:'dice',ic:'🎯',nm:'Dés',tg:'Tu fixes toi-même le risque',c:'#5fd39a',nw:1},
  {id:'limbo',ic:'🌀',nm:'Limbo',tg:'Vise un multiplicateur',c:'#e08a1e',nw:1});
const CATS={tourney:'special',heist:'special',poker:'cartes',bj:'cartes',vp:'cartes',bac:'cartes',holdem:'cartes',hilo:'cartes',ro:'table',wheel:'table',d421:'table',bonneteau:'table',sicbo:'table',craps:'table',
  sl:'machines',gold:'machines',mega:'machines',pince:'machines',gratte:'machines',crash:'instant',mines:'instant',plinko:'instant',dice:'instant',limbo:'instant',tower:'instant',keno:'instant',duel:'instant',chicken:'instant',pen:'instant'};
GAMES.forEach(g=>g.cat=CATS[g.id]||'instant');
let LCAT='all',JACKPOT_G=50000;
function lobbyTop(){const r=D.seeded('horo'+dkey()),lg=GAMES.find(g=>g.id===D.luckyGame(dkey()))||GAMES[0];
  return`<div class="horo"><span class="ic" aria-hidden="true">🔮</span><span><b>Horoscope du flambeur · ${D.SIGNS[r()*12|0]}</b><br><span class="note">${D.HORO[r()*D.HORO.length|0]}</span><br><span>Jeu chanceux du jour : <b>${lg.ic} ${lg.nm}</b> (+10 % sur tes gains)</span></span></div>
  <button class="jkbar" data-act="sub" data-k="casino" data-v="gold"><span>🎰 Jackpot commun</span><b class="num" data-jk>${eur(JACKPOT_G)}</b></button>
  <div class="seg">${[['all','Tout'],['special','Spécial'],['cartes','Cartes'],['table','Tables'],['machines','Machines'],['instant','Instantané']].map(([k,l])=>`<button data-act="lcat" data-v="${k}" class="${LCAT===k?'on':''}">${l}</button>`).join('')}</div>`}
ACT.lcat=el=>{LCAT=el.dataset.v;snd('tick');render()};
ACT.locked=el=>{const g=GAMES.find(x=>x.id===el.dataset.v);toast('🔒 '+g.nm+' se débloque au niveau '+g.lv+'. Joue pour monter de niveau !')};
on('jackpot',v=>{JACKPOT_G=v;$$('[data-jk]').forEach(e=>e.textContent=eur(v))});
const mkDeck=()=>shuffle(['♠','♥','♦','♣'].flatMap(s=>['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(r=>({r,s}))));
const backCard='<div class="pc down"><div class="in"><div class="face"></div><div class="back"></div></div></div>';
async function play(fn){holdCash=1;try{return await fn()}finally{release()}}

/* ---------- Vidéo poker ---------- */
ST.vp=50;let VP={phase:'idle',hand:[],held:[0,0,0,0,0],msg:'Distribue, garde tes meilleures cartes, puis tire.',cls:'',bet:0,fresh:null};
BUSY.push(()=>VP.phase==='hold');
GAME_VIEW.vp=el=>{const hold=VP.phase==='hold',res=VP.phase==='done'?D.vpEval(VP.hand):-1;
  el.innerHTML=`<div class="vpt">${D.VPT.map(([n,m],i)=>`<div class="${res===i?'on':''}"><span>${n}</span><b class="num">×${m}</b></div>`).join('')}</div>
  <div class="felt"><div class="vpcards" id="vpC"></div><div class="msg ${VP.cls}">${VP.msg}</div></div>
  ${hold?`<p class="note center">Touche les cartes à garder, puis tire les autres.</p><button class="btn gold big" data-act="vpdraw">Tirer</button>`:`${stakeUI('vp')}<button class="btn gold big" data-act="vpdeal">Distribuer · <span data-sl="vp">${eur(ST.vp)}</span></button>`}`;
  const box=$('#vpC');if(!VP.hand.length){for(let i=0;i<5;i++)box.insertAdjacentHTML('beforeend','<div class="vpslot">'+backCard+'</div>')}
  else VP.hand.forEach((c,i)=>{const w=document.createElement('button');w.className='vpslot'+(VP.held[i]?' held':'');w.dataset.act='vphold';w.dataset.v=i;w.disabled=!hold;w.appendChild(cardEl(c,false,VP.fresh&&VP.fresh.includes(i)));w.insertAdjacentHTML('beforeend',`<span class="hl">${VP.held[i]?'GARDÉE':''}</span>`);box.appendChild(w)});VP.fresh=null};
ACT.vpdeal=async()=>{if(!canBet(ST.vp))return;try{const r=await api('vpDeal',{amt:ST.vp});Object.assign(VP,{hand:r.hand,held:[0,0,0,0,0],phase:'hold',fresh:[0,1,2,3,4],bet:ST.vp,msg:r.e>=0?'Déjà servi : '+D.VPT[r.e][0]+' !':'Garde tes meilleures cartes.',cls:r.e>=0?'gold':''});snd('card');render()}catch(e){}};
ACT.vphold=el=>{if(VP.phase!=='hold')return;const i=+el.dataset.v;VP.held[i]=VP.held[i]?0:1;snd('tick');render()};
ACT.vpdraw=()=>play(async()=>{if(VP.phase!=='hold')return;const r=await api('vpDraw',{held:VP.held});VP.fresh=[0,1,2,3,4].filter(i=>!VP.held[i]);VP.hand=r.hand;VP.phase='done';
  VP.msg=r.e>=0?`${D.VPT[r.e][0]} ! ${r.m>1?'+'+eur(r.pay-r.bet):'Mise rendue.'}`:'Rien du tout. Perdu '+eur(r.bet);VP.cls=r.m>1?'win':r.m===1?'':'lose';snd('card');render();if(r.m>=9)burst(30);else if(r.m>1)burst(12);bigCheck(r.bet,r.pay)});

/* ---------- Baccarat ---------- */
let BA={bets:{},prev:null,chip:10,busy:false,p:[],b:[],msg:'Mise sur le Joueur, le Banquier ou l\'Égalité.',cls:'',hist:[]};
BUSY.push(()=>BA.busy);
function chipRack(id,act,cur){return`<div class="rack" id="${id}">${RACK.filter(v=>v<=Math.max(1000,S.cash*1.01)).map(v=>chipBtn(v,`data-act="${act}" data-v="${v}"`,cur===v?'on':'')).join('')}</div>`}
function pickChip(el,id,obj){obj.chip=+el.dataset.v;snd('chip');$$('#'+id+' .cchip').forEach(c=>c.classList.toggle('on',+c.dataset.v===obj.chip))}
function addChip(obj,k){if(obj.busy)return;if(sumO(obj.bets)+obj.chip>S.cash)return toast('Pas assez d\'argent pour ce jeton.');obj.bets[k]=(obj.bets[k]||0)+obj.chip;snd('chip');render()}
function chipFoot(obj,pre){return`<div class="row2"><button class="btn sm" data-act="${pre}clr">Effacer</button><button class="btn sm" data-act="${pre}rep" ${obj.prev?'':'disabled'}>Rejouer la mise</button></div>`}
function clrRep(obj,pre){ACT[pre+'clr']=()=>{if(!obj.busy){obj.bets={};render()}};ACT[pre+'rep']=()=>{if(!obj.prev||obj.busy)return;if(sumO(obj.prev)>S.cash)return toast('Pas assez pour rejouer cette mise.');obj.bets={...obj.prev};render()}}
GAME_VIEW.bac=el=>{const tot=sumO(BA.bets);
  el.innerHTML=`<div class="felt"><div class="bacrow"><div class="seat"><div class="lbl">Joueur <span class="pill" id="pT">${BA.p.length?D.bTot(BA.p):'–'}</span></div><div class="cards" id="baP"></div></div><div class="seat"><div class="lbl">Banquier <span class="pill" id="bT">${BA.b.length?D.bTot(BA.b):'–'}</span></div><div class="cards" id="baB"></div></div></div>
    <div class="msg ${BA.cls}">${BA.msg}</div><div class="hist">${BA.hist.slice(0,16).map(h=>`<span style="background:${h==='p'?'#2d6cdf':h==='b'?'#c3343a':'#1f8a5b'}">${h==='p'?'J':h==='b'?'B':'É'}</span>`).join('')}</div></div>
  <div class="baczones">${[['p','Joueur','paie 1 pour 1','#2d6cdf'],['t','Égalité','paie 8 pour 1','#1f8a5b'],['b','Banquier','paie 0,95 pour 1','#c3343a']].map(([k,n,o,c])=>`<button class="bz2" data-act="bab" data-v="${k}" style="--zc:${c}" ${BA.busy?'disabled':''}><b>${n}</b><small>${o}</small>${BA.bets[k]?chipSpan(BA.bets[k]):''}</button>`).join('')}</div>
  <div class="stake"><div class="betline2"><span>Choisis un jeton, puis touche une zone</span><b class="num">Total ${eur(tot)}</b></div>${chipRack('baRack','bachip',BA.chip)}${chipFoot(BA,'ba')}</div>
  <button class="btn gold big" data-act="bago" ${BA.busy?'disabled':''}>Distribuer · ${eur(tot)}</button>`;
  BA.p.forEach(c=>$('#baP').appendChild(cardEl(c)));BA.b.forEach(c=>$('#baB').appendChild(cardEl(c)))};
ACT.bachip=el=>pickChip(el,'baRack',BA);ACT.bab=el=>addChip(BA,el.dataset.v);clrRep(BA,'ba');
ACT.bago=()=>play(async()=>{const tot=sumO(BA.bets);if(BA.busy||!tot)return toast('Pose au moins un jeton.');BA.busy=true;let r;try{r=await api('bacPlay',{bets:BA.bets})}catch(e){BA.busy=false;return}
  BA.p=[];BA.b=[];BA.msg='Le croupier distribue…';BA.cls='';render();const order=[['p',0],['b',0],['p',1],['b',1]];if(r.p[2])order.push(['p',2]);if(r.b[2])order.push(['b',2]);
  for(const[s,i]of order){const c=(s==='p'?r.p:r.b)[i];BA[s].push(c);const box=$(s==='p'?'#baP':'#baB');if(box)box.appendChild(cardEl(c,false,true));const t=$(s==='p'?'#pT':'#bT');if(t)t.textContent=D.bTot(BA[s]);snd('card');await sleep(T(500))}
  const pt=D.bTot(r.p),bt=D.bTot(r.b);BA.hist.unshift(r.w);BA.msg=`${r.w==='p'?'Le Joueur gagne':r.w==='b'?'Le Banquier gagne':'Égalité'} (${pt} à ${bt}). `+(r.pay>r.tot?'+'+eur(r.pay-r.tot):r.pay===r.tot?'Mise rendue.':'Perdu '+eur(r.tot-r.pay));
  BA.cls=r.pay>r.tot?'win':r.pay<r.tot?'lose':'';BA.prev={...BA.bets};BA.bets={};BA.busy=false;render();if(r.pay>r.tot){burst(16);snd('win')}bigCheck(r.tot,r.pay)});

/* ---------- Keno ---------- */
let KE={pick:[],drawn:[],busy:false,msg:'Coche de 1 à 10 numéros.',cls:''};ST.keno=20;
BUSY.push(()=>KE.busy);
GAME_VIEW.keno=el=>{const k=KE.pick.length,pt=D.KPAY[k]||{};
  el.innerHTML=`<div class="kgrid">${Array.from({length:D.KN},(_,i)=>i+1).map(n=>{const p=KE.pick.includes(n),d=KE.drawn.includes(n);return`<button data-act="kpick" data-v="${n}" class="${p?'on':''} ${d?(p?'hit':'drawn'):''}" ${KE.busy?'disabled':''}>${n}</button>`}).join('')}</div>
  <div class="msg ${KE.cls}">${KE.msg}</div><div class="ktable">${k?Object.entries(pt).reverse().map(([h,m])=>`<div><span>${h} bon${h>1?'s':''}</span><b class="num">${x2(m).replace(',00','')}</b></div>`).join(''):'<span class="note">Coche des numéros pour voir les gains.</span>'}</div>
  <div class="row2"><button class="btn sm" data-act="krand" ${KE.busy?'disabled':''}>Au hasard (${k||5})</button><button class="btn sm" data-act="kclr" ${KE.busy?'disabled':''}>Effacer</button></div>
  ${stakeUI('keno')}<button class="btn gold big" data-act="kgo" ${KE.busy||!k?'disabled':''}>${k?'Jouer '+k+' numéro'+(k>1?'s':'')+' · '+eur(ST.keno):'Coche au moins un numéro'}</button>`};
stakeHook.keno=()=>{const b=document.querySelector('[data-act="kgo"]');if(b&&KE.pick.length)b.textContent='Jouer '+KE.pick.length+' numéro'+(KE.pick.length>1?'s':'')+' · '+eur(ST.keno)};
ACT.kpick=el=>{if(KE.busy)return;const n=+el.dataset.v;KE.drawn=[];if(KE.pick.includes(n))KE.pick=KE.pick.filter(x=>x!==n);else if(KE.pick.length<10)KE.pick.push(n);else return toast('10 numéros maximum.');snd('tick');KE.msg='';render()};
ACT.krand=()=>{const k=KE.pick.length||5;KE.pick=shuffle([...Array(D.KN).keys()].map(i=>i+1)).slice(0,k);KE.drawn=[];render()};
ACT.kclr=()=>{KE.pick=[];KE.drawn=[];render()};
ACT.kgo=()=>play(async()=>{const k=KE.pick.length,b=ST.keno;if(!k||KE.busy||!canBet(b))return;KE.busy=true;let r;try{r=await api('kenoPlay',{picks:KE.pick,amt:b})}catch(e){KE.busy=false;return}KE.drawn=[];KE.msg='Tirage en cours…';KE.cls='';render();
  for(const n of r.drawn){await sleep(T(240));KE.drawn.push(n);const btn=document.querySelector(`[data-act="kpick"][data-v="${n}"]`);if(btn){btn.classList.add(KE.pick.includes(n)?'hit':'drawn');snd(KE.pick.includes(n)?'coin':'tick')}}
  KE.busy=false;KE.msg=`${r.h} bon${r.h>1?'s':''} numéro${r.h>1?'s':''} sur ${k}. `+(r.pay>b?'Gagné +'+eur(r.pay-b):r.pay?'Tu récupères '+eur(r.pay):'Perdu.');KE.cls=r.pay>b?'win':r.pay?'':'lose';render();if(r.m>=10)burst(30);else if(r.pay>b)burst(12);bigCheck(b,r.pay)});

/* ---------- Dés ---------- */
let DC={target:50,over:true,last:null,hist:[],busy:false};ST.dice=20;
BUSY.push(()=>DC.busy);
const dcChance=()=>DC.over?100-DC.target:DC.target,dcMult=()=>99/dcChance();
GAME_VIEW.dice=el=>{el.innerHTML=`<div class="dicebox"><div class="dnum num ${DC.last===null?'':DC.last.win?'upc':'dnc'}" id="dNum">${DC.last===null?'50,00':DC.last.r.toFixed(2).replace('.',',')}</div>
    <div class="dbar"><i class="zone" id="dZone"></i><span class="mk" id="dMk" style="left:${DC.last?DC.last.r:50}%"></span></div><input type="range" id="dRange" min="2" max="98" step="1" value="${DC.target}" aria-label="Seuil">
    <div class="stats"><div class="stat"><div class="l">Gagne si</div><div class="v" id="dIf"></div></div><div class="stat"><div class="l">Chance</div><div class="v" id="dCh"></div></div><div class="stat"><div class="l">Multiplicateur</div><div class="v" id="dMu"></div></div></div>
    <button class="btn" data-act="dflip">⇄ Inverser : ${DC.over?'plus de':'moins de'}</button></div>
  <div class="chist">${DC.hist.slice(0,14).map(h=>`<span class="${h.win?'hi':'lo'}">${h.r.toFixed(2).replace('.',',')}</span>`).join('')}</div>
  ${stakeUI('dice')}<button class="btn gold big" data-act="dgo">Lancer · <span data-sl="dice">${eur(ST.dice)}</span></button>`;
  const R=$('#dRange');R.oninput=()=>{DC.target=+R.value;dcUpd()};dcUpd()};
function dcUpd(){const z=$('#dZone');if(!z)return;z.style.left=(DC.over?DC.target:0)+'%';z.style.width=dcChance()+'%';$('#dIf').textContent=(DC.over?'> ':'< ')+DC.target;$('#dCh').textContent=dcChance()+' %';$('#dMu').textContent=x2(dcMult())}
ACT.dflip=()=>{if(DC.busy)return;DC.over=!DC.over;DC.target=100-DC.target;render()};
ACT.dgo=()=>play(async()=>{if(DC.busy||!canBet(ST.dice))return;DC.busy=true;let r;try{r=await api('diceRoll',{amt:ST.dice,target:DC.target,over:DC.over})}catch(e){DC.busy=false;return}
  const num=$('#dNum'),mk=$('#dMk'),t0=performance.now(),dur=T(600);await new Promise(res=>{const f=t=>{const p=Math.min(1,(t-t0)/dur),v=p<1?Math.random()*100:r.r;if(num){num.textContent=v.toFixed(2).replace('.',',');num.className='dnum num'}if(mk)mk.style.left=v+'%';if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
  DC.last={r:r.r,win:r.win};DC.hist.unshift(DC.last);DC.busy=false;render();if(r.win){snd('win');if(dcMult()>=5)burst(16)}else snd('lose');bigCheck(ST.dice,r.pay)});

/* ---------- Limbo ---------- */
let LB={target:2,last:null,hist:[],busy:false};ST.limbo=20;
BUSY.push(()=>LB.busy);
GAME_VIEW.limbo=el=>{el.innerHTML=`<div class="dicebox"><div class="dnum num ${LB.last===null?'':LB.last.win?'upc':'dnc'}" id="lbNum">${LB.last===null?'×1,00':x2(LB.last.r)}</div>
    <div class="row2"><label class="sin"><span>Multiplicateur visé</span><input id="lbT" type="text" inputmode="decimal" value="${String(LB.target).replace('.',',')}" aria-label="Multiplicateur visé"></label><div class="stat"><div class="l">Chance de gagner</div><div class="v" id="lbCh">${(99/LB.target).toFixed(2).replace('.',',')} %</div></div></div>
    <div class="picker">${[1.5,2,3,5,10,100].map(v=>`<button data-act="lbp" data-v="${v}" style="font-size:13px;font-weight:700">×${String(v).replace('.',',')}</button>`).join('')}</div></div>
  <div class="chist">${LB.hist.slice(0,14).map(h=>`<span class="${h.win?'hi':'lo'}">${x2(h.r)}</span>`).join('')}</div>
  ${stakeUI('limbo')}<button class="btn gold big" data-act="lbgo">Lancer · <span data-sl="limbo">${eur(ST.limbo)}</span></button>`;
  const I=$('#lbT');I.onchange=()=>{let v=parseFloat(I.value.replace(',','.'));if(!(v>=1.01))v=1.01;LB.target=Math.min(1000,Math.round(v*100)/100);I.value=String(LB.target).replace('.',',');$('#lbCh').textContent=(99/LB.target).toFixed(2).replace('.',',')+' %'}};
ACT.lbp=el=>{LB.target=+el.dataset.v;render()};
ACT.lbgo=()=>play(async()=>{if(LB.busy||!canBet(ST.limbo))return;LB.busy=true;let r;try{r=await api('limboPlay',{amt:ST.limbo,target:LB.target})}catch(e){LB.busy=false;return}
  const num=$('#lbNum'),t0=performance.now(),dur=T(700);snd('pop');await new Promise(res=>{const f=t=>{const p=Math.min(1,(t-t0)/dur);if(num){num.textContent=x2(1+(r.r-1)*easeOutCubic(p));num.className='dnum num'}if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
  LB.last={r:r.r,win:r.win};LB.hist.unshift(LB.last);LB.busy=false;render();if(r.win){snd('win');if(LB.target>=5)burst(20)}else snd('lose');bigCheck(ST.limbo,r.pay)});

/* ---------- La Tour ---------- */
let TW={mode:1,phase:'idle',floor:0,picks:[],traps:null,bet:0,busy:false};ST.tower=50;
BUSY.push(()=>TW.phase==='run');
GAME_VIEW.tower=el=>{const M=D.TMODES[TW.mode],run=TW.phase==='run';let rows='';
  for(let f=D.FLOORS-1;f>=0;f--){const act=run&&f===TW.floor;rows+=`<div class="trow ${act?'act':''}"><span class="tm num">${x2(D.twM(f+1,M))}</span><div class="tcells" style="grid-template-columns:repeat(${M.n},1fr)">${Array.from({length:M.n},(_,i)=>{
    const picked=TW.picks[f]===i,trap=TW.traps&&TW.traps[f].includes(i);let cls='',txt='';if(picked&&!trap){cls='gem';txt='💎'}else if(picked&&trap){cls='mine';txt='💀'}else if(TW.traps&&TW.phase==='done'){cls=trap?'mine dim':'gem dim';txt=trap?'💀':'💎'}
    return`<button data-act="twpick" data-v="${i}" class="${cls}" ${act&&!TW.busy?'':'disabled'} aria-label="Case ${i+1}">${txt}</button>`}).join('')}</div></div>`}
  el.innerHTML=`<div class="seg">${D.TMODES.map((m,i)=>`<button data-act="twmode" data-v="${i}" class="${TW.mode===i?'on':''}" ${run?'disabled':''}>${m.nm}</button>`).join('')}</div><div class="tower">${rows}</div>
  ${run?`<button class="btn gold big" data-act="twout" ${TW.floor&&!TW.busy?'':'disabled'}>Encaisser · ${eur(TW.bet*D.twM(TW.floor,M))}</button>`:`${stakeUI('tower')}<button class="btn gold big" data-act="twgo">Commencer l'ascension · <span data-sl="tower">${eur(ST.tower)}</span></button>`}`};
ACT.twmode=el=>{if(TW.phase==='run')return;TW.mode=+el.dataset.v;TW.phase='idle';TW.picks=[];TW.traps=null;render()};
ACT.twgo=async()=>{if(!canBet(ST.tower))return;try{await api('towStart',{amt:ST.tower,mode:TW.mode});TW={...TW,phase:'run',floor:0,picks:[],traps:null,bet:ST.tower};snd('chip');render()}catch(e){}};
ACT.twpick=async el=>{if(TW.phase!=='run'||TW.busy)return;TW.busy=true;const i=+el.dataset.v,f=TW.floor;let r;try{r=await api('towPick',{i})}catch(e){TW.busy=false;return}TW.busy=false;TW.picks[f]=i;
  if(r.dead){TW.traps=r.traps;TW.phase='done';snd('boom');shake();vib(200);render();return}
  if(r.top){TW.floor=r.floor;TW.traps=r.traps;TW.phase='done';render();burst(40);bigCheck(TW.bet,r.pay);return}TW.floor=r.floor;snd('pop');render()};
ACT.twout=()=>play(async()=>{const r=await api('towOut');TW.traps=r.traps;TW.phase='done';render();burst(r.m>=5?30:12);snd('win');toast('Encaissé '+x2(r.m)+' : +'+eur(r.pay-TW.bet));bigCheck(TW.bet,r.pay)});

/* ---------- Roue géante ---------- */
let WH={bets:{},prev:null,chip:10,busy:false,rot:0,hist:[],msg:'Mise sur un ou plusieurs symboles, puis lance la roue.',cls:''};
BUSY.push(()=>WH.busy);
GAME_VIEW.wheel=el=>{const tot=sumO(WH.bets);
  el.innerHTML=`<div class="felt"><div class="bigwheel"><canvas id="bw"></canvas><div class="bwpin"></div></div><div class="msg ${WH.cls}">${WH.msg}</div><div class="hist">${WH.hist.slice(0,14).map(j=>`<span style="background:${D.WTYPES[j].c};color:${D.WTYPES[j].t}">${D.WTYPES[j].k}</span>`).join('')}</div></div>
  <div class="wzones">${D.WTYPES.map((t,j)=>`<button class="bz2" data-act="whb" data-v="${j}" style="--zc:${t.c}" ${WH.busy?'disabled':''}><b>${t.k}</b><small>×${t.pay+1} · ${t.n}/54</small>${WH.bets[j]?chipSpan(WH.bets[j]):''}</button>`).join('')}</div>
  <div class="stake"><div class="betline2"><span>Choisis un jeton, puis touche un symbole</span><b class="num">Total ${eur(tot)}</b></div>${chipRack('whRack','whchip',WH.chip)}${chipFoot(WH,'wh')}</div>
  <button class="btn gold big" data-act="whgo" ${WH.busy?'disabled':''}>${WH.busy?'La roue tourne…':'Lancer la roue · '+eur(tot)}</button>`;bwDraw()};
let bwImg=null;
function bwDraw(){const c=$('#bw');if(!c)return;const css=Math.min(c.parentElement.clientWidth||300,300),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(css*dpr);if(c.width!==W){c.width=c.height=W;c.style.width=c.style.height=css+'px'}
  if(!bwImg||bwImg.width!==W){bwImg=document.createElement('canvas');bwImg.width=bwImg.height=W;const g=bwImg.getContext('2d'),R=W/2,a=2*Math.PI/54;g.translate(R,R);g.beginPath();g.arc(0,0,R,0,Math.PI*2);g.fillStyle='#3a2416';g.fill();
    D.WSEGS.forEach((j,i)=>{const t=D.WTYPES[j],a0=-Math.PI/2+(i-.5)*a;g.beginPath();g.moveTo(0,0);g.arc(0,0,R*.94,a0,a0+a);g.closePath();g.fillStyle=t.c;g.fill();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.stroke();
      g.save();g.rotate(a0+a/2+Math.PI/2);g.fillStyle=t.t;g.font=`800 ${Math.round(W*.034)}px "JetBrains Mono",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.k,0,-R*.8);g.restore()});
    const hub=g.createRadialGradient(-R*.05,-R*.05,2,0,0,R*.2);hub.addColorStop(0,'#fff3c4');hub.addColorStop(1,'#a97a26');g.beginPath();g.arc(0,0,R*.2,0,Math.PI*2);g.fillStyle=hub;g.fill();g.fillStyle='#2a1d05';g.font=`800 ${Math.round(W*.05)}px "Unbounded",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('F',0,2)}
  const g=c.getContext('2d');g.clearRect(0,0,W,W);g.save();g.translate(W/2,W/2);g.rotate(WH.rot);g.drawImage(bwImg,-W/2,-W/2);g.restore()}
ACT.whchip=el=>pickChip(el,'whRack',WH);ACT.whb=el=>addChip(WH,el.dataset.v);clrRep(WH,'wh');
ACT.whgo=()=>play(async()=>{const tot=sumO(WH.bets);if(WH.busy||!tot)return toast('Pose au moins un jeton.');WH.busy=true;let r;try{r=await api('wheelSpin',{bets:WH.bets})}catch(e){WH.busy=false;return}WH.msg='La roue tourne…';WH.cls='';render();
  const a=2*Math.PI/54,base=WH.rot-(WH.rot%(2*Math.PI)),target=base+2*Math.PI*(RM?1:5)-(r.i*a)+(Math.random()-.5)*a*.7,r0=WH.rot,t0=performance.now(),dur=RM?400:4800;let last=-1;
  await new Promise(res=>{const f=t=>{const p=Math.min(1,(t-t0)/dur);WH.rot=r0+(target-r0)*easeOutCubic(p);const s=Math.floor((WH.rot+a/2)/a);if(s!==last){last=s;snd('tick')}bwDraw();if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
  const t=D.WTYPES[r.j];WH.hist.unshift(r.j);WH.msg=`${t.k} ! `+(r.pay>r.tot?'Gagné +'+eur(r.pay-r.tot):r.pay?'Tu récupères '+eur(r.pay):'Perdu '+eur(r.tot));WH.cls=r.pay>r.tot?'win':r.pay?'':'lose';
  WH.prev={...WH.bets};WH.bets={};WH.busy=false;render();if(r.pay>r.tot){burst(t.pay>=20?40:14);snd('win')}bigCheck(r.tot,r.pay)});

/* ---------- Machine Dorée ---------- */
const GH=58,gTW=D.GSYM.reduce((a,x)=>a+x.w,0);
function gRoll(){let r=Math.random()*gTW;for(const x of D.GSYM){if((r-=x.w)<0)return x.s}return'🍒'}
const gSym=s=>s==='7'?'<b class="seven">7</b>':s==='W'?'<b class="wild">WILD</b>':s;
let GD={grid:[['🍒','7','🍋'],['🔔','W','⭐'],['💎','💰','🍇'],['🍋','7','🍒'],['⭐','🔔','💎']],busy:false,fs:0,fsTot:0,msg:'10 lignes. 3 💰 = tours gratuits. Cinq 7 sur une ligne = le JACKPOT COMMUN.',cls:'',hits:[]};ST.gold=100;
BUSY.push(()=>GD.busy);
GAME_VIEW.gold=el=>{el.innerHTML=`<div class="gcab ${GD.fs?'fsmode':''}"><div class="gjack"><span class="note">JACKPOT COMMUN · tous les joueurs</span><b class="num" data-jk>${eur(JACKPOT_G)}</b></div>
    ${GD.fs?`<div class="fsbar">TOURS GRATUITS · ${GD.fsTot-GD.fs+1}/${GD.fsTot} · gains ×2</div>`:''}
    <div class="greels">${GD.grid.map((col,c)=>`<div class="greel"><div class="gstrip" id="gs${c}">${col.map((s,r)=>`<div class="gsym ${GD.hits.includes(c+'-'+r)?'hit':''}">${gSym(s)}</div>`).join('')}</div></div>`).join('')}</div>
    <div class="msg ${GD.cls}" id="gMsg" style="margin-top:10px">${GD.msg}</div></div>
  ${stakeUI('gold')}<button class="btn gold big" data-act="gspin" ${GD.busy?'disabled':''}>Lancer · <span data-sl="gold">${eur(ST.gold)}</span></button>
  <details class="paydetails"><summary>Table des gains (par ligne, mise ÷ 10)</summary><div class="paytable">${D.GSYM.filter(x=>x.p).map(x=>`<div><span>${gSym(x.s)} ×3/4/5</span><b class="num">${x.p[0]}/${x.p[1]}/${x.p[2]||'JACKPOT'}</b></div>`).join('')}</div><p class="note">WILD remplace tout sauf 💰. 3, 4 ou 5 💰 : 8, 12 ou 20 tours gratuits à gains doubles. 3 % de chaque mise de tous les joueurs alimente le jackpot commun.</p></details>`};
async function gReels(fin,fast){await Promise.all(fin.map((f,c)=>new Promise(res=>{const st=$('#gs'+c);if(!st)return res();const all=[...GD.grid[c],...Array.from({length:10+c*5},gRoll),...f];st.innerHTML=all.map(s=>`<div class="gsym">${gSym(s)}</div>`).join('');st.style.transition='none';st.style.transform='translateY(0)';void st.offsetHeight;
  const d=RM?.15:(fast?.7:1)+c*.22;st.style.transition=`transform ${d}s cubic-bezier(.12,.7,.22,1.03)`;st.style.transform=`translateY(-${(all.length-3)*GH}px)`;setTimeout(()=>{snd('tick');st.style.transition='none';st.innerHTML=f.map(s=>`<div class="gsym">${gSym(s)}</div>`).join('');st.style.transform='translateY(0)';res()},d*1000+40)})));GD.grid=fin}
ACT.gspin=()=>play(async()=>{if(GD.busy||!canBet(ST.gold))return;GD.busy=true;let r;try{r=await api('goldSpin',{amt:ST.gold})}catch(e){GD.busy=false;return}GD.hits=[];GD.msg='Ça tourne…';GD.cls='';render();let fw=0;
  for(let k=0;k<r.spins.length;k++){const sp=r.spins[k];if(sp.free){GD.fs=r.spins.length-k;GD.fsTot=Math.max(GD.fsTot,r.spins.length-1);render()}await gReels(sp.grid,sp.free);GD.hits=sp.hits;
    if(sp.jack){snd('big');burst(80)}if(sp.free)fw+=sp.win;GD.msg=sp.jack?'JACKPOT COMMUN : '+eur(sp.jack)+' !!!':sp.free?(sp.win?'+'+eur(sp.win)+' · ':'')+'total des tours gratuits '+eur(fw):sp.sc>=3?`💰 ×${sp.sc} : TOURS GRATUITS !`:sp.win?'+'+eur(sp.win):'…';
    GD.cls=sp.win||sp.sc>=3?'win':'';render();if(!sp.free&&sp.sc>=3){snd('level');burst(30);await sleep(T(1500))}else await sleep(T(sp.win?800:350))}
  GD.fs=0;GD.fsTot=0;GD.busy=false;const t=r.total,b=r.bet;GD.msg=t>b?(t>=b*20?'MÉGA GAIN ! ':'Gagné ! ')+'+'+eur(t-b):t?'Tu récupères '+eur(t):'Perdu. Relance !';GD.cls=t>b?'win':t?'':'lose';render();if(t>b){burst(t>=b*20?50:14);snd('win')}bigCheck(b,t)});

/* ---------- Bonanza Megaways ---------- */
const mTW=D.MSYM.reduce((a,x)=>a+x.w,0);function mRoll(){let r=Math.random()*mTW;for(const x of D.MSYM){if((r-=x.w)<0)return x.s}return'🍒'}
let MG={grid:[['🍒','👑','🍇'],['🍋','💎','🍉','🔔'],['🍇','🍒'],['🍊','🔔','🍒','👑','🍋'],['💎','🍇','🍒'],['🍉','🍋','🍊','🔔']],busy:false,mul:1,fs:0,fsTot:0,msg:'Les symboles gagnants explosent, les autres tombent. Le multiplicateur grimpe à chaque chute !',cls:'',hit:null,fresh:null};ST.mega=50;
BUSY.push(()=>MG.busy);
const mWays=g=>g.reduce((a,c)=>a*c.length,1);
function mgCols(){return MG.grid.map((col,r)=>{const h=216/col.length;return`<div class="mcol">${col.map((s,i)=>`<div class="msym ${MG.hit&&MG.hit[r][i]?'hit':''} ${MG.fresh&&MG.fresh[r]&&MG.fresh[r][i]?'drop':''}" style="height:${h}px;font-size:${Math.min(30,h*.72)}px">${s}</div>`).join('')}</div>`}).join('')}
GAME_VIEW.mega=el=>{el.innerHTML=`<div class="mcab ${MG.fs?'fsmode':''}"><div class="mtop"><span><span class="note">FAÇONS DE GAGNER</span><br><b class="num" id="mWays">${fr.format(mWays(MG.grid))}</b></span><span style="text-align:right"><span class="note">MULTIPLICATEUR</span><br><b class="num" id="mMul">×${MG.mul}</b></span></div>
    ${MG.fs?`<div class="fsbar">TOURS GRATUITS · ${MG.fsTot-MG.fs+1}/${MG.fsTot}</div>`:''}<div class="mgrid2" id="mGrid">${mgCols()}</div><div class="msg ${MG.cls}" id="mMsg" style="margin-top:10px">${MG.msg}</div></div>
  ${stakeUI('mega')}<button class="btn gold big" data-act="mgspin" ${MG.busy?'disabled':''}>Lancer · <span data-sl="mega">${eur(ST.mega)}</span></button>
  <details class="paydetails"><summary>Comment ça marche</summary><p class="note">De 2 à 7 symboles par rouleau. Un symbole gagne s'il est présent sur au moins 3 rouleaux d'affilée depuis la gauche. Après chaque gain, les symboles explosent et le multiplicateur passe à ×2, ×3, ×5, ×8, ×12 puis ×20. 4 🎁 : 10 tours gratuits où le multiplicateur ne redescend pas.</p></details>`};
function mgPaint(){const g=$('#mGrid');if(g)g.innerHTML=mgCols();const w=$('#mWays');if(w)w.textContent=fr.format(mWays(MG.grid));const m=$('#mMul');if(m)m.textContent='×'+MG.mul}
ACT.mgspin=()=>play(async()=>{if(MG.busy||!canBet(ST.mega))return;MG.busy=true;let r;try{r=await api('megaSpin',{amt:ST.mega})}catch(e){MG.busy=false;return}MG.msg='';render();let fw=0;
  for(let k=0;k<r.spins.length;k++){const sp=r.spins[k];if(k>0){MG.fs=r.spins.length-k;MG.fsTot=r.spins.length-1;render()}
    for(let j=0;j<sp.steps.length;j++){const st=sp.steps[j];MG.grid=st.grid;MG.mul=st.mul;MG.fresh=j===0?st.grid.map(c=>c.map(()=>1)):st.fresh;MG.hit=null;mgPaint();snd(j?'pop':'card');await sleep(T(j?420:550));MG.fresh=null;
      if(st.hit){MG.hit=st.hit;mgPaint();const mm=$('#mMsg');if(mm){mm.textContent='+'+eur(st.win)+(st.mul>1?' (×'+st.mul+')':'');mm.className='msg win'}snd('coin');await sleep(T(700))}}
    if(k>0)fw+=sp.tot;if(k===0&&sp.sc>=4){MG.msg=`🎁 ×${sp.sc} : 10 TOURS GRATUITS !`;MG.cls='gold';render();snd('level');burst(30);await sleep(T(1500))}else if(k>0){MG.msg='Total des tours gratuits : '+eur(fw);MG.cls=fw?'win':'';render();await sleep(T(300))}}
  MG.fs=0;MG.busy=false;MG.hit=null;const t=r.total,b=r.bet;MG.msg=t>b?(t>=b*20?'MÉGA GAIN ! ':'Gagné ! ')+'+'+eur(t-b):t?'Tu récupères '+eur(t):'Perdu. Relance !';MG.cls=t>b?'win':t?'':'lose';render();if(t>b){burst(t>=b*10?30:12);snd('win')}bigCheck(b,t)});

/* ---------- Tournoi éclair ---------- */
let TO={phase:'idle',i:0,score:0,bots:[],reels:['🍒','7','🍋'],busy:false,rank:0,prize:0,auto:false,top:[]};
BUSY.push(()=>TO.phase==='run');
function toBoard(){return[...TO.bots.map(b=>({nm:b.nm,pts:b.cum[TO.i-1]||0})),{nm:'Toi',pts:TO.score,me:1}].sort((a,b)=>b.pts-a.pts)}
GAME_VIEW.tourney=el=>{
  if(TO.phase==='idle'){el.innerHTML=`<div class="box center"><span style="font-size:54px">🏆</span><b style="font-size:18px">Tournoi éclair de machine à sous</b><p class="note">8 joueurs, 20 tours chacun. Les 3 meilleurs se partagent les gains. Ton score entre aussi dans le classement du jour de tous les joueurs en ligne.</p>
    <div class="list">${D.TOUR.prizes.map((p,i)=>`<div class="lrow2"><span>${['🥇','🥈','🥉'][i]} ${i+1}${i?'e':'er'}</span><b class="num" style="color:var(--gold)">${eur(p)}</b></div>`).join('')}</div><button class="btn gold big" data-act="togo">S'inscrire · ${eur(D.TOUR.fee)}</button></div>
    <h3>Record du jour (tous les joueurs)</h3><div class="list" id="toTop"><div class="empty">Chargement…</div></div>`;
    api('tourTop').then(r=>{const e=$('#toTop');if(e)e.innerHTML=r.list.length?r.list.slice(0,10).map((x,i)=>`<div class="lrow2"><span>${i<3?['🥇','🥈','🥉'][i]:(i+1)+'.'} ${esc(x.pseudo)}</span><b class="num">${fr.format(x.score)} pts</b></div>`).join(''):'<div class="empty">Personne n\'a encore joué aujourd\'hui. À toi l\'honneur !</div>'}).catch(()=>{});return}
  const B=toBoard(),done=TO.phase==='done';
  el.innerHTML=`<div class="lrow2"><b>Tour ${Math.min(TO.i,D.TOUR.spins)}/${D.TOUR.spins}</b><b class="num" style="color:var(--gold)">${fr.format(TO.score)} pts</b></div><div class="cab"><div class="treels">${TO.reels.map(s=>`<div class="treel">${symHTML(s)}</div>`).join('')}</div></div>
  ${done?`<div class="msg ${TO.rank<=3?'win':''}">${TO.rank===1?'CHAMPION !':TO.rank<=3?'Podium !':'Pas de podium cette fois.'} ${TO.rank}${TO.rank===1?'er':'e'} sur 8${TO.prize?' · +'+eur(TO.prize):''}</div><button class="btn gold big" data-act="toagain">Rejouer un tournoi</button>`
  :`<div class="row2"><button class="btn gold big" data-act="tospin" ${TO.busy?'disabled':''}>Tourner</button><button class="btn big" data-act="toauto" ${TO.busy?'disabled':''}>Auto jusqu'à la fin</button></div>`}
  <h3>Classement en direct</h3><div class="list">${B.map((p,i)=>`<div class="lrow2 ${p.me?'mine':''}"><span>${i<3?['🥇','🥈','🥉'][i]:(i+1)+'.'} ${p.me?'<b>Toi</b>':'🤖 '+p.nm}</span><b class="num">${fr.format(p.pts)}</b></div>`).join('')}</div>`};
ACT.togo=async()=>{if(!canBet(D.TOUR.fee))return;try{const r=await api('tourStart');TO={phase:'run',i:0,score:0,bots:r.bots,reels:['❔','❔','❔'],busy:false,rank:0,prize:0,auto:false};snd('level');render()}catch(e){}};
ACT.toagain=()=>{TO.phase='idle';render()};
async function toOne(){TO.busy=true;render();let r;try{r=await api('tourSpin')}catch(e){TO.busy=false;render();return}const t0=performance.now();
  await new Promise(res=>{const iv=setInterval(()=>{$$('.treel').forEach(e=>e.innerHTML=symHTML(rollSym()));snd('tick');if(performance.now()-t0>T(TO.auto?260:520)){clearInterval(iv);res()}},70)});
  TO.reels=r.r;TO.score=r.score;TO.i=r.i;TO.busy=false;if(r.pts>=1000){snd('big');burst(14)}else if(r.pts)snd('coin');
  if(r.done){TO.phase='done';TO.rank=r.rank;TO.prize=r.prize;if(r.rank===1)burst(50)}render()}
ACT.tospin=()=>{if(!TO.busy&&TO.phase==='run')toOne()};
ACT.toauto=async()=>{if(TO.busy)return;TO.auto=true;while(TO.phase==='run'){await toOne();await sleep(T(150))}TO.auto=false;render()};

/* ---------- Braquage ---------- */
let HE={phase:'menu'};
BUSY.push(()=>!['menu','end'].includes(HE.phase));
GAME_VIEW.heist=el=>{const h=HE;const alarm=`<div class="alarm">${[0,1,2].map(i=>`<i class="${i<(h.alert||0)?'on':''}"></i>`).join('')}<span class="note">Niveau d'alerte</span></div>`;
  if(h.phase==='menu'){el.innerHTML=`<p class="sub">Choisis ta cible et prépare le matériel. Si l'alerte atteint 3, c'est la cellule : casino interdit pendant 2 minutes.</p><div class="crew">${D.CREW.map(([f,n])=>`<span><span class="f">${f}</span>${n}</span>`).join('')}</div>
    <div class="list">${D.HEISTS.map((x,i)=>`<div class="lrow2"><span style="min-width:0"><b>${x.ic} ${x.nm}</b><br><small class="note">Butin : ${eur(x.loot[0])} à ${eur(x.loot[1])} · matériel ${eur(x.cost)}</small></span><button class="btn gold sm" data-act="hego" data-v="${i}" ${S.cash<x.cost?'disabled':''}>Préparer</button></div>`).join('')}</div>
    <p class="note">Bilan : ${S.heistOk} réussi${S.heistOk>1?'s':''}, ${S.jail} arrestation${S.jail>1?'s':''}. C'est un jeu, aucun vrai braquage n'est encouragé 😇</p>`;return}
  const t=D.HEISTS[h.i];
  if(h.phase==='lock'){el.innerHTML=`<div class="box"><b>${t.ic} Étape 1/3 : crocheter le coffre</b><p class="note">Appuie quand l'aiguille est dans la zone verte. Essai ${Math.min(h.tries+1,3)}/3 · ${h.hits} réussi${h.hits>1?'s':''}. Il en faut 2.</p>
    <div class="lockbar"><i class="zone" style="left:${h.zx}%;width:${h.zone}%"></i><span class="needle" id="needle"></span></div>${alarm}<div class="msg ${h.cls||''}">${h.msg||''}</div><button class="btn gold big" data-act="hepick" ${h.busy?'disabled':''}>Crocheter !</button></div>`;heNeedle();return}
  if(h.phase==='run'){el.innerHTML=`<div class="box"><b>${t.ic} Étape 2/3 : la fuite</b><p class="note">Carrefour ${h.turn+1}/3. ${D.CREW[2][0]} Le Guetteur : « J'entends des sirènes à ${h.hint?'droite':'gauche'}… »</p><div class="road">🚗💨</div>${alarm}<div class="msg ${h.cls||''}">${h.msg||''}</div>
    <div class="row2"><button class="btn gold big" data-act="heturn" data-v="0" ${h.busy?'disabled':''}>⬅ Gauche</button><button class="btn gold big" data-act="heturn" data-v="1" ${h.busy?'disabled':''}>Droite ➡</button></div></div>`;return}
  if(h.phase==='split'){el.innerHTML=`<div class="box center"><b>${t.ic} Étape 3/3 : le partage</b><span style="font-size:48px">💼</span><p>Butin dans le sac : <b class="num" style="color:var(--gold)">${eur(h.loot)}</b></p>${h.lockFail?'<p class="note">Le coffre a résisté : tu n\'as pris que ce qui traînait.</p>':''}
    <div class="list"><button class="btn gold big" data-act="hesplit" data-v="0">Partager : ${eur(h.loot*.7)} pour toi</button><button class="btn red big" data-act="hesplit" data-v="1">Tout garder (risqué 😈)</button></div></div>`;return}
  el.innerHTML=`<div class="box center"><span style="font-size:58px">🤑</span><b style="font-size:18px">Coup réussi !</b><p>${h.txt}</p><div class="msg win">+${eur(h.gain)}</div><button class="btn gold big" data-act="heback">Retour au repaire</button></div>`};
function heNeedle(){const n=$('#needle');if(!n||HE.phase!=='lock')return;HE.pos=D.needle(performance.now()-HE.t0,HE.speed,HE.ph);n.style.left=HE.pos+'%';requestAnimationFrame(heNeedle)}
ACT.hego=async el=>{try{const r=await api('heStart',{i:+el.dataset.v});HE={phase:'lock',i:+el.dataset.v,...r,t0:performance.now(),msg:'',cls:''};snd('chip');render()}catch(e){}};
ACT.hepick=async()=>{const h=HE;if(h.phase!=='lock'||h.busy)return;h.busy=true;const ms=performance.now()-h.t0;let r;try{r=await api('hePick',{ms})}catch(e){h.busy=false;return}h.busy=false;
  if(r.ok){h.msg='Clic ! Une goupille cède.';h.cls='win';snd('pop')}else{h.msg='Raté ! Une alarme se déclenche…';h.cls='lose';snd('lose');shake()}
  if(r.phase==='run'){Object.assign(h,{phase:'run',alert:r.alert,turn:r.turn,hint:r.hint,lockFail:r.lockFail});h.msg=r.lockFail?'Le coffre résiste. On prend ce qu\'on peut et on file !':'Coffre ouvert ! On remplit le sac et on file !'}
  else Object.assign(h,{zx:r.zx,ph:r.ph,zone:r.zone,speed:r.speed,alert:r.alert,tries:r.tries,hits:r.hits,t0:performance.now()});render()};
ACT.heturn=async el=>{const h=HE;if(h.phase!=='run'||h.busy)return;h.busy=true;let r;try{r=await api('heTurn',{c:+el.dataset.v})}catch(e){h.busy=false;return}h.busy=false;
  if(r.caught)return heCaught(r.txt);if(r.bad){h.msg='Une voiture de police te colle au train !';h.cls='lose';snd('ring');shake()}else{h.msg='Rue déserte. Bien joué.';h.cls='win';snd('pop')}
  if(r.phase==='split')Object.assign(h,{phase:'split',loot:r.loot,lockFail:r.lockFail});else Object.assign(h,{alert:r.alert,turn:r.turn,hint:r.hint});render()};
ACT.hesplit=async el=>{let r;try{r=await api('heSplit',{all:el.dataset.v==='1'})}catch(e){return}if(r.caught)return heCaught(r.txt);HE={...HE,phase:'end',gain:r.gain,txt:r.txt};burst(r.gain>=100000?60:24);snd('big');render()};
function heCaught(txt){HE={phase:'menu'};snd('boom');shake();vib([200,100,200]);render();modal(`<span style="font-size:58px">🚔</span><p class="mt bad">ARRÊTÉ !</p><p>${txt}</p><p class="note">Tu passes 2 minutes en cellule : casino interdit.</p><button class="btn gold" data-act="mclose">Purger ma peine</button>`)}
ACT.heback=()=>{HE={phase:'menu'};render()};

/* ---------- La Poule ---------- */
let CH={mode:0,phase:'idle',lane:0,bet:0,dead:0,busy:false};ST.chicken=20;
BUSY.push(()=>CH.phase==='run');
GAME_VIEW.chicken=el=>{const run=CH.phase==='run',M=D.CHMODES[CH.mode];
  const lanes=Array.from({length:D.LANES},(_,i)=>{const n=i+1,passed=n<=CH.lane,here=n===CH.lane,dead=CH.dead===n;
    return`<div class="lane2 ${passed?'passed':''} ${n===CH.lane+1&&run?'next':''}">${passed&&!here?'<span class="block">🚧</span>':''}${!passed&&!dead?`<span class="car" style="animation-duration:${(1.1+((n*37)%10)/8).toFixed(2)}s;animation-delay:-${(n*.37)%2}s">${['🚗','🚕','🚙','🚌','🏎️'][n%5]}</span>`:''}<span class="hole num">${x2(D.chM(n,M))}</span>${here&&!dead?'<span class="hen">🐔</span>':''}${dead?'<span class="hen">🍗</span><span class="crash">🚚💥</span>':''}</div>`}).join('');
  el.innerHTML=`<div class="seg">${D.CHMODES.map((m,i)=>`<button data-act="chmode" data-v="${i}" class="${CH.mode===i?'on':''}" ${run?'disabled':''}>${m.nm}</button>`).join('')}</div>
  <div class="road2" id="road2"><div class="side">${CH.lane===0&&!CH.dead?'<span class="hen">🐔</span>':''}<span class="note">Départ</span></div>${lanes}<div class="side end">🌽<span class="note">Arrivée</span></div></div>
  <div class="lrow2"><span>Gain actuel</span><b class="num" style="color:var(--gold)">${run&&CH.lane?eur(CH.bet*D.chM(CH.lane,M)):'—'}</b></div>
  ${run?`<div class="row2"><button class="btn gold big" data-act="chstep" ${CH.busy?'disabled':''}>Avancer · ${x2(D.chM(CH.lane+1,M))}</button><button class="btn big" data-act="chout" ${CH.lane&&!CH.busy?'':'disabled'}>Encaisser</button></div>`:`${stakeUI('chicken')}<button class="btn gold big" data-act="chgo">Traverser · <span data-sl="chicken">${eur(ST.chicken)}</span></button>`}
  <p class="note">À chaque voie, une voiture peut passer (${Math.round(M.p*100)} % de risque).</p>`;const r=$('#road2');if(r)r.scrollLeft=Math.max(0,CH.lane*78-90)};
ACT.chmode=el=>{if(CH.phase==='run')return;CH.mode=+el.dataset.v;CH.phase='idle';CH.lane=0;CH.dead=0;render()};
ACT.chgo=async()=>{if(!canBet(ST.chicken))return;try{await api('chStart',{amt:ST.chicken,mode:CH.mode});CH={...CH,phase:'run',lane:0,bet:ST.chicken,dead:0};snd('pop');render()}catch(e){}};
ACT.chstep=async()=>{if(CH.phase!=='run'||CH.busy)return;CH.busy=true;let r;try{r=await api('chStep')}catch(e){CH.busy=false;return}CH.busy=false;
  if(r.dead){CH.dead=r.dead;CH.phase='done';snd('boom');shake();vib(200);render();return}CH.lane=r.lane;snd('pop');vib(15);if(r.done){CH.phase='done';render();burst(40);bigCheck(CH.bet,r.pay);return}render()};
ACT.chout=()=>play(async()=>{const r=await api('chOut');CH.phase='done';render();burst(r.m>=5?30:12);snd('win');toast('Encaissé '+x2(r.m)+' : +'+eur(r.pay-CH.bet));bigCheck(CH.bet,r.pay)});

/* ---------- Tirs au but ---------- */
const PZ5=[[17,28],[83,28],[17,72],[83,72],[50,50]];
let PE={mode:1,phase:'idle',goals:0,bet:0,saves:[],shot:null,last:'',cls:'',busy:false};ST.pen=20;
BUSY.push(()=>PE.phase==='run'||PE.busy);
GAME_VIEW.pen=el=>{const run=PE.phase==='run',M=D.PKMODES[PE.mode];
  el.innerHTML=`<div class="seg">${D.PKMODES.map((m,i)=>`<button data-act="pemode" data-v="${i}" class="${PE.mode===i?'on':''}" ${run?'disabled':''}>${m.nm}</button>`).join('')}</div>
  <div class="pitch"><div class="goal2">${PZ5.map((z,i)=>`<button class="tgt ${PE.saves.includes(i)&&PE.shot!==null?'saved':''}" data-act="peshot" data-v="${i}" style="left:${z[0]}%;top:${z[1]}%" ${run&&!PE.busy?'':'disabled'} aria-label="Viser la zone ${i+1}">◎</button>`).join('')}<span class="keeper" id="keeper">🧤</span><span class="pball" id="pball">⚽</span></div>
    <div class="pscore">${Array.from({length:D.PMAX},(_,i)=>`<i class="${i<PE.goals?'ok':''}"></i>`).join('')}</div><div class="msg ${PE.cls}">${PE.last||'Choisis où tirer. Le gardien couvre '+M.k+' zone'+(M.k>1?'s':'')+' sur 5.'}</div></div>
  ${run?`<div class="lrow2"><span>${PE.goals} but${PE.goals>1?'s':''} · prochain tir ${x2(D.peM(PE.goals+1,M))}</span><b class="num" style="color:var(--gold)">${PE.goals?eur(PE.bet*D.peM(PE.goals,M)):'—'}</b></div><button class="btn big" data-act="peout" ${PE.goals&&!PE.busy?'':'disabled'}>Encaisser</button>`
  :`${stakeUI('pen')}<button class="btn gold big" data-act="pego">Poser le ballon · <span data-sl="pen">${eur(ST.pen)}</span></button>`}`};
ACT.pemode=el=>{if(PE.phase==='run')return;PE.mode=+el.dataset.v;PE.last='';render()};
ACT.pego=async()=>{if(!canBet(ST.pen))return;try{await api('penStart',{amt:ST.pen,mode:PE.mode});PE={...PE,phase:'run',goals:0,bet:ST.pen,saves:[],shot:null,last:'À toi de tirer !',cls:''};snd('pop');render()}catch(e){}};
ACT.peshot=async el=>{if(PE.phase!=='run'||PE.busy)return;const z=+el.dataset.v;PE.busy=true;let r;try{r=await api('penShot',{z})}catch(e){PE.busy=false;return}
  const kz=r.saved?z:pick(r.saves),b=$('#pball'),kp=$('#keeper');if(b){b.style.left=PZ5[z][0]+'%';b.style.top=PZ5[z][1]+'%';b.style.transform='translate(-50%,-50%) scale(.6) rotate(540deg)'}if(kp){kp.style.left=PZ5[kz][0]+'%';kp.style.top=PZ5[kz][1]+'%'}snd('pop');await sleep(T(700));
  PE.shot=z;PE.saves=r.saves;PE.busy=false;if(r.saved){PE.phase='done';PE.last='ARRÊTÉ ! Le gardien sort le grand jeu.';PE.cls='lose';snd('lose');shake();render();return}
  PE.goals=r.goals;PE.last='BUUUUT !';PE.cls='win';snd('win');burst(10);vib(40);if(r.done){PE.phase='done';PE.last='5 buts sur 5 ! +'+eur(r.pay-PE.bet);render();burst(40);bigCheck(PE.bet,r.pay);return}render()};
ACT.peout=()=>play(async()=>{const r=await api('penOut');PE.phase='done';PE.last='Encaissé '+x2(r.m)+' : +'+eur(r.pay-PE.bet);PE.cls='win';render();burst(r.m>=5?30:12);bigCheck(PE.bet,r.pay)});

/* ---------- Sic Bo ---------- */
let SB={bets:{},prev:null,chip:10,busy:false,d:[1,2,3],msg:'Mise sur le total, Petit/Grand, un triple ou un chiffre.',cls:'',hist:[]};
BUSY.push(()=>SB.busy);
GAME_VIEW.sicbo=el=>{const tot=sumO(SB.bets),cb=k=>SB.bets[k]?chipSpan(SB.bets[k]):'';
  el.innerHTML=`<div class="felt"><div class="dome"><div class="dice" id="sbD">${SB.d.map((v,i)=>dieHTML(v,i,0,0,i===1)).join('')}</div></div><div class="msg ${SB.cls}">${SB.msg}</div></div>
  <div class="sbb"><div class="sb3"><button class="bz2" data-act="sbb" data-v="small" style="--zc:#2d6cdf"><b>Petit</b><small>4 à 10 · ×2</small>${cb('small')}</button><button class="bz2" data-act="sbb" data-v="triple" style="--zc:#e3b558"><b>Triple</b><small>×31</small>${cb('triple')}</button><button class="bz2" data-act="sbb" data-v="big" style="--zc:#c3343a"><b>Grand</b><small>11 à 17 · ×2</small>${cb('big')}</button></div>
    <div class="sb6">${[1,2,3,4,5,6].map(n=>`<button class="bz2" data-act="sbb" data-v="n${n}" style="--zc:#1f8a5b"><b>${['⚀','⚁','⚂','⚃','⚄','⚅'][n-1]}</b><small>×2/3/4</small>${cb('n'+n)}</button>`).join('')}</div>
    <div class="sb7">${Object.keys(D.SBT).map(t=>`<button class="bz2" data-act="sbb" data-v="t${t}" style="--zc:#7b3fc4"><b>${t}</b><small>×${D.SBT[t]+1}</small>${cb('t'+t)}</button>`).join('')}</div></div>
  <div class="stake"><div class="betline2"><span>Choisis un jeton, puis touche une case</span><b class="num">Total ${eur(tot)}</b></div>${chipRack('sbRack','sbchip',SB.chip)}${chipFoot(SB,'sb')}</div>
  <button class="btn gold big" data-act="sbgo" ${SB.busy?'disabled':''}>Secouer les dés · ${eur(tot)}</button>`};
ACT.sbchip=el=>pickChip(el,'sbRack',SB);ACT.sbb=el=>addChip(SB,el.dataset.v);clrRep(SB,'sb');
ACT.sbgo=()=>play(async()=>{const tot=sumO(SB.bets);if(SB.busy||!tot)return toast('Pose au moins un jeton.');SB.busy=true;let r;try{r=await api('sicboPlay',{bets:SB.bets})}catch(e){SB.busy=false;return}SB.msg='Ça secoue…';SB.cls='';render();
  const box=$('#sbD');for(let k=0;k<6;k++){if(box)box.innerHTML=[0,1,2].map(i=>dieHTML(1+Math.random()*6|0,i,0,0,i===1)).join('');$$('#sbD .die').forEach(d=>d.classList.add('roll'));snd('card');await sleep(T(120))}
  const d=r.d,s=d[0]+d[1]+d[2];SB.d=d;SB.msg=`${d.join(' · ')} = ${s}${d[0]===d[1]&&d[1]===d[2]?' · TRIPLE !':''}. `+(r.pay>r.tot?'Gagné +'+eur(r.pay-r.tot):r.pay?'Tu récupères '+eur(r.pay):'Perdu '+eur(r.tot));SB.cls=r.pay>r.tot?'win':r.pay?'':'lose';
  SB.prev={...SB.bets};SB.bets={};SB.busy=false;render();if(r.pay>r.tot){burst(r.pay>=r.tot*10?30:12);snd('win')}bigCheck(r.tot,r.pay)});

/* ---------- Casino Hold'em ---------- */
let HO={phase:'idle',a:0,me:[],dl:[],board:[],msg:'Mise l\'ante. Après le flop, suis (2 × l\'ante) ou couche-toi.',cls:'',busy:false,dlB:null};ST.holdem=50;
BUSY.push(()=>HO.phase==='decide'||HO.busy);
GAME_VIEW.holdem=el=>{const dec=HO.phase==='decide',show=HO.phase==='done',myB=HO.me.length?D.best7([...HO.me,...HO.board]):null;
  el.innerHTML=`<div class="felt hold"><div class="seat"><div class="lbl">Banque ${show&&HO.dlB?'· '+D.HCAT[HO.dlB[0]]:''}</div><div class="cards" id="hoD"></div></div><div class="hboard" id="hoB"></div><div class="msg ${HO.cls}">${HO.msg}</div>
    <div class="seat"><div class="cards" id="hoM"></div><div class="lbl">Toi ${myB?'· '+D.HCAT[myB[0]]:''}</div></div></div>
  ${dec?`<div class="row2"><button class="btn red big" data-act="hofold">Se coucher</button><button class="btn gold big" data-act="hocall" ${S.cash<HO.a*2?'disabled':''}>Suivre · ${eur(HO.a*2)}</button></div>`:`${stakeUI('holdem')}<button class="btn gold big" data-act="hogo" ${HO.busy?'disabled':''}>Miser l'ante · <span data-sl="holdem">${eur(ST.holdem)}</span></button>`}
  <details class="paydetails"><summary>Règles et gains</summary><p class="note">La banque doit avoir au moins une paire de 4 pour se qualifier. Sinon, ton ante est payée selon ta main et ta relance est rendue. Si elle se qualifie, la meilleure main gagne : ante payée selon le tableau, relance 1 pour 1.</p>
  <div class="paytable">${[[9,'Royale'],[8,'Quinte flush'],[7,'Carré'],[6,'Full'],[5,'Couleur'],[0,'Autres']].map(([k,n])=>`<div><span>${n}</span><b class="num">${k?D.AA[k]:1} pour 1</b></div>`).join('')}</div></details>`;
  const Dd=$('#hoD');(HO.dl.length?HO.dl:HO.me.length?[null,null]:[]).forEach(c=>Dd.appendChild(c?cardEl(c):(()=>{const x=document.createElement('div');x.innerHTML=backCard;return x.firstChild})()));
  const B=$('#hoB');for(let i=0;i<5;i++){const c=HO.board[i];if(c)B.appendChild(cardEl(c));else B.insertAdjacentHTML('beforeend','<div class="pc slot"></div>')}const M=$('#hoM');HO.me.forEach(c=>M.appendChild(cardEl(c)))};
ACT.hogo=async()=>{if(HO.busy||!canBet(ST.holdem))return;try{const r=await api('hoDeal',{amt:ST.holdem});HO={...HO,phase:'decide',a:ST.holdem,me:r.me,board:r.board,dl:[],dlB:null,msg:'Le flop est posé. Tu suis ou tu te couches ?',cls:''};snd('card');render()}catch(e){}};
ACT.hofold=async()=>{if(HO.phase!=='decide')return;try{const r=await api('hoFold');HO.board=r.board;HO.dl=r.dl;HO.dlB=r.dlB;HO.phase='done';HO.msg='Tu te couches. Ante perdue ('+eur(HO.a)+').';HO.cls='lose';render()}catch(e){}};
ACT.hocall=()=>play(async()=>{if(HO.phase!=='decide')return;HO.busy=true;let r;try{r=await api('hoCall')}catch(e){HO.busy=false;return}HO.phase='reveal';HO.msg='Turn et river…';render();
  for(let k=3;k<5;k++){await sleep(T(600));HO.board=r.board.slice(0,k+1);snd('card');render()}await sleep(T(600));HO.dl=r.dl;HO.dlB=r.dlB;
  const txt=r.res==='nq'?'La banque ne se qualifie pas : ante payée, relance rendue.':r.res==='win'?D.HCAT[r.me[0]]+' bat '+D.HCAT[r.dlB[0]].toLowerCase()+' !':r.res==='push'?'Égalité parfaite.':D.HCAT[r.dlB[0]]+' de la banque bat ta main.';
  HO.phase='done';HO.busy=false;HO.msg=txt+' '+(r.pay>r.staked?'+'+eur(r.pay-r.staked):r.pay===r.staked?'Mise rendue.':'−'+eur(r.staked));HO.cls=r.pay>r.staked?'win':r.pay<r.staked?'lose':'';snd('card');render();if(r.pay>r.staked)burst(r.me[0]>=6?30:12);bigCheck(r.staked,r.pay)});

/* ---------- Craps ---------- */
let CP={chip:10,d:[3,4],busy:false,msg:'Mise sur la Pass Line (ou contre avec Don\'t Pass), puis lance les dés.',cls:'',hist:[]};
BUSY.push(()=>CP.busy);
GAME_VIEW.craps=el=>{const cp=S.cp||{phase:'come',point:0,bets:{}},cb=k=>cp.bets[k]?chipSpan(cp.bets[k]):'',pt=cp.phase==='point';
  el.innerHTML=`<div class="felt"><div class="cpoint">${[4,5,6,8,9,10].map(n=>`<span class="${cp.point===n?'on':''}">${n}${cp.point===n?'<b>ON</b>':''}</span>`).join('')}</div><div class="dice big" id="cpD">${CP.d.map((v,i)=>dieHTML(v,i,0,0,i===1)).join('')}</div>
    <div class="msg ${CP.cls}">${CP.msg}</div><div class="hist">${CP.hist.slice(0,14).map(s=>`<span style="background:${s===7?'var(--red)':'var(--surface2)'}">${s}</span>`).join('')}</div></div>
  <div class="cpzones"><button class="bz2 wide" data-act="cpb" data-v="pass" style="--zc:#1f8a5b" ${pt?'disabled':''}><b>Pass Line</b><small>7 ou 11 gagne d'entrée · ×2</small>${cb('pass')}</button><button class="bz2" data-act="cpb" data-v="dont" style="--zc:#c3343a" ${pt?'disabled':''}><b>Don't Pass</b><small>Contre le lanceur · ×2</small>${cb('dont')}</button>
    <button class="bz2" data-act="cpb" data-v="field" style="--zc:#e3b558"><b>Field</b><small>2,3,4,9,10,11,12</small>${cb('field')}</button></div>
  <div class="stake">${chipRack('cpRack','cpchip',CP.chip)}</div><button class="btn gold big" data-act="cpgo" ${CP.busy?'disabled':''}>Lancer les dés</button>
  <details class="paydetails"><summary>Règles du Craps</summary><p class="note">Premier lancer : 7 ou 11, la Pass Line gagne. 2, 3 ou 12, elle perd (Don't Pass gagne sur 2 et 3, rendu sur 12). Sinon le total devient le « point » : il faut le refaire avant un 7. Le Field se joue sur un seul lancer (2 = ×3, 12 = ×4).</p></details>`};
ACT.cpchip=el=>pickChip(el,'cpRack',CP);
ACT.cpb=async el=>{if(CP.busy)return;try{await api('cpBet',{k:el.dataset.v,amt:CP.chip});snd('chip');needRender()}catch(e){}};
ACT.cpgo=()=>play(async()=>{if(CP.busy)return;CP.busy=true;let r;try{r=await api('cpRoll')}catch(e){CP.busy=false;return}render();
  const box=$('#cpD');for(let k=0;k<6;k++){if(box)box.innerHTML=[0,1].map(i=>dieHTML(1+Math.random()*6|0,i,0,0,i===1)).join('');$$('#cpD .die').forEach(d=>d.classList.add('roll'));snd('card');await sleep(T(110))}
  CP.d=r.d;CP.hist.unshift(r.s);CP.msg=`${r.d[0]} + ${r.d[1]} = ${r.s}. ${r.res.join(' · ')||'Rien ne se passe, relance.'}`+(r.st?(r.pay>r.st?' +'+eur(r.pay-r.st):r.pay===r.st?'':' −'+eur(r.st-r.pay)):'');CP.cls=r.st?(r.pay>r.st?'win':r.pay<r.st?'lose':''):'';
  CP.busy=false;S.cp=r.cp;render();if(r.pay>r.st){burst(12);snd('win')}if(r.st)bigCheck(r.st,r.pay)});
