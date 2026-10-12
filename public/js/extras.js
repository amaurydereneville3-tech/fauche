/* ====================== BIG WIN ====================== */
// Le serveur envoie 'res' à chaque partie. On affiche le BIG WIN une fois l'animation du jeu terminée.
function bigCheck(){} // gardé pour compatibilité : tout passe par l'événement 'res'
const autoBusy=()=>!!AUTO;
const gameBusy=()=>holdCash||BUSY.some(f=>f!==autoBusy&&f());
async function waitFree(max=9000){const t0=Date.now();while(gameBusy()&&Date.now()-t0<max)await sleep(150)}
on('res',async r=>{if(!r||!r.stake)return;const net=r.pay-r.stake;if(net<Math.max(500,r.stake*10))return;await sleep(250);await waitFree();bigWin(net,net/r.stake)});
function bigWin(amt,x){if($('.bigwin'))return;const lv=x>=60?['EPIC WIN','#ff5fb2']:x>=25?['MEGA WIN','#7b3fc4']:['BIG WIN','#e3b558'];const o=document.createElement('div');o.className='bigwin';o.style.setProperty('--bw',lv[1]);
  o.innerHTML=`<div class="bwin"><div class="rays"></div><b class="t">${lv[0]}</b><b class="n num" id="bwN">0 €</b><span class="note">Touche pour continuer</span></div>`;document.body.appendChild(o);snd('big');vib([60,40,60,40,120]);
  const t0=performance.now(),dur=RM?200:2200;const f=t=>{const p=Math.min(1,(t-t0)/dur),e=$('#bwN');if(e)e.textContent=eur(amt*easeOutCubic(p));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f);
  let k=0;const iv=setInterval(()=>{burst(14);if(++k>4)clearInterval(iv)},400);const close=()=>{clearInterval(iv);o.remove()};o.onclick=close;setTimeout(close,AUTO?2600:4800)}

/* ====================== Mode auto ====================== */
let AUTO=null;
const AUTO_FN={sl:()=>ACT.slspin(),gold:()=>ACT.gspin(),mega:()=>ACT.mgspin(),limbo:()=>ACT.lbgo(),keno:()=>ACT.kgo(),plinko:()=>ACT.pldrop({dataset:{v:'1'}})};
BUSY.push(autoBusy);
function autoUI(g){if(AUTO&&AUTO.g===g)return`<div class="autobar on"><span>🔁 Auto : <b class="num">${AUTO.left}</b> tour${AUTO.left>1?'s':''} restant${AUTO.left>1?'s':''} · ${AUTO.net>=0?'+':''}${eur(AUTO.net)}</span><button class="btn red sm" data-act="autostop">Stop</button></div>`;
  return`<div class="autobar"><span>🔁 Mode auto</span>${[10,25,50].map(n=>`<button class="btn sm" data-act="autogo" data-v="${n}" data-g="${g}">${n}</button>`).join('')}</div><p class="note" style="margin-top:-6px">L'auto s'arrête tout seul si tu perds la moitié de ce que tu avais au départ.</p>`}
Object.keys(AUTO_FN).forEach(g=>{const o=GAME_VIEW[g];if(!o)return;GAME_VIEW[g]=el=>{o(el);const big=el.querySelector('.btn.big.gold');if(big)(big.closest('.row2')||big).insertAdjacentHTML('afterend',autoUI(g));else el.insertAdjacentHTML('beforeend',autoUI(g))}});
ACT.autogo=async el=>{if(AUTO)return;const g=el.dataset.g,n=+el.dataset.v;if(g==='keno'&&!KE.pick.length)return toast('Coche d\'abord tes numéros.');if(!canBet(ST[g]))return;
  AUTO={g,left:n,start:S.cash,net:0};render();
  while(AUTO&&AUTO.left>0){if(tab!=='casino'||sub.casino!==g)break;if(ST[g]>S.cash){toast('Auto arrêté : plus assez d\'argent.');break}
    const before=S.cash;try{await AUTO_FN[g]()}catch(e){break}if(g==='plinko'){await sleep(T(400));while(PL.balls.length)await sleep(100)}if(!AUTO)break;await sleep(80);AUTO.left--;AUTO.net+=S.cash-before;
    if(S.cash<AUTO.start*.5){toast('Auto arrêté : tu as perdu la moitié de ta cagnotte de départ.');break}render();await sleep(T(450))}
  AUTO=null;render()};
ACT.autostop=()=>{if(AUTO)AUTO.left=0};

