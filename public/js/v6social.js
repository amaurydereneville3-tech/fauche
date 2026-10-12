/* ====================== V6 : social, histoires, braquages 2.0 ====================== */
/* ---------- Accueil ---------- */
VIEWS.home=v=>{const L=D.levelOf(S.xp),d=parisDate(),day=S.day&&S.day.date===d?S.day:{net:0,games:0,best:0},lg=GAMES.find(g=>g.id===D.luckyGame(dkey()))||GAMES[0],pe=S.pending,Cc=S.challenge,cact=Cc&&!Cc.done&&now()<Cc.until;
  const recent=[...new Set((S.hist||[]).map(h=>h.g))].map(id=>GAMES.find(g=>g.id===id)).filter(Boolean).slice(0,3),t=passTier(),passOpen=D.PASS.filter((_,i)=>i<t&&!S.pass.claimed.includes(i)).length;
  const h=new Date().getHours(),hi=h<5?'Encore debout':h<12?'Bonjour':h<18?'Salut':'Bonsoir',P=S.pet&&D.PETS.find(p=>p.id===S.pet.id),pm=petMood(),hp=(S.happyUntil||0)>now(),jail=(S.jailUntil||0)>now();
  const card=(act,ic,b,n,hot)=>`<button class="hcard ${hot?'hot':''}" ${act}><span class="i">${ic}</span><b>${b}</b><span class="note">${n}</span></button>`;
  v.innerHTML=`<div class="hello6"><button class="avbtn" data-act="go" data-t="moi" data-s="avatar" aria-label="Mon avatar">${avHTML(60)}</button><div style="min-width:0"><h2 style="margin:0">${hi} ${esc(me())} 👋</h2><span class="note">Niveau ${L.l} · ${esc(title())}</span></div></div>
  ${hp?`<button class="happy6" data-act="tab" data-v="casino"><b>🍾 HAPPY HOUR</b><span>Tous les gains sont doublés · encore ${Math.ceil((S.happyUntil-now())/60000)} min</span></button>`:''}
  ${jail?`<button class="happy6 jail" data-act="tab" data-v="casino"><b>🚔 EN PRISON</b><span>Encore <span data-secs="${S.jailUntil}">${secs(S.jailUntil)}</span> s · corromps le gardien ou évade-toi</span></button>`:''}
  <div class="daycard"><div><span class="note">Aujourd'hui</span><b class="num ${day.net>0?'upc':day.net<0?'dnc':''}">${day.net>=0?'+':''}${eur(day.net)}</b></div><div><span class="note">Parties</span><b class="num">${day.games}</b></div><div><span class="note">Meilleur coup</span><b class="num">${eur(Math.max(0,day.best))}</b></div></div>
  <section class="jhero mini" data-act="go" data-t="casino" data-s="gold"><div class="jtx"><span class="k">JACKPOT COMMUN</span><b class="num" data-jk>${eur(JACKPOT_G)}</b><span class="note">Machine Dorée · tous les joueurs</span></div><span class="jart" aria-hidden="true">${JART}</span></section>
  <div class="hgrid">
    ${giftReady()?card('data-act="gift"','🎁','Cadeaux du jour','Coffre + roue gratuite'+(S.streak&&S.streak.n?' · série '+S.streak.n+' 🔥':''),1):''}
    ${card(`data-act="go" data-t="casino" data-s="${lg.id}"`,'🔮',lg.nm,'Jeu chanceux du jour : +10 %')}
    ${cact?card(`data-act="go" data-t="casino" data-s="${Cc.game}"`,'🤝','Défi du Croupier',esc(Cc.txt)+' · '+eur(Cc.amt),1):''}
    ${card('data-act="go" data-t="social" data-s="week"','👑','Classement de la semaine','250 000 € pour le 1er lundi')}
    ${card('data-act="go" data-t="moi" data-s="missions"','🎯','Missions','Du jour et de la semaine')}
    ${card('data-act="go" data-t="moi" data-s="pass"','⭐','Pass · palier '+t+'/'+D.PASS.length,passOpen?passOpen+' récompense'+(passOpen>1?'s':'')+' à prendre !':'Prochain : '+(t<D.PASS.length?passLabel(D.PASS[t])[1]:'terminé'),passOpen)}
    ${card('data-act="go" data-t="casino" data-s="wshow"','🎡','Grande Roue en direct','Bonus jusqu\'à ×80 pour tout le monde')}
    ${pe>=1?card('data-act="go" data-t="marches" data-s="biz"','🏪',eur(pe),'à encaisser de tes entreprises'):''}
    ${P&&!pm[2]?card('data-act="go" data-t="vie" data-s="pet"',P.ic,P.nm+' a faim','Plus de bonus tant qu\'il boude',1):''}
    ${unread?card('data-act="go" data-t="social" data-s="chat"','💬',unread+' message'+(unread>1?'s':''),'dans le chat du casino'):''}
  </div>
  ${recent.length?`<h3 class="h6">Reprendre</h3><div class="lobby6">${recent.map(x=>`<button class="gtile" style="--tc:${x.c}" data-act="go" data-t="casino" data-s="${x.id}"><span class="art">${gameArt(x)}</span><span class="gtx"><b>${x.nm}</b></span></button>`).join('')}</div>`:''}
  <h3 class="h6">Nouveautés</h3><div class="lobby6">${GAMES.filter(g=>g.nw).slice(0,9).map(x=>`<button class="gtile" style="--tc:${x.c}" data-act="go" data-t="casino" data-s="${x.id}">${x.lv&&LV()<x.lv?`<span class="lockb">🔒 Niv. ${x.lv}</span>`:'<span class="new">NOUVEAU</span>'}<span class="art">${gameArt(x)}</span><span class="gtx"><b>${x.nm}</b></span></button>`).join('')}</div>
  ${CREDIT}`};

