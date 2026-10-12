/* ====================== Casino : lobby ====================== */
const GAMES=[
  {id:'poker',ic:'♠️',nm:'Poker',tg:'Texas Hold\'em avec tes potes',c:'#1f8a5b',b:'multi'},
  {id:'crash',ic:'🚀',nm:'Crash',tg:'Tout le monde sur la même fusée',c:'#ff5f6d',b:'live'},
  {id:'bj',ic:'🃏',nm:'Blackjack',tg:'5 places, un seul croupier',c:'#0e7c86',b:'multi'},
  {id:'ro',ic:'🎡',nm:'Roulette',tg:'Une bille pour tout le monde',c:'#c3343a',b:'live'},
  {id:'mines',ic:'💣',nm:'Mines',tg:'Évite les bombes',c:'#7b3fc4'},
  {id:'plinko',ic:'🔻',nm:'Plinko',tg:'La bille décide',c:'#e08a1e'},
  {id:'sl',ic:'🎰',nm:'Machine à sous',tg:'Trois 7 = jackpot',c:'#e3b558'},
  {id:'duel',ic:'🪙',nm:'Duel pile ou face',tg:'Défie un vrai joueur',c:'#5fd39a',b:'multi'},
  {id:'hilo',ic:'↕️',nm:'Plus haut plus bas',tg:'Devine la carte suivante',c:'#2d6cdf'},
  {id:'d421',ic:'🎲',nm:'Le 421',tg:'Le jeu de dés des bars',c:'#0e7c86'},
  {id:'gratte',ic:'🎟️',nm:'Tickets à gratter',tg:'Gratte avec le doigt',c:'#b8902e'},
  {id:'bonneteau',ic:'🥤',nm:'Bonneteau',tg:'Suis la bille… si tu peux',c:'#a14e2a'},
  {id:'pince',ic:'🦾',nm:'Machine à pince',tg:'Attrape un objet de luxe',c:'#3e8fd0'}];
const GAME_VIEW={};
const banned=()=>S.banUntil>now();
VIEWS.casino=v=>{
  if(banned()){v.innerHTML=`<h2>Viré du casino</h2><p class="sub">La sécurité t'a sorti après l'embrouille. Retour possible dans <b class="num" data-secs="${S.banUntil}">${secs(S.banUntil)}</b> s.</p><div class="empty">En attendant : les paris, le business ou un petit boulot.</div>`;
    const iv=setInterval(()=>{if(!banned()){clearInterval(iv);if(tab==='casino')render()}},1000);onLeave(()=>clearInterval(iv));return}
  const g=sub.casino;
  if(!g){v.innerHTML=`<h2>Le casino</h2><p class="sub">${ONLINE.length} joueur${ONLINE.length>1?'s':''} en ligne. Argent fictif, vraies règles. ${GAMES.length} jeux.</p>
    ${lobbyTop()}<div class="lobby">${GAMES.filter(x=>LCAT==='all'||x.cat===LCAT).map(x=>`<button class="tile" style="--tc:${x.c}" data-act="${x.lv&&LV()<x.lv?'locked':'sub'}" data-k="casino" data-v="${x.id}">${x.lv&&LV()<x.lv?`<span class="lockb">🔒 Niv. ${x.lv}</span>`:x.nw?'<span class="new">NOUVEAU</span>':''}${x.b==='live'?'<span class="livebadge">EN DIRECT</span>':x.b==='multi'?'<span class="multibadge">À PLUSIEURS</span>':''}<span class="ic" aria-hidden="true">${x.ic}</span><span><span class="nm">${x.nm}</span><br><span class="tg">${x.tg}</span></span></button>`).join('')}</div>`;return}
  const G=GAMES.find(x=>x.id===g);
  v.innerHTML=`<div class="back"><button class="btn sm" data-act="sub" data-k="casino" data-v="null">← Tous les jeux</button><b>${G.ic} ${G.nm}</b></div><div id="gm" class="section" style="margin-top:12px"></div>`;
  GAME_VIEW[g]($('#gm'))};