/* ====================== Historique dans chaque jeu ====================== */
const _vcas=VIEWS.casino;
VIEWS.casino=v=>{_vcas(v);const g=sub.casino;if(!g||!$('#gm')||S.banUntil>now())return;const h=(S.hist||[]).filter(x=>x.g===g).slice(0,20);if(!h.length)return;
  const net=h.reduce((a,x)=>a+x.p-x.s,0);$('#gm').insertAdjacentHTML('beforeend',`<details class="paydetails"><summary>Mes ${h.length} dernières parties · ${net>=0?'+':''}${eur(net)}</summary><div class="hlist">${h.map(x=>{const n=x.p-x.s;return`<div><span class="note">${new Date(x.t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span><span class="num">mise ${eur(x.s)}</span><b class="num ${n>0?'upc':n<0?'dnc':''}">${n>0?'+':''}${eur(n)}</b></div>`}).join('')}</div></details>`)};

/* ====================== Pass de saison ====================== */
const passTier=()=>Math.min(D.PASS.length,Math.floor(S.pass.xp/D.PASS_XP));
const BOOSTN={requin:['🦈','Élixir du Requin'],parrain:['🎩','Cigare du Parrain'],flambeur:['🔥','Shot de Flambeur']};
function passLabel(r){const[v,t,nm,it]=r;if(t==='cash')return['💵',eur(v)];if(t==='crate')return['📦',{b:'Caisse Bronze',a:'Caisse Argent',o:'Caisse Or'}[v]];if(t==='xpboost')return['⚡','XP ×2 · 30 min'];
  if(t==='face')return[v,'Visage '+v+' + titre « '+nm+' »'+(it?' + '+itemInfo(it).nm:'')];const b=BOOSTN[t]||['✨',t];return[b[0],v+' × '+b[1]]}
function rPass(v){const t=passTier(),cur=S.pass.xp%D.PASS_XP,N=D.PASS.length;
  v.innerHTML=`<div class="passhead"><span><b>Pass de saison · Saison 1</b><br><span class="note">Gagne de l'XP en jouant pour monter les paliers. Gratuit pour tout le monde.</span></span><b class="num ptier">${t}/${N}</b></div>
  ${t<N?`<div><div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--muted)"><span>Palier ${t+1}</span><span class="num">${cur}/${D.PASS_XP} XP</span></div><div class="progress"><i style="width:${cur/D.PASS_XP*100}%"></i></div></div>`:''}
  <div class="passlist">${D.PASS.map((r,i)=>{const[ic,lb]=passLabel(r),got=S.pass.claimed.includes(i),open=i<t;return`<div class="ptile ${got?'got':open?'open':''} ${r[1]==='face'?'epic':''}"><span class="pn num">${i+1}</span><span class="pic">${ic}</span><span class="pl">${lb}</span>${got?'<span class="tag">✓</span>':open?`<button class="btn gold sm" data-act="pclaim" data-v="${i}">Prendre</button>`:'<span class="note">🔒</span>'}</div>`}).join('')}</div>`;
  const first=v.querySelector('.ptile.open')||v.querySelectorAll('.ptile')[Math.max(0,t-1)];if(first)setTimeout(()=>first.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'}),30)}
ACT.pclaim=async el=>{const i=+el.dataset.v,r=D.PASS[i];el.disabled=true;try{await api('passClaim',{i})}catch(e){return}needRender();burst(r[1]==='face'?40:16);snd('big');
  if(r[1]==='crate')toast('Caisse ajoutée : ouvre-la gratuitement dans Boutique › Caisses');else if(r[1]==='face')toast('Débloqué : '+r[0]+' « '+r[2]+' »')};

/* ====================== Missions de la semaine ====================== */
const _rMis=rMissions;
rMissions=async function(v){await _rMis(v);if(sub.moi!=='missions'||!$('#mvv'))return;let L;try{L=(await api('wmissions')).list}catch(e){return}if(sub.moi!=='missions'||!$('#mvv'))return;
  v.insertAdjacentHTML('beforeend',`<h3>Missions de la semaine</h3><p class="note">Plus dures, beaucoup mieux payées. Nouvelles missions chaque lundi.</p>`+L.map(m=>{const M=D.WMIS.find(x=>x.id===m.id);if(!M)return'';const done=m.p>=M.n;
  return`<div class="mission ${done?'done':''}"><span><b>${M.t}</b><br><span class="note">Récompense : ${eur(M.rw)} + 200 XP</span></span>${m.c?'<span class="tag">✓ Fait</span>':done?`<button class="btn gold sm" data-act="wclaim" data-v="${m.id}">Récupérer</button>`:`<span class="num note">${M.type==='mult'?x2(m.p):fr.format(Math.min(m.p,M.n))} / ${M.type==='mult'?x2(M.n):fr.format(M.n)}</span>`}<div class="progress"><i style="width:${Math.min(100,m.p/M.n*100)}%"></i></div></div>`}).join(''))};
ACT.wclaim=async el=>{el.disabled=true;try{await api('wclaim',{id:el.dataset.v})}catch(e){return}burst(30);snd('big');needRender()};

/* ====================== Titres, musique, tutoriel, crédits ====================== */
ACT.ttl=async()=>{let L;try{L=(await api('titles')).list}catch(e){return}
  modal(`<p class="mt">Choisis ton titre</p><p class="note">Il s'affiche sous ton nom, dans le chat et au classement. Les succès et le Pass en débloquent de nouveaux.</p><div class="list" style="max-height:50vh;overflow:auto">${['',...L].map(t=>`<button class="lrow2" data-act="ttlset" data-v="${esc(t)}" style="${(S.titleSel||'')===t?'border-color:var(--gold)':''}"><span>${t?esc(t):'Titre du niveau (automatique)'}</span>${(S.titleSel||'')===t?'✓':''}</button>`).join('')}</div><button class="btn" data-close>Fermer</button>`)};
ACT.ttlset=async el=>{try{await api('setTitle',{t:el.dataset.v})}catch(e){return}closeModal();needRender()};
const MUSIC=()=>store.get('fauche-music')!=='0';
let MUS=null;
function musicStart(){const a=ac();if(!a||MUS||!MUSIC()||!SOUND())return;const g=a.createGain();g.gain.value=.035;g.connect(a.destination);let bar=0;
  const CH=[[57,60,64,67],[50,53,57,60],[55,59,62,65],[48,52,55,59]],hz=m=>440*Math.pow(2,(m-69)/12),beat=60/84;
  const playBar=()=>{if(!MUSIC()||!MUS)return;const t=a.currentTime+.05,c=CH[bar%4];
    c.forEach(m=>{const o=a.createOscillator(),e=a.createGain();o.type='triangle';o.frequency.value=hz(m);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.18,t+.4);e.gain.linearRampToValueAtTime(0,t+beat*4);o.connect(e).connect(g);o.start(t);o.stop(t+beat*4+.05)});
    [0,2].forEach(k=>{const o=a.createOscillator(),e=a.createGain();o.type='sine';o.frequency.value=hz(c[0]-12);e.gain.setValueAtTime(.5,t+k*beat);e.gain.exponentialRampToValueAtTime(.001,t+k*beat+beat*.9);o.connect(e).connect(g);o.start(t+k*beat);o.stop(t+k*beat+beat)});
    for(let k=0;k<4;k++){const o=a.createOscillator(),e=a.createGain();o.type='sine';o.frequency.value=hz(c[(k+bar)%4]+12);e.gain.setValueAtTime(0,t+k*beat+beat/2);e.gain.linearRampToValueAtTime(.08,t+k*beat+beat/2+.02);e.gain.exponentialRampToValueAtTime(.001,t+k*beat+beat);o.connect(e).connect(g);o.start(t+k*beat+beat/2);o.stop(t+k*beat+beat+.02)}
    bar++};
  MUS={g,iv:setInterval(playBar,beat*4000)};playBar()}
function musicStop(){if(MUS){clearInterval(MUS.iv);try{MUS.g.disconnect()}catch(e){}MUS=null}}
document.addEventListener('pointerdown',()=>{if(S&&MUSIC()&&SOUND()&&!MUS)musicStart()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)musicStop()});
ACT.music=()=>{store.set('fauche-music',MUSIC()?'0':'1');if(MUSIC())musicStart();else musicStop();render()};
const _snd0=ACT.sound;ACT.sound=el=>{_snd0(el);if(!SOUND())musicStop()};
const CREDIT=`<div class="credit">Fauché · imaginé et créé par <b>${esc(D.CREDIT||'Momo')}</b> 👑</div>`;
ACT.about=()=>modal(`<div class="tuto"><span class="ti">💸</span><p class="mt">Fauché</p><p>Le casino où l'argent ne sert qu'à flexer.</p><p>Idée, concept et direction : <b>${esc(D.CREDIT||'Momo')}</b>.</p><p class="note">Argent 100 % fictif : rien ne s'achète ni ne se retire en vrai argent. Réservé aux plus de 18 ans. Si le jeu d'argent devient un problème pour toi ou un proche : Joueurs Info Service, 09 74 75 13 13 (appel non surtaxé).</p><button class="btn gold" data-close>Fermer</button></div>`);
const _rProf=rProfil;
rProfil=function(v){_rProf(v);v.insertAdjacentHTML('afterbegin',`<button class="lrow2" data-act="ttl"><span>🏷️ Ton titre : <b>${esc(title())}</b></span><span class="note">Changer ›</span></button>`);
  const s=v.querySelector('[data-act="sound"]');if(s)s.parentElement.insertAdjacentHTML('afterend',`<div class="row2"><button class="btn" data-act="music">${MUSIC()?'🎵 Musique : oui':'🎵 Musique : non'}</button><button class="btn" data-act="tuto">📖 Revoir le tutoriel</button></div><button class="btn" data-act="about">ℹ️ À propos de Fauché</button>`);
  v.insertAdjacentHTML('beforeend',CREDIT)};