/* ---------- Social : classement de la semaine, drops ---------- */
VIEWS.social=v=>{const n=(S.loanReq||[]).length;if(!['chat','players','week','top','loans'].includes(sub.social))sub.social='chat';
  v.innerHTML=`<h2>Social</h2><p class="sub">${ONLINE.length} joueur${ONLINE.length>1?'s':''} en ligne. Discute, défie, prête… et réclame ton argent.</p>
  ${segHTML('social',[['chat','Chat'],['players','En ligne'],['week','Semaine'],['top','Fortune'],['loans','Prêts'+(n?' ('+n+')':'')]])}<div class="section" style="margin-top:12px" id="sov"></div>`;
  ({chat:rChat,players:rPlayers,top:rTop,loans:rLoans,week:rWeek})[sub.social]($('#sov'))};
async function rWeek(v){v.innerHTML='<div class="empty">Chargement…</div>';let r;try{r=await api('weekTop')}catch(e){return}if(sub.social!=='week'||!$('#sov'))return;
  const mine=r.rows.findIndex(x=>x.id===S.id),end=new Date(r.week+'T00:00:00');end.setDate(end.getDate()+7);
  v.innerHTML=`<div class="weekhead"><span><b>Classement de la semaine</b><br><span class="note">Bénéfices depuis lundi. Remise à zéro lundi à minuit. ${mine>=0?'Tu es '+(mine+1)+(mine?'e':'er')+'.':'Tu n\'es pas encore classé.'}</span></span><span class="prz">${r.prizes.map((p,i)=>`<span>${['🥇','🥈','🥉'][i]} ${short(p)} €</span>`).join('')}</span></div>
  ${r.rows.map((p,i)=>`<button class="prow ${p.id===S.id?'mine':''}" data-act="prof" data-v="${p.id}"><span>${i<3?['🥇','🥈','🥉'][i]:(i+1)+'.'} ${fc(p,30)} <b>${esc(p.pseudo)}</b>${p.cr?' <span class="crown">👑</span>':''}</span><span class="num ${p.net>=0?'upc':'dnc'}">${p.net>=0?'+':''}${eur(p.net)}</span></button>`).join('')||'<div class="empty">Personne n\'a encore joué cette semaine. Fonce !</div>'}
  <p class="note">Le 1er gagne 250 000 € et le titre « Roi de la semaine ». 2e : 100 000 €. 3e : 50 000 €.</p>`}
const _chatUI=chatUI;chatUI=function(){_chatUI();$$('#chatL .cmsg').forEach((el,i)=>{const m=CHAT[i];if(m&&m.drop&&!el.querySelector('.dropbtn'))el.querySelector('.x').insertAdjacentHTML('beforeend',` <button class="btn gold sm dropbtn" data-act="dropc" data-v="${m.drop}" ${DROPGONE[m.drop]?'disabled':''}>${DROPGONE[m.drop]?'Pris par '+esc(DROPGONE[m.drop]):'🎁 Attraper'}</button>`)})};
const DROPGONE={};
on('drop',d=>{snd('notif');notif('🎁','DROP !',eur(d.amt)+' pour le premier qui clique ici !',()=>ACT.dropc({dataset:{v:d.id}}));const b=document.createElement('button');b.className='dropfloat';b.innerHTML=`🎁<span>${eur(d.amt)}</span>`;b.dataset.act='dropc';b.dataset.v=d.id;b.id='df-'+d.id;document.body.appendChild(b);setTimeout(()=>b.remove(),25000)});
on('dropGone',d=>{DROPGONE[d.id]=d.by;$('#df-'+d.id)?.remove();if(tab==='social'&&sub.social==='chat')chatUI()});
ACT.dropc=async el=>{const id=el.dataset.v;try{const r=await api('dropClaim',{id});toast('🎁 Tu attrapes le drop : +'+eur(r.amt));burst(24);snd('big')}catch(e){}$('#df-'+id)?.remove()};