function bigLoss(d){whenFree(()=>notif('📸','Fauché','Grosse perte ! Crée ta carte de fail à partager',()=>failCard(d)))}

/* ---------- Machine à sous ---------- */
const symHTML=s=>s==='7'?'<b class="seven">7</b>':s;
function rollSym(){let r=Math.random()*24;for(const x of D.SYM){if((r-=x.w)<0)return x.s}return'🍒'}
let SL={cur:[['🍋','7','🍒'],['🔔','🍒','⭐'],['💎','⭐','🍋']],spinning:false,msg:'Aligne trois symboles sur la ligne du milieu.',cls:''};
BUSY.push(()=>SL.spinning);
GAME_VIEW.sl=el=>{const jp=JACKPOT>now();
  el.innerHTML=`<div class="cab" id="cab"><div class="title">${jp?'JACKPOT GÉANT ×2':'JACKPOT 7'}</div><div class="bulbs">${'<i></i>'.repeat(14)}</div>
    <div class="reels">${SL.cur.map((r,i)=>`<div class="reel"><div class="strip" id="strip${i}">${r.map(s=>`<div class="sym">${symHTML(s)}</div>`).join('')}</div></div>`).join('')}<div class="payline"></div></div>
    <div class="msg ${SL.cls}" id="slMsg" style="margin-top:12px">${SL.msg}</div></div>
  ${stakeUI('sl')}<button class="btn gold big" data-act="slspin" ${SL.spinning?'disabled':''}>Tirer le levier · <span data-sl="sl">${eur(ST.sl)}</span></button>
  <div class="paytable">${D.SYM.map(x=>`<div><span>${symHTML(x.s)}${symHTML(x.s)}${symHTML(x.s)}</span><b class="num">×${x.p3*(jp?2:1)}</b></div>`).join('')}</div>
  <p class="note">Deux symboles identiques : mise rendue, ×3 pour deux 💎, ×5 pour deux 7.</p>`};
ACT.slspin=async()=>{if(SL.spinning||!canBet(ST.sl))return;SL.spinning=true;holdCash=1;let r;
  try{r=await api('slots',{amt:ST.sl})}catch(e){SL.spinning=false;release();return}
  $('#cab').classList.remove('won');document.querySelector('[data-act="slspin"]').disabled=true;$('#slMsg').textContent='Ça tourne…';$('#slMsg').className='msg';snd('chip');
  await Promise.all(r.fin.map((f,i)=>new Promise(res=>{const st=$('#strip'+i);if(!st)return res();const filler=Array.from({length:16+i*7},rollSym);const all=[...SL.cur[i],...filler,...f];
    st.innerHTML=all.map(s=>`<div class="sym">${symHTML(s)}</div>`).join('');st.style.transition='none';st.style.transform='translateY(0)';void st.offsetHeight;
    const d=RM?.2:1.3+i*.45;st.style.transition=`transform ${d}s cubic-bezier(.12,.7,.22,1.04)`;st.style.transform=`translateY(-${(all.length-3)*64}px)`;
    setTimeout(()=>{snd('tick');st.style.transition='none';st.innerHTML=f.map(s=>`<div class="sym">${symHTML(s)}</div>`).join('');st.style.transform='translateY(0)';res()},d*1000+40)})));
  SL.cur=r.fin;SL.spinning=false;const b=r.payout-ST.sl;
  if(r.payout>ST.sl){SL.msg=(r.mult>=50?'JACKPOT ! ':'Gagné ! ')+'+'+eur(r.payout-ST.sl);SL.cls='win';burst(r.mult>=20?40:14);snd(r.mult>=20?'big':'win')}else if(r.payout){SL.msg='Paire ! Mise rendue.';SL.cls=''}else{SL.msg='Perdu. Retente ta chance.';SL.cls='lose'}
  if(tab==='casino'&&sub.casino==='sl'){const m=$('#slMsg');m.textContent=SL.msg;m.className='msg '+SL.cls;if(r.payout>ST.sl)$('#cab').classList.add('won');document.querySelector('[data-act="slspin"]').disabled=false}
  release()};