const TUTO=[['💸','Bienvenue sur Fauché','Un casino en ligne où tout l\'argent est fictif. Le but : devenir le plus riche… et flexer devant tout le monde.<br><br><b>Un jeu créé par Momo.</b>'],
  ['🎰',GAMES.length+' jeux de casino','Poker et blackjack à plusieurs, roulette et Crash en direct, vidéo poker, Megaways, braquages, tournois… Certains se débloquent en montant de niveau.'],
  ['🛍️','Dépense pour flexer','Voitures, yachts, immeubles : tout apparaît dans ta ville. Ta carte bancaire change avec ta fortune et tout le monde la voit.'],
  ['⭐','Missions et Pass de saison','Chaque partie donne de l\'XP. Missions du jour, de la semaine et 30 paliers de récompenses.'],
  ['💬','Joue avec les autres','Chat, prêts entre joueurs, duels, jackpot commun, tournoi du jour. Le Croupier annonce les gros coups à tout le casino.']];
let tutoI=0;
function tuto(i=0){tutoI=i;const[ic,t,x]=TUTO[i];modal(`<div class="tuto"><span class="ti">${ic}</span><p class="mt">${t}</p><p>${x}</p><div class="dots">${TUTO.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>
  <div class="row2">${i?'<button class="btn" data-act="tprev">Retour</button>':'<button class="btn" data-act="tskip">Passer</button>'}<button class="btn gold" data-act="tnext">${i<TUTO.length-1?'Suivant':S.tutoDone?'C\'est parti !':'C\'est parti ! +500 €'}</button></div></div>`)}