/* ---------- Pickpocket, prime, sabotage (depuis le profil) ---------- */
PROF_EXTRA.push(p=>`<div class="row3"><button class="btn sm" data-act="ppk" data-v="${p.id}" ${p.on?'':'disabled'}>🫳 Pickpocket</button><button class="btn sm" data-act="bnt" data-v="${p.id}" data-n="${esc(p.pseudo)}">🎯 Prime</button><button class="btn sm" data-act="sab" data-v="${p.id}" data-n="${esc(p.pseudo)}" ${p.biz.length?'':'disabled'}>🐀 Saboter</button></div>`);
ACT.ppk=async el=>{let r;try{r=await api('pickpocket',{id:+el.dataset.v})}catch(e){return}closeModal();
  if(r.ok){toast('🫳 Tu lui fais les poches : +'+eur(r.amt)+(r.bounty?' et la prime de '+eur(r.bounty)+' !':''));burst(r.bounty?30:12);snd('win')}else{toast('Grillé ! Amende de '+eur(r.fine)+(r.guard?' (il avait un garde du corps)':''));shake();snd('lose')}};
ACT.bnt=el=>{const id=+el.dataset.v;ST.bounty=Math.max(1000,ST.bounty||5000);modal(`<p class="mt">🎯 Mettre une prime sur ${esc(el.dataset.n)}</p><p class="note">Celui qui le bat en duel ou lui fait les poches empoche toute la prime. Tout le casino est prévenu.</p>${stakeUI('bounty').replace('Ta mise','Montant')}<div class="row2"><button class="btn" data-close>Annuler</button><button class="btn gold" data-act="bntgo" data-v="${id}">Poser la prime</button></div>`)};
ACT.bntgo=async el=>{try{const r=await api('bounty',{id:+el.dataset.v,amt:ST.bounty});closeModal();toast('Prime posée. Total sur sa tête : '+eur(r.total));snd('big')}catch(e){}};
ACT.sab=el=>modal(`<p class="mt">🐀 Saboter les entreprises de ${esc(el.dataset.n)} ?</p><p class="note">Ses revenus sont divisés par deux pendant 2 heures. Ça coûte environ 2 heures de ses revenus. Une chance sur trois de te faire griller devant tout le casino. Un sabotage toutes les 30 minutes.</p><div class="row2"><button class="btn" data-close>Laisser tomber</button><button class="btn red" data-act="sabgo" data-v="${el.dataset.v}">Saboter</button></div>`);
ACT.sabgo=async el=>{let r;try{r=await api('sabotage',{id:+el.dataset.v})}catch(e){return}closeModal();toast(r.caught?'Sabotage réussi… mais tu t\'es fait griller !':'Sabotage réussi ('+r.kind+'). Personne ne sait que c\'est toi.');snd(r.caught?'lose':'win')};

/* ---------- Coup de rush (entreprises) ---------- */
const _rBiz=rBiz;rBiz=function(v){_rBiz(v);if(!S.biz.length)return;const wait=(S.rushAt||0)+3600000-now();
  v.insertAdjacentHTML('afterbegin',`<button class="rush6" data-act="rushgo" ${wait>0?'disabled':''}><span class="i">🔥</span><span><b>Coup de rush</b><br><span class="note">${wait>0?'Prochain rush dans '+Math.ceil(wait/60000)+' min':'Sers un max de clients en 12 s : jusqu\'à 1 h de revenus d\'un coup !'}</span></span></button>`);
  if((S.sabotUntil||0)>now())v.insertAdjacentHTML('afterbegin',`<div class="msg lose">🐀 Tes entreprises ont été sabotées : revenus divisés par 2 encore ${Math.ceil((S.sabotUntil-now())/60000)} min.</div>`)};
