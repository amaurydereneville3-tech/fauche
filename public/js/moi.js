/* ====================== Moi ====================== */
VIEWS.moi=v=>{const L=D.levelOf(S.xp);
  v.innerHTML=`<div class="phead">${avHTML(64)}<div style="min-width:0"><h2>${esc(me())}</h2><div class="note">Niveau ${L.l} · ${title()}</div><div class="progress" style="margin-top:6px;width:160px"><i style="width:${L.cur/L.need*100}%"></i></div></div></div>
  <div style="margin-top:14px">${segHTML('moi',[['profil','Profil'],['missions','Missions'],['succes','Succès'],['appart','Mon appart'],['pass','⭐ Pass'],['ville','🏙️ Ma ville'],['pet','🐾 Animal']])}</div><div class="section" style="margin-top:12px" id="mvv"></div>`;
  ({profil:rProfil,missions:rMissions,succes:rSucces,appart:rAppart,pass:rPass,ville:rVille,pet:rPet})[sub.moi]($('#mvv'))};
function rProfil(v){const t=S.tier,T=D.TIERS[t],w=S.worth,base=Math.max(0,T.min),pct=T.next?Math.max(0,Math.min(100,(w-base)/(T.next-base)*100)):100;const tags=[];
  if(S.suspectUntil>now())tags.push('<span class="tag bad">Suspect</span>');if(S.boosts.requin)tags.push(`<span class="tag">🦈 ×${S.boosts.requin}</span>`);if(S.boosts.parrain)tags.push(`<span class="tag">🎩 ×${S.boosts.parrain}</span>`);if(S.boosts.flambeur)tags.push(`<span class="tag">🔥 ×${S.boosts.flambeur}</span>`);
  if(S.cafeUntil>now())tags.push('<span class="tag">☕ actif</span>');if(S.xpBoostUntil>now())tags.push('<span class="tag">⚡ XP ×2</span>');
  v.innerHTML=`${tags.length?`<div class="tags">${tags.join('')}</div>`:''}${cardHTML()}
    ${T.next?`<div><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:6px"><span>Vers la carte ${D.TIERS[t+1].name}</span><b class="num" style="color:var(--fg)">${eur(T.next)}</b></div><div class="progress"><i style="width:${pct}%"></i></div></div>`:''}
    <div class="stats"><div class="stat"><div class="l">Patrimoine</div><div class="v">${eur(w)}</div></div><div class="stat"><div class="l">Cash</div><div class="v">${eur(S.cash)}</div></div><div class="stat"><div class="l">Revenus / h</div><div class="v">${eur(S.income)}</div></div>
      <div class="stat"><div class="l">Victoires</div><div class="v">${S.wins}</div></div><div class="stat"><div class="l">Défaites</div><div class="v">${S.losses}</div></div><div class="stat"><div class="l">Gros gain</div><div class="v">${eur(S.best)}</div></div></div>
    <h3>La banque</h3><div class="box"><div class="stats"><div class="stat"><div class="l">Dette</div><div class="v" style="color:${S.debt?'var(--lose)':'inherit'}">${eur(S.debt)}</div></div><div class="stat"><div class="l">Prêt possible</div><div class="v" id="bankMax">…</div></div><div class="stat"><div class="l">Note</div><div class="v">${S.debt===0?'A+':S.debt<w?'B':'D'}</div></div></div>
      <div class="row4" id="loanBtns">${[1000,5000,20000,100000].map(a=>`<button class="btn sm" data-act="loan" data-v="${a}">+${short(a)}</button>`).join('')}</div>
      <button class="btn gold" data-act="repay" ${!S.debt||!S.cash?'disabled':''}>Rembourser ${eur(Math.min(S.debt,S.cash))}</button><p class="note">10 % d'intérêts par prêt. Attention : avec des dettes, l'huissier peut passer.</p></div>
    <h3>Petits boulots</h3><p class="note" style="margin-top:-4px">Pour te refaire quand tu es à sec. Tape le plus vite possible.</p>
    <div class="grid">${D.JOBS.map(j=>`<button class="item" data-act="job" data-v="${j.id}" style="text-align:left"><div class="ic" aria-hidden="true">${j.ic}</div><div class="nm">${j.nm}</div><div class="pr">${j.pay} € le clic${S.cafeUntil>now()?' ×3':''}</div></button>`).join('')}</div>
    <h3>Réglages</h3><div class="row2"><button class="btn" data-act="sound">${SOUND()?'🔊 Son : oui':'🔇 Son : non'}</button><button class="btn" data-act="logout">Se déconnecter</button></div>
    <button class="btn red sm" data-act="reset" style="justify-self:start">Recommencer à zéro</button>`;
  api('bankInfo').then(r=>{const e=$('#bankMax');if(e)e.textContent=eur(r.max);$$('#loanBtns button').forEach(b=>b.disabled=+b.dataset.v>r.max)}).catch(()=>{})}
ACT.sound=()=>{store.set('fauche-son',SOUND()?'0':'1');if(SOUND())snd('win');render()};
ACT.logout=()=>{store.del('fauche-token');location.reload()};
ACT.loan=async el=>{try{await api('loan',{amt:+el.dataset.v});toast('Prêt accordé : '+eur(+el.dataset.v)+'. Tu dois '+eur(+el.dataset.v*1.1)+'.');needRender()}catch(e){}};
ACT.repay=async()=>{try{await api('repay');toast('Remboursement effectué.');needRender()}catch(e){}};
ACT.reset=()=>modal(`<p class="mt">Tout recommencer ?</p><p class="note">Tu repars avec 1 000 €. Ton niveau, tes succès et tes objets sont effacés. Ton pseudo reste le même.</p><div class="row2"><button class="btn" data-close>Annuler</button><button class="btn red" data-act="doreset">Oui, reset</button></div>`);
ACT.doreset=async()=>{try{await api('reset');closeModal();toast('Nouveau départ !');needRender()}catch(e){}};
let JOB=null;
ACT.job=async el=>{const j=D.JOBS.find(x=>x.id===el.dataset.v);let r;try{r=await api('jobStart',{id:j.id})}catch(e){return}let n=0,left=r.dur,on=false;JOB=true;
  modal(`<p class="mt">${j.ic} ${j.nm}</p><p class="note">Tape ${j.ic} le plus de fois possible en ${r.dur} secondes.${r.mult>1?' Café Triple : ×3 !':''} Le chrono démarre au premier clic.</p>
  <div style="display:flex;justify-content:space-between;font-weight:700"><span>Clics <span class="num" id="jn">0</span></span><span>Gagné <span class="num" id="jg" style="color:var(--gold)">0 €</span></span><span><span class="num" id="jt">${r.dur}</span> s</span></div>
  <div class="jobzone" id="jz"><button id="jb" aria-label="Taper">${j.ic}</button></div><div id="jend"></div>`);
  const z=$('#jz'),b=$('#jb');const move=()=>{b.style.left=rnd(4,z.clientWidth-68)+'px';b.style.top=rnd(4,z.clientHeight-68)+'px'};move();
  b.onclick=()=>{if(left<=0)return;if(!on){on=true;const iv=setInterval(()=>{left--;const e=$('#jt');if(e)e.textContent=left;if(left<=0){clearInterval(iv);finish()}},1000)}n++;snd('tick');$('#jn').textContent=n;$('#jg').textContent=eur(n*j.pay*r.mult);move()};
  async function finish(){b.disabled=true;JOB=null;try{const x=await api('jobEnd',{taps:n});$('#jend').innerHTML=`<div class="msg win">Paie : +${eur(x.pay)}</div><button class="btn gold big" data-act="mclose">Encaisser</button>`}catch(e){$('#jend').innerHTML='<button class="btn" data-act="mclose">Fermer</button>'}}};
BUSY.push(()=>!!JOB);
async function rMissions(v){v.innerHTML='<div class="empty">Chargement…</div>';let L;try{L=(await api('missions')).list}catch(e){return}if(sub.moi!=='missions'||!$('#mvv'))return;
  v.innerHTML=`<p class="note">Trois nouvelles missions chaque jour à minuit.</p>`+L.map(m=>{const M=D.MISSIONS.find(x=>x.id===m.id),done=m.p>=M.n;
    return`<div class="mission ${done?'done':''}"><span><b>${M.t}</b><br><span class="note">Récompense : ${eur(M.rw)} + 50 XP</span></span>${m.c?'<span class="tag">✓ Fait</span>':done?`<button class="btn gold sm" data-act="mclaim" data-v="${m.id}">Récupérer</button>`:`<span class="num note">${M.type==='mult'?x2(m.p):fr.format(Math.min(m.p,M.n))} / ${M.type==='mult'?x2(M.n):fr.format(M.n)}</span>`}<div class="progress"><i style="width:${Math.min(100,m.p/M.n*100)}%"></i></div></div>`}).join('')}
ACT.mclaim=async el=>{try{await api('mclaim',{id:el.dataset.v});burst(20);snd('big');render()}catch(e){}};
function rSucces(v){v.innerHTML=`<p class="note">${S.ach.length} succès sur ${D.ACH.length}. Les rouges sont les succès honteux : les autres joueurs les voient sur ton profil.</p>`+D.ACH.map(a=>{const ok=S.ach.includes(a.id);return`<div class="ach ${ok?'':'off'} ${a.sh?'shame':''}"><span class="ic" aria-hidden="true">${ok?a.ic:'🔒'}</span><b class="nm">${a.nm}</b><span class="note">${a.d}</span></div>`}).join('')}
function rAppart(v){const own=S.items.map(itemInfo).filter(Boolean);const slots=[[8,70],[30,74],[52,70],[74,74],[14,46],[80,44],[40,84],[62,86],[20,84],[86,84],[4,30],[90,24],[46,50],[66,46],[28,52],[56,30],[10,62],[78,62],[36,64]];
  v.innerHTML=`<div class="room" style="--wall:${D.WALLS[S.room.wall]}"><div class="win"></div>${own.slice(0,slots.length).map((it,i)=>`<span class="it" style="left:${slots[i][0]}%;top:${slots[i][1]}%" title="${it.nm}">${it.ic}</span>`).join('')}<span class="it" style="left:46%;top:60%;font-size:44px">${S.av.face}</span></div>
  ${own.length?`<p class="note">${own.length} objet${own.length>1?'s':''} exposé${own.length>1?'s':''}. Les autres joueurs voient ton appart sur ton profil.</p>`:'<div class="empty">Ton appart est vide. Achète des objets en boutique pour le remplir.</div>'}
  <h3>Couleur des murs</h3><div class="picker">${D.WALLS.map((c,i)=>`<button class="swatch ${S.room.wall===i?'on':''}" data-act="st" data-k="wall" data-v="${i}" style="background:${c}" aria-label="Mur ${i+1}"></button>`).join('')}</div>`}

/* ====================== Cadeaux du jour ====================== */
const WSEG=[['100 €','#2d6cdf'],['1 000 €','#c3343a'],['Rien','#3a3340'],['500 €','#1f8a5b'],['XP ×2','#7b3fc4'],['2 500 €','#e08a1e'],['Boost 🦈','#0e7c86'],['10 000 €','#b8902e']];
ACT.gift=()=>{const d=parisDate(),c=S.daily.chest!==d,w=S.daily.wheel!==d;
  modal(`<p class="mt">Cadeaux du jour</p><div class="gifts"><div class="giftcard"><span class="ic chest" id="chest">🎁</span><b>Coffre quotidien</b><button class="btn gold sm" data-act="chest" ${c?'':'disabled'}>${c?'Ouvrir':'Demain'}</button></div><div class="giftcard"><span class="ic">🎡</span><b>Roue de la fortune</b><span class="note">1 tour gratuit par jour</span></div></div>
  <div class="fwheel"><div class="pin"></div><div class="disc" id="fw" style="background:conic-gradient(${WSEG.map((s,i)=>`${s[1]} ${i*45}deg ${(i+1)*45}deg`).join(',')})">${WSEG.map((s,i)=>`<span style="transform:rotate(${i*45+22.5-90}deg) translate(34px,-6px)">${s[0]}</span>`).join('')}</div><div class="hub"></div></div>
  <div class="msg" id="fwMsg"></div><button class="btn gold big" data-act="fwheel" ${w?'':'disabled'}>${w?'Faire tourner la roue':'Reviens demain'}</button><button class="btn" data-close>Fermer</button>`)};
ACT.chest=async el=>{try{const r=await api('chest');$('#chest').classList.add('open');snd('big');el.disabled=true;el.textContent='+'+eur(r.amt);burst(20)}catch(e){}};
ACT.fwheel=async el=>{let r;try{r=await api('wheel')}catch(e){return}el.disabled=true;const i=r.i,rot=360*(RM?1:6)+(360-(i*45+22.5));$('#fw').style.transform=`rotate(${rot}deg)`;
  let k=0;const iv=setInterval(()=>{snd('tick');if(++k>20)clearInterval(iv)},180);
  setTimeout(()=>{const s=WSEG[i][0];const txt=s==='Rien'?'Rien du tout. Demain peut-être.':s==='XP ×2'?'XP doublée pendant 15 minutes !':s==='Boost 🦈'?'3 Élixirs du Requin offerts !':'Tu gagnes '+s+' !';
    const m=$('#fwMsg');if(m){m.textContent=txt;m.className='msg '+(s==='Rien'?'lose':'win')}snd(s==='Rien'?'lose':'win');if(s!=='Rien')burst(20)},RM?200:4300)};

/* ====================== Carte de fail ====================== */
function failCard(F){const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a0d12');bg.addColorStop(1,'#17121a');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.globalAlpha=.08;g.font='bold 220px sans-serif';g.fillStyle='#ff7a6b';for(let i=0;i<6;i++)g.fillText('💸',(i%3)*380-40,240+i*210);g.globalAlpha=1;
  g.textAlign='center';g.fillStyle='#e3b558';g.font='800 64px "Unbounded",sans-serif';g.fillText('FAUCHÉ',W/2,150);g.font='180px sans-serif';g.fillText(S.av.face,W/2,420);
  g.fillStyle='#f4ede3';g.font='700 56px "DM Sans",sans-serif';g.fillText(me()+' vient de perdre',W/2,560);g.fillStyle='#ff7a6b';g.font='800 '+(F.amt>=1e6?120:140)+'px "JetBrains Mono",monospace';g.fillText(eur(F.amt).replace(' €','€'),W/2,730);
  g.fillStyle='#f4ede3';g.font='700 56px "DM Sans",sans-serif';g.fillText((D.GN[F.game]||'au casino')+(F.mult?' (à '+x2(F.mult)+')':''),W/2,830);g.fillStyle='#a998ab';g.font='500 44px "DM Sans",sans-serif';g.fillText('Niveau '+LV()+' · '+title(),W/2,950);
  g.fillStyle='#e3b558';g.fillRect(W/2-260,1080,520,110);g.fillStyle='#2a1d05';g.font='800 46px "Unbounded",sans-serif';g.fillText('Fais mieux que moi',W/2,1152);
  const url=c.toDataURL('image/png');
  modal(`<p class="mt">Ta carte de fail</p><img class="failimg" src="${url}" alt="Carte de fail : ${esc(me())} a perdu ${eur(F.amt)}"><p class="note">Appuie longuement sur l'image pour l'enregistrer, puis poste-la en story.</p><a class="btn gold" href="${url}" download="fauche-fail.png">Télécharger l'image</a><button class="btn" data-close>Fermer</button>`)}

/* ====================== Événements ====================== */
on('event',ev=>whenFree(()=>({daron:daronCall,huissier:()=>huissier(ev),fisc:()=>fisc(ev)}[ev.type]||(()=>{}))()));
function daronCall(){snd('ring');vib([300,200,300,200,300]);
  modal(`<div style="display:grid;gap:6px"><span class="note" style="color:#c8d6e2">Appel entrant…</span><span class="who">Papa</span><span class="note" style="color:#c8d6e2">mobile</span></div><div class="ring">👨</div><div class="acts"><button data-act="daron" data-v="0" style="background:#ff3b30" aria-label="Raccrocher">📵</button><button data-act="daron" data-v="1" style="background:#34c759" aria-label="Décrocher">📞</button></div>`,'call')}
ACT.daron=async el=>{const up=el.dataset.v==='1';let r;try{r=await api('daron',{up})}catch(e){closeModal();return}
  modal(`<p class="mt">${up?'📞 Appel avec Papa':'📵 Tu as raccroché'}</p><p>${r.txt}</p>${r.amt?`<div class="msg ${r.amt>0?'win':'lose'}">${r.amt>0?'+':''}${eur(r.amt)}</div>`:''}<button class="btn gold" data-act="mclose">OK</button>`)};
function huissier(ev){snd('ring');if(ev.none){modal(`<p class="mt bad">⚖️ L'HUISSIER</p><p>Rien à saisir chez toi… Il prend 10 % de ton cash pour le dérangement.</p><div class="msg lose">−${eur(ev.fine)}</div><button class="btn gold" data-act="mclose">Grr</button>`);return}
  const its=ev.its;let left=RM?20:8;const hidden=new Set();
  modal(`<p class="mt bad">⚖️ L'HUISSIER EST À LA PORTE</p><p class="note">Vite ! Touche tes biens pour les cacher avant qu'il entre. Il saisira un objet resté visible.</p><b class="num" id="huT" style="font-size:24px">${left} s</b>
  <div class="grid" id="huG">${its.map((id,i)=>`<button class="item" data-hu="${i}" style="text-align:center"><div class="ic">${itemInfo(id).ic}</div><div class="nm">${itemInfo(id).nm}</div></button>`).join('')}</div><div id="huEnd"></div>`);
  $('#huG').onclick=e=>{const b=e.target.closest('[data-hu]');if(!b||left<=0)return;hidden.add(+b.dataset.hu);b.style.opacity=.25;b.disabled=true;snd('pop')};
  const iv=setInterval(async()=>{left--;const t=$('#huT');if(t)t.textContent=left+' s';if(left>0)return;clearInterval(iv);const e=$('#huEnd');let r;try{r=await api('huDone',{hidden:[...hidden]})}catch(er){closeModal();return}
    if(r.saved){e.innerHTML=`<div class="msg win">Tout est caché. L'huissier repart bredouille.</div><button class="btn gold" data-act="mclose">Bien joué</button>`;snd('win')}
    else{const it=itemInfo(r.id);e.innerHTML=`<div class="msg lose">Saisi : ${it.ic} ${it.nm}${r.off?` (−${eur(r.off)} sur ta dette)`:''}</div><button class="btn gold" data-act="mclose">Snif</button>`;snd('lose');shake()}},1000)}
function fisc(ev){let i=0;snd('ring');const show=()=>{const q=ev.qs[i];modal(`<p class="mt bad">🕵️ CONTRÔLE FISCAL</p><p class="note">Question ${i+1}/3 · chaque erreur coûte 3 % de ton cash.</p><b>${q.q}</b><div class="list">${q.a.map((t,k)=>`<button class="btn" data-act="fiscA" data-v="${k}">${t}</button>`).join('')}</div>`)};
  ACT.fiscA=async el=>{let r;try{r=await api('fiscA',{a:+el.dataset.v})}catch(e){closeModal();return}if(r.good)snd('win');else{toast('Mauvaise réponse : amende de '+eur(r.fine));snd('lose')}
    i++;if(!r.done)return show();modal(`<p class="mt">Contrôle terminé</p><p>${r.ok}/3 bonnes réponses.</p>${r.bonus?`<div class="msg win">Dossier parfait : remboursement d'impôts de ${eur(r.bonus)} !</div>`:'<p class="note">L\'inspecteur repart en notant ton nom.</p>'}<button class="btn gold" data-act="mclose">OK</button>`)};show()}
on('broke',()=>whenFree(()=>{modal(`<p class="mt bad">FAILLITE</p><p class="note">Plus un rond. Tourne la roue de la honte pour toucher 500 € d'aide d'urgence, ou va bosser.</p><div class="shame" id="sh">?</div><button class="btn gold big" data-act="wheelshame">Tourner la roue de la honte</button><button class="btn" data-act="gojob">Aller faire un petit boulot</button>`)}));
const SHAME=()=>['Avatar en clown pendant 24 h','Ton pseudo devient « Pauvre_'+me()+' »','Tes potes choisissent ta photo de profil','Badge « A vendu sa trottinette »','Tu dois liker 10 messages dans le chat','Annonce à tout le casino : « Je suis fauché »'];
ACT.wheelshame=el=>{el.disabled=true;const sh=$('#sh');let k=0;const iv=setInterval(()=>{sh.textContent=pick(SHAME());snd('tick');if(++k>16){clearInterval(iv);el.disabled=false;el.textContent='Accepter la honte · +500 €';el.dataset.act='shameok'}},RM?10:110)};
ACT.shameok=async()=>{try{await api('shame');closeModal();toast('Aide d\'urgence : +500 €. Ne recommence pas.');needRender()}catch(e){closeModal()}};
ACT.gojob=()=>{closeModal();go('moi','profil');setTimeout(()=>document.querySelector('[data-act="job"]')?.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),50)};