async function tutoEnd(){closeModal();if(!S.tutoDone){try{const r=await api('tutoDone');if(r.bonus){burst(30);snd('big');toast('Cadeau de bienvenue : +'+eur(r.bonus))}}catch(e){}}}
ACT.tnext=()=>{if(tutoI<TUTO.length-1)return tuto(tutoI+1);tutoEnd()};
ACT.tprev=()=>tuto(Math.max(0,tutoI-1));
ACT.tskip=()=>tutoEnd();
ACT.tuto=()=>tuto(0);
let tutoChecked=false;
on('me',d=>{if(tutoChecked||!d)return;tutoChecked=true;if(!d.tutoDone)setTimeout(()=>{if(!modalOpen())tuto(0)},700)});

/* ====================== Accueil ====================== */
function petMood(){if(!S.pet)return null;const h=(now()-S.pet.fedAt)/36e5;return h<8?['😍','Aux anges',1]:h<24?['🙂','Content',Math.max(.15,1-h/24)]:['😾','Boude (plus de bonus)',0]}
VIEWS.home=v=>{const L=D.levelOf(S.xp),d=parisDate(),day=S.day&&S.day.date===d?S.day:{net:0,games:0,best:0},lg=GAMES.find(g=>g.id===D.luckyGame(dkey()))||GAMES[0],pe=S.pending,C=S.challenge,cact=C&&!C.done&&now()<C.until;
  const recent=[...new Set((S.hist||[]).map(h=>h.g))].map(id=>GAMES.find(g=>g.id===id)).filter(Boolean).slice(0,4),t=passTier(),passOpen=D.PASS.filter((_,i)=>i<t&&!S.pass.claimed.includes(i)).length;
  const h=new Date().getHours(),hi=h<5?'Encore debout':h<12?'Bonjour':h<18?'Salut':'Bonsoir',P=S.pet&&D.PETS.find(p=>p.id===S.pet.id),pm=petMood();
  v.innerHTML=`<div class="hello"><div>${avHTML(56)}</div><div style="min-width:0"><h2 style="margin:0">${hi} ${esc(me())} 👋</h2><span class="note">Niveau ${L.l} · ${esc(title())} · ${ONLINE.length} en ligne</span></div></div>
  <div class="daycard"><div><span class="note">Aujourd'hui</span><b class="num ${day.net>0?'upc':day.net<0?'dnc':''}">${day.net>=0?'+':''}${eur(day.net)}</b></div><div><span class="note">Parties</span><b class="num">${day.games}</b></div><div><span class="note">Meilleur coup</span><b class="num">${eur(Math.max(0,day.best))}</b></div></div>
  <div class="hgrid">
    ${giftReady()?`<button class="hcard hot" data-act="gift"><span class="i">🎁</span><b>Cadeaux du jour</b><span class="note">Coffre + roue gratuite${S.streak&&S.streak.n?' · série '+S.streak.n+' 🔥':''}</span></button>`:''}
    <button class="hcard" data-act="go" data-t="casino" data-s="${lg.id}"><span class="i">🔮</span><b>${lg.ic} ${lg.nm}</b><span class="note">Jeu chanceux du jour : +10 %</span></button>
    <button class="hcard" data-act="go" data-t="casino" data-s="gold"><span class="i">💰</span><b class="num" data-jk>${eur(JACKPOT_G)}</b><span class="note">Jackpot commun de la Machine Dorée</span></button>
    ${cact?`<button class="hcard hot" data-act="go" data-t="casino" data-s="${C.game}"><span class="i">🤝</span><b>Défi du Croupier</b><span class="note">${esc(C.txt)} · encore ${Math.ceil((C.until-now())/60000)} min · ${eur(C.amt)}</span></button>`:''}
    ${JACKPOT>now()?`<button class="hcard hot" data-act="go" data-t="casino" data-s="sl"><span class="i">🎰</span><b>Jackpot géant</b><span class="note">Machine à sous ×2</span></button>`:''}
    <button class="hcard" data-act="go" data-t="moi" data-s="missions"><span class="i">🎯</span><b>Missions</b><span class="note">Du jour et de la semaine</span></button>
    <button class="hcard ${passOpen?'hot':''}" data-act="go" data-t="moi" data-s="pass"><span class="i">⭐</span><b>Pass · palier ${t}/${D.PASS.length}</b><span class="note">${passOpen?passOpen+' récompense'+(passOpen>1?'s':'')+' à prendre !':'Prochain : '+(t<D.PASS.length?passLabel(D.PASS[t])[1]:'terminé')}</span></button>
    <button class="hcard" data-act="go" data-t="casino" data-s="tourney"><span class="i">🏆</span><b>Tournoi du jour</b><span class="note">20 tours, classement entre joueurs</span></button>
    ${pe>=1?`<button class="hcard" data-act="go" data-t="marches" data-s="biz"><span class="i">🏪</span><b>${eur(pe)}</b><span class="note">à encaisser de tes entreprises</span></button>`:''}
    ${P&&!pm[2]?`<button class="hcard hot" data-act="go" data-t="moi" data-s="pet"><span class="i">${P.ic}</span><b>${P.nm} a faim</b><span class="note">Plus de bonus tant qu'il boude</span></button>`:''}
    ${unread?`<button class="hcard" data-act="go" data-t="social" data-s="chat"><span class="i">💬</span><b>${unread} message${unread>1?'s':''}</b><span class="note">dans le chat du casino</span></button>`:''}
  </div>
  ${recent.length?`<h3>Reprendre</h3><div class="lobby">${recent.map(x=>`<button class="tile" style="--tc:${x.c}" data-act="go" data-t="casino" data-s="${x.id}"><span class="ic" aria-hidden="true">${x.ic}</span><span><span class="nm">${x.nm}</span><br><span class="tg">${x.tg}</span></span></button>`).join('')}</div>`:''}
  <h3>Nouveautés</h3><div class="lobby">${GAMES.filter(g=>g.nw).map(x=>`<button class="tile" style="--tc:${x.c}" data-act="go" data-t="casino" data-s="${x.id}">${x.lv&&LV()<x.lv?`<span class="lockb">🔒 Niv. ${x.lv}</span>`:'<span class="new">NOUVEAU</span>'}<span class="ic" aria-hidden="true">${x.ic}</span><span><span class="nm">${x.nm}</span><br><span class="tg">${x.tg}</span></span></button>`).join('')}</div>
  ${CREDIT}`};
ACT.go=el=>{if(busyAny())return toast('Termine ta partie avant de changer d\'écran.');const t=el.dataset.t,s=el.dataset.s;const g=t==='casino'&&GAMES.find(x=>x.id===s);if(g&&g.lv&&LV()<g.lv)return ACT.locked({dataset:{v:s}});if(t==='social')unread=0;snd('tick');go(t,s)};

/* ====================== Entreprises améliorables ====================== */
ACT.bizup=async el=>{const b=D.BIZ.find(x=>x.id===el.dataset.v);el.disabled=true;let r;try{r=await api('bizUp',{id:b.id})}catch(e){return}toast(b.nm+' passe niveau '+r.lv+' : '+eur(D.bizInc(b,r.lv))+' / h');burst(16);snd('level');needRender()};

/* ====================== Ma ville, garage, courses de rue ====================== */
ST.street=100;
function rVille(v){const has=id=>S.items.includes(id),bz=S.biz.map(id=>D.BIZ.find(b=>b.id===id)).filter(Boolean);
  const cars=Object.keys(D.CARS).filter(id=>has(id)).sort((a,c)=>D.CARS[c]-D.CARS[a]),P=S.pet&&D.PETS.find(p=>p.id===S.pet.id);
  v.innerHTML=`<div class="city">
    <div class="sky"><span class="sun">☀️</span>${has('jet')?'<span class="plane">✈️</span>':''}${has('sp_air')?'<span class="plane p2">🛩️</span>':''}</div>
    <div class="skyline">${has('imm')?'<span class="bld b1">🏢'+(has('helico')?'<i class="heli">🚁</i>':'')+'</span>':'<span class="bld ghost">🏢</span>'}${has('studio')?'<span class="bld">🏠</span>':'<span class="bld ghost">🏠</span>'}${has('ps_statue')?'<span class="bld">🗿</span>':''}${has('ecurie')?'<span class="bld">🏁</span>':''}</div>
    <div class="street">${bz.map(b=>`<span class="shop" title="${b.nm}">${b.ic}<small>niv ${S.bizLv[b.id]||1}</small></span>`).join('')||'<span class="note">Aucune entreprise dans ta rue.</span>'}</div>
    <div class="road3">${cars.map(id=>`<span>${itemInfo(id).ic}</span>`).join('')}${P?`<span>${P.ic}</span>`:''}<span class="cityav">${avHTML(40)}</span></div>
    <div class="sea">${has('yacht')?'<span>🛥️</span>':''}${has('ps_yacht')?'<span>🛳️</span>':''}${has('jetski')?'<span>🌊</span>':''}${has('sp_sea')?'<span>🚤</span>':''}${has('villa')||has('ile')?'<span class="isl">🏝️</span>':''}</div></div>
  <p class="note">Tout ce que tu achètes apparaît dans ta ville. Il te manque encore ${D.SHOP.filter(x=>!has(x.id)).length} objets de la boutique.</p>
  <h3>Garage et courses de rue</h3>${cars.length?`<div class="list">${cars.map(id=>`<div class="lrow2"><span>${itemInfo(id).ic} ${itemInfo(id).nm}</span><span class="num note">vitesse ${D.CARS[id]}/12</span></div>`).join('')}</div>
    ${stakeUI('street')}<div class="row2">${D.BOTCARS.map((b,i)=>`<button class="btn sm" data-act="stgo" data-v="${i}">Défier ${b[0]} ${b[1].split(' de ')[1]}</button>`).join('')}</div><p class="note">Ta voiture la plus rapide court. Plus elle est rapide, plus tu as de chances. Bilan : ${S.street.w} victoire${S.street.w>1?'s':''}, ${S.street.l} défaite${S.street.l>1?'s':''}.</p>`
  :'<div class="empty">Pas de voiture dans ton garage. Achète une trottinette, un scooter ou mieux en boutique pour faire des courses de rue.</div>'}`}
let RACE=false;BUSY.push(()=>RACE);
ACT.stgo=async el=>{if(RACE)return;const b=D.BOTCARS[+el.dataset.v],amt=ST.street;if(!canBet(amt))return;RACE=true;holdCash=1;let r;
  try{r=await api('streetRace',{i:+el.dataset.v,amt})}catch(e){RACE=false;release();return}
  modal(`<p class="mt">Course de rue</p><div class="drag"><div class="dl"><span id="c1">${itemInfo(r.car).ic}</span></div><div class="dl"><span id="c2">${b[0]}</span></div><i class="fin"></i></div><div class="msg" id="stMsg">3… 2… 1…</div><p class="note">Toi (vitesse ${r.sp}) contre ${b[1]} (vitesse ${b[2]}). Gain si victoire : ${eur(amt*r.odd)}</p><div id="stEnd"></div>`);
  let a=0,c=0;await sleep(T(700));const m0=$('#stMsg');if(m0)m0.textContent='GO !';snd('pop');
  await new Promise(res=>{const iv=setInterval(()=>{a+=rnd(1,4)*(r.win?1.08:.95);c+=rnd(1,4)*(r.win?.95:1.08);if(r.win&&c>=86)c=85;if(!r.win&&a>=86)a=85;const e1=$('#c1'),e2=$('#c2');if(e1)e1.style.left=Math.min(88,a)+'%';if(e2)e2.style.left=Math.min(88,c)+'%';if(Math.max(a,c)>=88||!e1){clearInterval(iv);res()}},RM?10:60)});
  RACE=false;release();if(r.win){burst(20);snd('win')}else snd('lose');
  const m=$('#stMsg');if(m){m.textContent=r.win?'Victoire ! +'+eur(r.pay-amt):'Défaite… '+b[1]+' te met la honte.';m.className='msg '+(r.win?'win':'lose')}const e=$('#stEnd');if(e)e.innerHTML='<button class="btn gold" data-act="mclose">OK</button>'};

/* ====================== Animal porte-bonheur ====================== */
const PET_TALK={cat:['Miaou. (Traduction : « Mise tout sur le noir. »)','Le chat te fixe. Il sait pour tes dettes.','Ronron… Il a l\'air de porter chance. Ou malheur.'],dog:['Ouaf ! Il a ramené un ticket de loto par terre.','Il remue la queue. Lui, il t\'aime même fauché.','Il veut aller livrer des kebabs avec toi.'],
  parrot:['« FAUCHÉ ! FAUCHÉ ! »','« Tapis ! Tapis ! »','« Appelle ton père ! » Il a dû l\'entendre quelque part.'],pig:['Groin. La tirelire fait un bruit encourageant.','Il refuse de rendre la monnaie.','Gros Billet a l\'air content de son épargne.']};
function rPet(v){if(!S.pet){v.innerHTML=`<p class="note">Adopte un compagnon : nourris-le chaque jour et il te donne un bonus.</p>`+D.PETS.map(p=>`<div class="petcard"><span class="pic">${p.ic}</span><span><b>${p.nm}</b> · ${p.sp}<br><span class="note">${p.bonus}</span></span><button class="btn gold sm" data-act="padopt" data-v="${p.id}" ${S.cash<p.pr?'disabled':''}>${eur(p.pr)}</button></div>`).join('');return}
  const P=D.PETS.find(x=>x.id===S.pet.id),m=petMood();
  v.innerHTML=`<div class="petroom"><span class="big" id="petBig">${P.ic}</span><span class="mood">${m[0]}</span></div>
  <div class="box"><div style="display:flex;justify-content:space-between;align-items:center"><b>${P.nm} · ${P.sp}</b><span class="tag ${m[2]?'':'bad'}">${m[1]}</span></div>
    <div class="note">Ventre plein</div><div class="progress"><i style="width:${m[2]*100}%"></i></div><p class="note" style="margin:0">Bonus : ${P.bonus}${m[2]?' · actif ✓':' · inactif, nourris-le !'}</p>
    ${P.id==='pig'?`<div class="lrow2"><span>Dans la tirelire</span><b class="num" style="color:var(--gold)">${eur(S.pet.bank||0)}</b></div>`:''}
    <div class="row2"><button class="btn gold" data-act="pfeed" ${S.cash<D.FOOD_PR?'disabled':''}>🍖 Nourrir · ${eur(D.FOOD_PR)}</button><button class="btn" data-act="ppet">🤚 Caresser</button></div>
    ${P.id==='pig'?`<button class="btn" data-act="pbreak" ${(S.pet.bank||0)<1?'disabled':''}>🔨 Casser la tirelire</button>`:''}
    <div class="msg" id="petMsg"></div></div>
  <button class="btn sm" data-act="pfree" style="justify-self:start">Le confier à mamie</button>`}
ACT.padopt=async el=>{const p=D.PETS.find(x=>x.id===el.dataset.v);try{await api('petAdopt',{id:p.id})}catch(e){return}burst(20);snd('big');toast(p.nm+' rejoint ta vie de luxe !');needRender()};
ACT.pfeed=async()=>{try{await api('petFeed')}catch(e){return}snd('pop');toast('Miam ! Bonus actif pour 24 h.');needRender()};
ACT.ppet=()=>{const P=D.PETS.find(x=>x.id===S.pet.id);const b=$('#petBig');if(b){b.classList.remove('wig');void b.offsetWidth;b.classList.add('wig')}const m=$('#petMsg');if(m)m.textContent=pick(PET_TALK[P.id]);
  for(let i=0;i<6;i++){const h=document.createElement('span');h.className='heart';h.textContent='❤️';h.style.left=rnd(20,80)+'%';h.style.animationDelay=(i*.08)+'s';$('.petroom')?.appendChild(h);setTimeout(()=>h.remove(),1500)}snd('pop')};
ACT.pbreak=async()=>{let r;try{r=await api('petBreak')}catch(e){return}burst(24);snd('big');toast('Crac ! La tirelire te rend '+eur(r.v));needRender()};
ACT.pfree=()=>modal(`<p class="mt">Confier ${D.PETS.find(x=>x.id===S.pet.id).nm} à mamie ?</p><p class="note">Il sera heureux chez elle. Tu perds son bonus${S.pet.id==='pig'?' et la tirelire part avec lui':''}, mais tu pourras adopter un autre animal.</p><div class="row2"><button class="btn" data-close>Le garder</button><button class="btn red" data-act="pfreego">Confier à mamie</button></div>`);
ACT.pfreego=async()=>{try{await api('petFree')}catch(e){return}closeModal();needRender()};

/* ====================== Caisses mystère ====================== */
const lootIc=l=>l[0]==='cash'?'💵':itemInfo(l[1]).ic,lootNm=l=>l[0]==='cash'?eur(l[1]):itemInfo(l[1]).nm,lootVal=l=>l[0]==='cash'?l[1]:itemInfo(l[1]).pr;
function pickLootC(c){const tw=c.loot.reduce((a,l)=>a+l[3],0);let r=Math.random()*tw;for(const l of c.loot){if((r-=l[3])<0)return l}return c.loot[0]}
let CRT={busy:false,sel:0};
BUSY.push(()=>CRT.busy);
function rCrates(v){const c=D.CRATES[CRT.sel],free=(S.freeCr||{})[c.id]||0;
  v.innerHTML=`<div class="seg">${D.CRATES.map((x,i)=>`<button data-act="crsel" data-v="${i}" class="${CRT.sel===i?'on':''}" ${CRT.busy?'disabled':''}>${x.nm}${(S.freeCr||{})[x.id]?' 🎁':''}</button>`).join('')}</div>
  <div class="crate" style="--cc:${c.col}"><span class="cic" aria-hidden="true">📦</span><b>${c.nm}</b><span class="num">${eur(c.pr)}</span></div>
  <div class="spinner"><div class="strip" id="crStrip"></div><span class="marker"></span></div><div class="msg" id="crMsg"></div>
  <button class="btn gold big" data-act="cropen" ${CRT.busy||(!free&&S.cash<c.pr)?'disabled':''}>${free?'Ouvrir gratuitement ('+free+' offerte'+(free>1?'s':'')+')':'Ouvrir · '+eur(c.pr)}</button>
  <h3>Contenu possible</h3><div class="lootlist">${c.loot.map(l=>`<div style="--rc:${D.RAR[l[2]][1]}"><span class="ic">${lootIc(l)}</span><span><b>${lootNm(l)}</b><br><small style="color:${D.RAR[l[2]][1]}">${D.RAR[l[2]][0]}</small></span></div>`).join('')}</div>
  <p class="note">Objet déjà possédé : il est revendu automatiquement à 70 %. Tu as ouvert ${S.crates} caisse${S.crates>1?'s':''}.</p>`;
  crFill(c,null)}
function tileHTML(l){return`<div class="tile2" style="--rc:${D.RAR[l[2]][1]}"><span>${lootIc(l)}</span><small>${l[0]==='cash'?short(l[1])+' €':''}</small></div>`}
function crFill(c,win){const s=$('#crStrip');if(!s)return;const tiles=Array.from({length:46},()=>pickLootC(c));if(win)tiles[40]=win;s.innerHTML=tiles.map(tileHTML).join('');s.style.transform='translateX(0)'}
ACT.crsel=el=>{if(CRT.busy)return;CRT.sel=+el.dataset.v;render()};
ACT.cropen=async()=>{if(CRT.busy)return;const c=D.CRATES[CRT.sel];CRT.busy=true;holdCash=1;let r;
  try{r=await api('crateOpen',{c:c.id})}catch(e){CRT.busy=false;release();return}
  $$('[data-act="cropen"],[data-act="crsel"]').forEach(b=>b.disabled=true);const win=r.loot;crFill(c,win);const s=$('#crStrip');
  if(s){const box=s.parentElement,TW=90,target=40*TW+TW/2-box.clientWidth/2+rnd(-30,30),t0=performance.now(),dur=RM?300:5200;let last=-1;snd('chip');
    await new Promise(res=>{const f=t=>{const p=Math.min(1,(t-t0)/dur),x=target*(1-Math.pow(1-p,4));s.style.transform=`translateX(${-x}px)`;const i=Math.floor((x+box.clientWidth/2)/TW);if(i!==last){last=i;snd('tick')}if(p<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)})}
  const rc=D.RAR[win[2]],txt=win[0]==='cash'?`${rc[0]} : ${eur(win[1])} !`:r.dup?`${rc[0]} : ${itemInfo(win[1]).nm} (doublon revendu ${eur(r.val)})`:`${rc[0]} : ${itemInfo(win[1]).ic} ${itemInfo(win[1]).nm} !`;
  const m=$('#crMsg');if(m){m.innerHTML=`<span style="color:${rc[1]}">${txt}</span>`;m.className='msg'}
  if(win[2]==='l'){burst(60);snd('big')}else if(win[2]==='e'){burst(24);snd('big')}else snd(lootVal(win)>=c.pr?'win':'lose');
  CRT.busy=false;release();setTimeout(()=>{if(tab==='shop'&&sub.shop==='caisses'&&!CRT.busy){$$('[data-act="crsel"]').forEach(b=>b.disabled=false);const ob=$('[data-act="cropen"]');if(ob){const n=(S.freeCr||{})[c.id]||0;ob.disabled=!n&&S.cash<c.pr;ob.textContent=n?'Ouvrir gratuitement ('+n+' offerte'+(n>1?'s':'')+')':'Ouvrir · '+eur(c.pr)}}},200)};

/* ====================== Événements perso ====================== */
on('event',ev=>whenFree(()=>EVT[ev.type]&&EVT[ev.type](ev)));
const EVT={
  rain:()=>chipRain(),
  ex:()=>{snd('notif');modal(`<p class="mt">💔 Message de ton ex</p><div class="bub" style="text-align:left;max-width:100%">« Coucou… ça fait longtemps 🥺 J'ai vu que tu t'en sortais bien. On se fait un resto ? C'est toi qui invites bien sûr. »</div>
    <div class="row2"><button class="btn" data-act="evans" data-t="ex" data-v="0">Vu, pas répondu</button><button class="btn gold" data-act="evans" data-t="ex" data-v="1">Payer le resto</button></div>`)},
  influ:ev=>{snd('notif');modal(`<p class="mt">🤳 Un influenceur te repère</p><p>« Wsh t'es le mec de la ${esc(ev.car)} ? Un selfie pour mes 2 millions d'abonnés ? »</p>
    <div class="row2"><button class="btn" data-act="evans" data-t="influ" data-v="0">Non merci</button><button class="btn gold" data-act="evans" data-t="influ" data-v="1">Selfie ! 📸</button></div>`)},
  police:ev=>{snd('ring');modal(`<p class="mt bad">🚓 Contrôle de police</p><p>On t'arrête au volant de ta ${esc(ev.car)}. « Papiers du véhicule, s'il vous plaît. »</p>
    <div class="list"><button class="btn" data-act="evans" data-t="police" data-v="0">Donner les papiers calmement</button><button class="btn" data-act="evans" data-t="police" data-v="1">« Vous savez pas qui je suis ? »</button><button class="btn red" data-act="evans" data-t="police" data-v="2">Démarrer en trombe 🏎️</button></div>`)},
  chal:ev=>{snd('notif');modal(`<p class="mt">🤝 Le Croupier te lance un défi</p><p>« Je te parie <b>${eur(ev.amt)}</b> que tu fais pas <b>${esc(ev.txt)}</b> dans les 10 minutes. »</p><p class="note">Réussi : il te paie ${eur(ev.amt)}. Raté : tu lui dois ${eur(ev.amt)}.</p>
    <div class="row2"><button class="btn" data-act="chans" data-v="0">Petit joueur, je refuse</button><button class="btn gold" data-act="chans" data-v="1">J'accepte</button></div>`)}};
const EVTITLE={ex:'🍝 Le resto',influ:'📈 Les réseaux',police:'🚓 Contrôle'};
ACT.evans=async el=>{const t=el.dataset.t;let r;try{r=await api('evAnswer',{type:t,c:+el.dataset.v})}catch(e){closeModal();return}
  modal(`<p class="mt">${EVTITLE[t]}</p><p>${esc(r.txt)}</p>${r.amt?`<div class="msg ${r.amt>0?'win':'lose'}">${r.amt>0?'+':''}${eur(r.amt)}</div>`:''}<button class="btn gold" data-act="mclose">OK</button>`);if(r.amt>0)burst(16)};
ACT.chans=async el=>{const yes=el.dataset.v==='1';let r;try{r=await api('chalAnswer',{yes})}catch(e){closeModal();return}closeModal();
  if(yes&&r.c){toast('Défi accepté : '+r.c.txt+' en 10 min !');go('casino',r.c.game)}};
function chipRain(){if($('.rain'))return;const o=document.createElement('div');o.className='rain';o.innerHTML='<div class="rainhud">💸 PLUIE DE BILLETS ! Attrape-les : <b class="num" id="rainT">0</b> billet(s)</div>';document.body.appendChild(o);snd('level');
  let n=0,big=0;
  const iv=setInterval(()=>{const b=document.createElement('button');b.className='drop';b.textContent=pick(['💵','💶','🪙','💵','💰']);b.style.left=rnd(4,88)+'%';b.style.animationDuration=rnd(2,3.2)+'s';b.setAttribute('aria-label','Attraper');
    b.onclick=()=>{n++;if(b.textContent==='💰')big++;$('#rainT').textContent=n;snd('coin');b.remove()};b.onanimationend=()=>b.remove();o.appendChild(b)},RM?600:220);
  setTimeout(()=>{clearInterval(iv);setTimeout(async()=>{o.remove();try{const r=await api('rainEnd',{n,big});if(r.amt){toast('Pluie de billets : +'+eur(r.amt));burst(16)}}catch(e){}},1200)},10000)}