let RUSH=null;BUSY.push(()=>!!RUSH);
ACT.rushgo=async()=>{let r;try{r=await api('rushStart')}catch(e){return}RUSH={n:0,left:r.dur};const items=['🥙','🍟','🥤','🍔','🌮','🍕'];
  modal(`<p class="mt">🔥 Coup de rush !</p><p class="note">Touche les commandes le plus vite possible.</p><div class="arcbar"><span>Servis <b class="num" id="rsN">0</b></span><span><b class="num" id="rsT">${r.dur}</b> s</span></div><div class="jobzone" id="rsZ"><button id="rsB" aria-label="Servir">${items[0]}</button></div><div id="rsE"></div>`);
  const z=$('#rsZ'),b=$('#rsB');const mv=()=>{b.style.left=rnd(4,z.clientWidth-68)+'px';b.style.top=rnd(4,z.clientHeight-68)+'px';b.textContent=pick(items)};mv();
  const iv=setInterval(async()=>{RUSH.left--;const t=$('#rsT');if(t)t.textContent=RUSH.left;if(RUSH.left>0)return;clearInterval(iv);b.disabled=true;const n=RUSH.n;RUSH=null;let x;try{x=await api('rushEnd',{n})}catch(e){closeModal();return}
    $('#rsE').innerHTML=`<div class="msg win">${x.n} clients servis : +${eur(x.pay)}</div><button class="btn gold big" data-act="mclose">Encaisser</button>`;snd('win')},1000);
  b.onclick=()=>{if(!RUSH)return;RUSH.n++;$('#rsN').textContent=RUSH.n;snd('tick');mv()}};

/* ---------- Histoires ---------- */
let STY=null;
EVT.story=ev=>{STY=ev;snd('notif');modal(`<div class="story"><span class="sic">${ev.ic}</span><span class="who">${esc(ev.who)}</span><p class="mt">${esc(ev.title)}</p><p class="stxt">${esc(ev.text)}</p><div class="list">${ev.choices.map((c,i)=>`<button class="btn ${i?'':'gold'}" data-act="stc" data-v="${i}">${esc(c)}</button>`).join('')}</div></div>`)};
ACT.stc=async el=>{let r;try{r=await api('storyAnswer',{id:STY.id,c:+el.dataset.v})}catch(e){closeModal();return}
  modal(`<div class="story"><span class="sic">${r.ic}</span><span class="who">${esc(r.who)}</span><p class="stxt">${esc(r.txt)}</p>${r.amt?`<div class="msg ${r.amt>0?'win':'lose'}">${r.amt>0?'+':''}${eur(r.amt)}</div>`:''}<button class="btn gold" data-act="mclose">OK</button></div>`);if(r.amt>0){burst(16);snd('win')}else if(r.amt<0)snd('lose')};

/* ---------- Prison ---------- */
const _vcasP=VIEWS.casino;
VIEWS.casino=v=>{if(!((S.jailUntil||0)>now())||sub.casino)return _vcasP(v);
  v.innerHTML=`<div class="prison"><div class="bars" aria-hidden="true"></div><span class="pic">🚔</span><h2>En prison</h2><p class="sub">Libération dans <b class="num" data-secs="${S.jailUntil}">${secs(S.jailUntil)}</b> s. Casino interdit en attendant.</p>
    <div class="list"><button class="btn gold big" data-act="jbribe">💶 Corrompre le gardien (${eur(Math.max(500,Math.round(S.cash*.08)))})</button><button class="btn big" data-act="jesc">🥄 S'évader avec une cuillère</button></div>
    <p class="note">Corrompre : 70 % de chances, sinon +1 minute. Évasion : vise la zone verte, sinon +1 min 30.</p><div id="jEsc"></div></div>`;
  const iv=setInterval(()=>{if(!((S.jailUntil||0)>now())){clearInterval(iv);if(tab==='casino')render()}},1000);onLeave(()=>clearInterval(iv))};
ACT.jbribe=async()=>{let r;try{r=await api('jailBribe')}catch(e){return}if(r.free){toast('Le gardien regarde ailleurs. Tu es libre !');snd('win');burst(12)}else{toast('Le gardien empoche l\'argent… et te rajoute une minute.');snd('lose')}needRender()};
let JE=null;
ACT.jesc=async()=>{let r;try{r=await api('jailEscStart')}catch(e){return}JE={...r,t0:performance.now()};const box=$('#jEsc');if(!box)return;
  box.innerHTML=`<div class="box"><b>Gratte le mur au bon moment</b><div class="lockbar"><i class="zone" style="left:${r.zx}%;width:${r.zone}%"></i><span class="needle" id="jN"></span></div><button class="btn gold big" data-act="jtry">Maintenant !</button></div>`;
  const f=()=>{const n=$('#jN');if(!n||!JE)return;n.style.left=D.needle(performance.now()-JE.t0,JE.speed,JE.ph)+'%';requestAnimationFrame(f)};requestAnimationFrame(f)};
ACT.jtry=async()=>{if(!JE)return;const ms=performance.now()-JE.t0;JE=null;let r;try{r=await api('jailEscTry',{ms})}catch(e){return}if(r.ok){toast('🏃 ÉVADÉ ! Le casino t\'attend.');burst(30);snd('big')}else{toast('Le gardien t\'a vu. +1 min 30.');shake();snd('lose')}needRender()};

/* ---------- Braquages 2.0 : piratage et coffre ---------- */
const HSY=['🔴','🟢','🔵','🟡','🟣','🟠'];
const _heView=GAME_VIEW.heist;
GAME_VIEW.heist=el=>{const h=HE;if(h.phase==='menu'){_heView(el);el.insertAdjacentHTML('beforeend',crewPanel());return}
  if(h.phase!=='hack'&&h.phase!=='safe'){_heView(el);const b=el.querySelector('.box b');if(b&&h.phase==='lock')b.textContent=D.HEISTS[h.i].ic+' Étape 1/4 : crocheter la porte';if(b&&h.phase==='run')b.textContent=D.HEISTS[h.i].ic+' Étape 4/4 : la fuite';return}
  const t=D.HEISTS[h.i],alarm=`<div class="alarm">${[0,1,2].map(i=>`<i class="${i<(h.alert||0)?'on':''}"></i>`).join('')}<span class="note">Niveau d'alerte</span></div>`;
  if(h.phase==='hack'){el.innerHTML=`<div class="box"><b>${t.ic} Étape 2/4 : pirater les caméras</b><p class="note">${D.CREW[1][0]} La Hackeuse : « Retiens la séquence, puis tape-la dans l'ordre. Une erreur et l'alarme sonne. »</p>
      <div class="hseq" id="hSeq">${h.showing?h.seq.map((s,i)=>`<span class="${i===h.showI?'on':''}">${i<=h.showI?HSY[s]:'·'}</span>`).join(''):h.ans.map(s=>`<span class="on">${HSY[s]}</span>`).join('')+'<span class="cur">?</span>'.repeat(Math.max(0,h.seq.length-h.ans.length))}</div>
      ${alarm}<div class="msg ${h.cls||''}">${h.msg||''}</div><div class="hpad">${HSY.map((s,i)=>`<button data-act="hkey" data-v="${i}" ${h.showing||h.busy?'disabled':''} aria-label="Symbole ${i+1}">${s}</button>`).join('')}</div>
      ${h.kevin?'<p class="note">📜 Plan de Kevin utilisé : butin ×1,5.</p>':''}</div>`;return}
  el.innerHTML=`<div class="box"><b>${t.ic} Étape 3/4 : ouvrir le coffre</b><p class="note">Code à 3 chiffres différents. « Bien placé » = bon chiffre au bon endroit. « Mal placé » = bon chiffre, mauvaise place. ${6-h.guesses.length} essai${6-h.guesses.length>1?'s':''} avant la perceuse.</p>
    <div class="safe6"><div class="sdisp num">${(h.cur+'___').slice(0,3).split('').join(' ')}</div><div class="sguess">${h.guesses.map(g=>`<div><b class="num">${g.g}</b><span>${'🟢'.repeat(g.bien)}${'🟡'.repeat(g.mal)}${!g.bien&&!g.mal?'❌':''}</span></div>`).join('')}</div>
    <div class="skeys">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-act="skey" data-v="${k}" ${h.busy||(typeof k==='number'&&h.cur.includes(String(k)))?'disabled':''}>${k}</button>`).join('')}</div></div>${alarm}<div class="msg ${h.cls||''}">${h.msg||''}</div></div>`};
async function hackShow(){const h=HE;h.showing=true;h.ans=[];for(let i=0;i<h.seq.length;i++){h.showI=i;render();snd('tick');await sleep(T(650))}h.showI=-1;await sleep(T(500));h.showing=false;h.msg='À toi ! Tape la séquence.';h.cls='';render()}
const _hepick=ACT.hepick;ACT.hepick=async()=>{const h=HE;if(h.phase!=='lock'||h.busy)return;h.busy=true;const ms=performance.now()-h.t0;let r;try{r=await api('hePick',{ms})}catch(e){h.busy=false;return}h.busy=false;
  if(r.ok){h.msg='Clic ! Une goupille cède.';h.cls='win';snd('pop')}else{h.msg='Raté ! Une alarme se déclenche…';h.cls='lose';snd('lose');shake()}
  if(r.phase==='hack'){Object.assign(h,{phase:'hack',seq:r.seq,alert:r.alert,kevin:r.kevin,ans:[],msg:(r.lockFail?'La porte résiste, on passe par la fenêtre. ':'Porte ouverte ! ')+'Mémorise la séquence…',cls:''});render();await sleep(T(900));hackShow();return}
  Object.assign(h,{zx:r.zx,ph:r.ph,zone:r.zone,speed:r.speed,alert:r.alert,tries:r.tries,hits:r.hits,t0:performance.now()});render()};
ACT.hkey=async el=>{const h=HE;if(h.phase!=='hack'||h.showing||h.busy)return;h.ans.push(+el.dataset.v);snd('tick');if(h.ans.length<h.seq.length)return render();h.busy=true;let r;try{r=await api('heHack',{ans:h.ans})}catch(e){h.busy=false;return}h.busy=false;
  if(r.caught)return heCaught6(r.txt);h.alert=r.alert;Object.assign(h,{phase:'safe',guesses:[],cur:'',msg:r.ok?'Caméras coupées ! Le coffre est devant toi.':'Mauvaise séquence ! Une caméra t\'a filmé (butin réduit).',cls:r.ok?'win':'lose'});snd(r.ok?'win':'lose');if(!r.ok)shake();render()};
ACT.skey=async el=>{const h=HE;if(h.phase!=='safe'||h.busy)return;const k=el.dataset.v;if(k==='⌫'){h.cur=h.cur.slice(0,-1);return render()}if(k!=='OK'){if(h.cur.length<3)h.cur+=k;snd('tick');return render()}
  if(h.cur.length<3)return toast('Tape 3 chiffres.');h.busy=true;let r;try{r=await api('heSafe',{g:h.cur})}catch(e){h.busy=false;return}h.busy=false;h.guesses.push({g:h.cur,bien:r.bien,mal:r.mal});h.cur='';
  if(r.caught)return heCaught6(r.txt);
  if(r.phase==='run'){Object.assign(h,{phase:'run',alert:r.alert,turn:r.turn,hint:r.hint,msg:r.open?'CLAC ! Le coffre s\'ouvre. On remplit le sac et on file !':`Pas trouvé (c'était ${r.code}). Perceuse ! Ça fait du bruit… et du butin en moins.`,cls:r.open?'win':'lose'});snd(r.open?'big':'boom');if(r.open)burst(20);render();return}
  h.msg=r.bien||r.mal?'On chauffe…':'Rien du tout. Change tout.';h.cls='';snd('pop');render()};
function heCaught6(txt){HE={phase:'menu'};snd('boom');shake();vib([200,100,200]);needRender();modal(`<span style="font-size:58px">🚔</span><p class="mt bad">ARRÊTÉ !</p><p>${esc(txt)}</p><p class="note">Direction la prison : 3 minutes. Tu pourras corrompre le gardien ou tenter de t'évader.</p><button class="btn gold" data-act="mclose">Aller en prison</button>`)}
const _heturn=ACT.heturn;ACT.heturn=async el=>{const h=HE;if(h.phase!=='run'||h.busy)return;h.busy=true;let r;try{r=await api('heTurn',{c:+el.dataset.v})}catch(e){h.busy=false;return}h.busy=false;
  if(r.caught)return heCaught6(r.txt);if(r.bad){h.msg='Une voiture de police te colle au train !';h.cls='lose';snd('ring');shake()}else{h.msg='Rue déserte. Bien joué.';h.cls='win';snd('pop')}
  if(r.phase==='split')Object.assign(h,{phase:'split',loot:r.loot,lockFail:r.lockFail});else Object.assign(h,{alert:r.alert,turn:r.turn,hint:r.hint});render()};
const _hesplit=ACT.hesplit;ACT.hesplit=async el=>{let r;try{r=await api('heSplit',{all:el.dataset.v==='1'})}catch(e){return}if(r.caught)return heCaught6(r.txt);HE={...HE,phase:'end',gain:r.gain,txt:r.txt};burst(r.gain>=100000?60:24);snd('big');render()};

/* ---------- Braquages entre potes ---------- */
let CRW=null,CRWT=0;
on('crew',c=>{const prev=CRW;CRW=c;if(c.phase==='play'&&c.needle&&(!prev||prev.phase!=='play'))CRWT=performance.now();
  if(c.phase==='done'&&prev&&prev.phase!=='done')crewDone(c);if(tab==='casino'&&sub.casino==='heist'&&HE.phase==='menu')render();else if(c.phase==='play'&&(!prev||prev.phase!=='play'))notif('💼','Le casse commence !','Va jouer ton rôle tout de suite',()=>go('casino','heist'))});
BUSY.push(()=>CRW&&['play','vote'].includes(CRW.phase));
function crewPanel(){const c=CRW&&CRW.phase!=='done'?CRW:null;
  if(!c)return`<h3>Braquage entre potes</h3><p class="note">Monte une équipe avec des vrais joueurs (jusqu'à 4). Plus vous êtes, plus le butin est gros… mais au moment du partage, chacun peut trahir les autres.</p>
    <div class="list">${D.HEISTS.map((x,i)=>`<div class="lrow2"><span><b>${x.ic} ${x.nm}</b><br><small class="note">Matériel ${eur(x.cost)} (payé par le chef)</small></span><button class="btn sm" data-act="crnew" data-v="${i}" ${S.cash<x.cost?'disabled':''}>Monter l'équipe</button></div>`).join('')}</div>`;
  const t=D.HEISTS[c.i],host=c.host===S.id,me=c.members.find(m=>m.id===S.id),opps=ONLINE.filter(p=>!c.members.some(m=>m.id===p.id));
  let body='';
  if(c.phase==='lobby')body=`<div class="crewm">${c.members.map(m=>`<span>${fc(m,34)}<b>${esc(m.pseudo)}</b>${m.id===c.host?'<small>chef</small>':''}</span>`).join('')}</div>
    ${host?`<h3 style="margin:8px 0 4px">Inviter</h3><div class="opp">${opps.slice(0,10).map(p=>`<button data-act="crinv" data-v="${p.id}"><span class="av">${fc(p,34)}</span><b>${esc(p.pseudo)}</b></button>`).join('')||'<div class="empty">Personne d\'autre en ligne.</div>'}</div>
      <div class="row2"><button class="btn" data-act="crleave">Annuler</button><button class="btn gold" data-act="crlaunch" ${c.members.length<2?'disabled':''}>Lancer le casse</button></div>`:'<p class="note">En attente du chef…</p><button class="btn" data-act="crleave">Quitter l\'équipe</button>'}`;
  else if(c.phase==='play')body=`<p class="note">Chacun crochète sa serrure : appuie quand l'aiguille est dans la zone verte. Un seul essai !</p>${c.needle?`<div class="lockbar"><i class="zone" style="left:${c.needle.zx}%;width:${c.needle.zone}%"></i><span class="needle" id="crN"></span></div><button class="btn gold big" data-act="crpick">Crocheter !</button>`:'<div class="msg">Fait ! On attend les autres…</div>'}
    <div class="crewm">${c.members.map(m=>`<span>${fc(m,34)}<b>${esc(m.pseudo)}</b><small>${m.ok===null?'…':m.ok?'✅':'❌'}</small></span>`).join('')}</div>`;
  else if(c.phase==='vote')body=`<div class="center"><span style="font-size:44px">💼</span><p>Butin : <b class="num" style="color:var(--gold)">${eur(c.loot)}</b></p><p class="note">Fin du vote dans <b data-secs="${c.endsAt}">${secs(c.endsAt)}</b> s. Si tout le monde partage : ${eur(c.loot/c.members.length)} chacun. Un seul traître : il prend 70 %. Plusieurs traîtres : tout le monde se balance, presque tout part aux flics.</p></div>
    ${me&&!me.voted?`<div class="row2"><button class="btn gold big" data-act="crvote" data-v="0">🤝 Partager</button><button class="btn red big" data-act="crvote" data-v="1">🐍 Trahir</button></div>`:'<div class="msg">Choix enregistré. Suspense…</div>'}
    <div class="crewm">${c.members.map(m=>`<span>${fc(m,34)}<b>${esc(m.pseudo)}</b><small>${m.voted?'a choisi':'réfléchit…'}</small></span>`).join('')}</div>`;
  if(c.phase==='play'&&c.needle)setTimeout(crNeedle,30);
  return`<h3>Braquage entre potes · ${t.ic} ${t.nm}</h3><div class="box">${body}</div>`}
function crNeedle(){const n=$('#crN');if(!n||!CRW||!CRW.needle)return;n.style.left=D.needle(performance.now()-CRWT,CRW.needle.speed,CRW.needle.ph)+'%';requestAnimationFrame(crNeedle)}
function crewDone(c){const me=c.members.find(m=>m.id===S.id);if(!me)return;const txt=c.res==='caught'?'Toute l\'équipe s\'est fait arrêter. Le fourgon était plein.':c.res==='share'?'Tout le monde a joué le jeu. Respect.':c.res==='betray'?'Il y avait un traître dans l\'équipe…':c.res==='chaos'?'Plusieurs traîtres : tout le monde s\'est balancé.':'Le casse est annulé.';
  whenFree(()=>modal(`<p class="mt">${c.res==='share'?'🤝 Casse réussi !':c.res==='caught'?'🚔 Arrêtés !':'🐍 Trahison !'}</p><p>${txt}</p><div class="list">${c.members.map(m=>`<div class="lrow2"><span>${fc(m,30)} <b>${esc(m.pseudo)}</b> ${m.betray?'🐍':''}</span><b class="num">${eur(m.gain||0)}</b></div>`).join('')}</div><button class="btn gold" data-act="mclose">OK</button>`));if((me.gain||0)>0){burst(20);snd('big')}}
ACT.crnew=async el=>{try{await api('crewCreate',{i:+el.dataset.v});snd('chip')}catch(e){}};
ACT.crinv=async el=>{try{await api('crewInvite',{id:CRW.id,to:+el.dataset.v});toast('Invitation envoyée.')}catch(e){}};
ACT.crleave=async()=>{try{await api('crewLeave');CRW=null;render()}catch(e){}};
ACT.crlaunch=async()=>{try{await api('crewLaunch')}catch(e){}};
ACT.crpick=async()=>{const ms=performance.now()-CRWT;try{const r=await api('crewPick',{ms});toast(r.ok?'Serrure crochetée !':'Raté… espère que les autres assurent.');snd(r.ok?'pop':'lose')}catch(e){}};
ACT.crvote=async el=>{try{await api('crewVote',{betray:el.dataset.v==='1'});snd('tick')}catch(e){}};
EVT.crewInv=ev=>{snd('notif');modal(`<div class="center">${fc({av:ev.av},64)}</div><p class="mt">${esc(ev.from)} monte un casse</p><p>Cible : <b>${esc(ev.target)}</b>. Tu en es ?</p><div class="row2"><button class="btn" data-close>Non merci</button><button class="btn gold" data-act="crjoin" data-v="${ev.id}">J'en suis 😎</button></div>`)};
ACT.crjoin=async el=>{try{await api('crewJoin',{id:el.dataset.v});closeModal();go('casino','heist')}catch(e){closeModal()}};

/* ---------- Notifications sur le téléphone ---------- */
const pushOK=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const pushOn=()=>(S.push||[]).length>0&&pushOK()&&Notification.permission==='granted';
const b64=s=>{const p='='.repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
ACT.pushon=async()=>{if(!pushOK()){const ios=/iPhone|iPad/.test(navigator.userAgent);return modal(`<p class="mt">🔔 Notifications</p><p>${ios?'Sur iPhone, ajoute d\'abord Fauché à ton écran d\'accueil (Safari › Partager › « Sur l\'écran d\'accueil »), puis ouvre l\'appli depuis l\'icône et reviens ici.':'Ton navigateur ne gère pas les notifications. Essaie avec Chrome ou Safari à jour.'}</p><button class="btn gold" data-close>OK</button>`)}
  try{const perm=await Notification.requestPermission();if(perm!=='granted')return toast('Notifications refusées. Tu peux les réactiver dans les réglages du téléphone.');const reg=await navigator.serviceWorker.ready;const{key}=await api('pushKey');
    const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(key)});await api('pushSub',{sub:sub.toJSON()});toast('🔔 Notifications activées !');needRender()}catch(e){toast('Impossible d\'activer les notifications ici.')}};
ACT.pushoff=async()=>{try{const reg=await navigator.serviceWorker.ready;const s=await reg.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(e){}try{await api('pushOff');toast('Notifications coupées.');needRender()}catch(e){}};
const _rCompte=rCompte;rCompte=function(v){_rCompte(v);const h=[...v.querySelectorAll('h3')].find(x=>x.textContent==='Réglages');if(h)h.insertAdjacentHTML('afterend',`<div class="box"><b>🔔 Notifications sur le téléphone</b><span class="note">Coffre du jour, prêts, duels, fin de semaine… même quand l'appli est fermée. Sur iPhone : ajoute d'abord Fauché à l'écran d'accueil.</span>${pushOn()?'<button class="btn sm" data-act="pushoff">Couper les notifications</button>':'<button class="btn gold sm" data-act="pushon">Activer les notifications</button>'}</div>`)};
TUTO[1][1]=GAMES.length+' jeux de casino';
