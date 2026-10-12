/* ====================== V6 : Moi, avatar, compte, profils, admin ====================== */
VIEWS.moi=v=>{const L=D.levelOf(S.xp);
  const subs=[['profil','Profil'],['avatar','Avatar'],['missions','Missions'],['pass','Pass'],['succes','Succès'],['compte','Compte']];if(S.admin)subs.push(['admin','👑 Admin']);
  if(!subs.some(x=>x[0]===sub.moi)&&!['appart','ville','pet'].includes(sub.moi))sub.moi='profil';
  v.innerHTML=`<div class="phead"><button class="avbtn" data-act="sub" data-k="moi" data-v="avatar" aria-label="Modifier mon avatar">${avHTML(72)}<span class="pen" aria-hidden="true">${ICON.pen}</span></button><div style="min-width:0"><h2>${esc(me())}${S.admin?' <span class="crown">👑 Créateur</span>':''}</h2><div class="note">Niveau ${L.l} · ${esc(title())}</div>${S.bio?`<div class="bio">« ${esc(S.bio)} »</div>`:''}<div class="progress" style="margin-top:6px;width:160px"><i style="width:${L.cur/L.need*100}%"></i></div></div></div>
  <div style="margin-top:14px">${segHTML('moi',subs)}</div><div class="section" style="margin-top:12px" id="mvv"></div>`;
  ({profil:rProfil,avatar:rAvatar,missions:rMissions,succes:rSucces,appart:rAppart,pass:rPass,ville:rVille,pet:rPet,compte:rCompte,admin:rAdmin})[sub.moi]($('#mvv'))};

/* ---------- Éditeur d'avatar ---------- */
let AVD=null,AVT='visage';
const AVTABS=[['visage','Visage',['shape'],'skin'],['cheveux','Cheveux',['hair'],'hairC'],['yeux','Yeux',['eyes','brows']],['bouche','Bouche',['mouth','beard'],'hairC'],['chapeau','Chapeau',['hat'],'topC'],['lunettes','Lunettes',['glasses']],['tenue','Tenue',['top','bling'],'topC'],['fond','Fond',[],'bg']];
function avCtx(){return{lvl:LV(),tier:S.tier,items:S.items,ach:S.ach}}
function rAvatar(v){if(!AVD)AVD=Object.assign({},S.av.v2||D.avRandom(S.id));const T=AVTABS.find(t=>t[0]===AVT)||AVTABS[0],ctx=avCtx();
  const changed=JSON.stringify(AVD)!==JSON.stringify(S.av.v2);
  v.innerHTML=`<div class="avedit"><div class="avprev">${avHTML(150,{v2:AVD})}</div>
    <div class="avtabs" role="tablist">${AVTABS.map(t=>`<button role="tab" aria-selected="${t[0]===T[0]}" class="${t[0]===T[0]?'on':''}" data-act="avtab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
    ${T[3]?`<div class="avcols">${D.AVC[T[3]].map((c,i)=>`<button class="swatch ${AVD[T[3]]===i?'on':''}" style="background:${c}" data-act="avset" data-k="${T[3]}" data-v="${i}" aria-label="Couleur ${i+1}"></button>`).join('')}</div>`:''}
    ${T[2].map(part=>`<h3>${D.AVPN[part]}</h3><div class="avopts">${D.AVP[part].map(([id,nm])=>{const lock=D.avLock(part,id,ctx)&&S.av.v2[part]!==id?D.avLock(part,id,ctx):'';const tr=Object.assign({},AVD,{[part]:id});
      return`<button class="avopt ${AVD[part]===id?'on':''}" data-act="avset" data-k="${part}" data-v="${id}" ${lock?'disabled':''}><span class="mini">${avSVG(tr)}</span><span class="lb">${nm}</span>${lock?`<span class="lk">🔒 ${lock}</span>`:''}</button>`}).join('')}</div>`).join('')}
    <div class="avbar"><button class="btn" data-act="avrand">🎲 Au hasard</button><button class="btn" data-act="avundo" ${changed?'':'disabled'}>Annuler</button><button class="btn gold" data-act="avsave" ${changed?'':'disabled'}>Enregistrer</button></div>
    <p class="note">Certains éléments se débloquent avec ton niveau, ta carte bancaire, un succès ou un objet rare des caisses.</p></div>`}
ACT.avtab=el=>{AVT=el.dataset.v;rAvatar($('#mvv'))};
ACT.avset=el=>{const k=el.dataset.k;let val=el.dataset.v;if(['skin','hairC','topC','bg'].includes(k))val=+val;AVD[k]=val;snd('tick');const y=scrollY;rAvatar($('#mvv'));scrollTo(0,y)};
ACT.avrand=()=>{const ctx=avCtx(),r=D.avRandom(Date.now());Object.keys(D.AVP).forEach(k=>{if(D.avLock(k,r[k],ctx))r[k]=AVD[k]});AVD=r;snd('pop');rAvatar($('#mvv'))};
ACT.avundo=()=>{AVD=Object.assign({},S.av.v2);rAvatar($('#mvv'))};
ACT.avsave=async()=>{try{await api('avatar',{av:AVD});toast('Avatar enregistré. Tout le casino voit ta nouvelle tête.');snd('win');burst(12);AVD=null;needRender()}catch(e){}};

/* Boutique › Style : l'avatar passe dans son propre éditeur */
const _rStyle=rStyle;
rStyle=function(v){_rStyle(v);const hs=[...v.querySelectorAll('h3')];const h1=hs.find(h=>h.textContent==='Visage'),h2=hs.find(h=>h.textContent==='Ta carte bancaire');
  if(h1&&h2){let n=h1;const rm=[];while(n&&n!==h2){rm.push(n);n=n.nextElementSibling}rm.forEach(x=>x.remove());}
  const c=v.querySelector('.center');if(c)c.outerHTML=`<div class="center" style="display:grid;gap:10px;justify-items:center">${avHTML(110)}<button class="btn gold" data-act="goav">Modifier mon avatar</button></div>`};
ACT.goav=()=>go('moi','avatar');

/* ---------- Fiche profil des autres joueurs ---------- */
ACT.prof=async el=>{const id=+el.dataset.v;if(!id)return;let p;try{p=await api('profile',{id})}catch(e){return}const mine=p.id===S.id;
  const its=p.items.map(i=>({id:i,it:itemInfo(i)})).filter(x=>x.it),pet=p.pet&&D.PETS.find(x=>x.id===p.pet),fav=p.fav&&(GAMES.find(g=>g.id===p.fav)||{nm:D.GN[p.fav]||p.fav});
  const rare=p.ach.map(a=>D.ACH.find(x=>x.id===a)).filter(Boolean).sort((a,b)=>(b.sh?1:0)-(a.sh?1:0));
  modal(`<div class="pfhead"><div class="pfav">${avHTML(96,p.av)}${p.on?'<span class="ondot" title="En ligne"></span>':''}</div>
    <div style="min-width:0"><p class="mt" style="margin:0">${esc(p.pseudo)}${p.creator?' <span class="crown">👑 Créateur</span>':''}</p><div class="note">Niveau ${p.lvl} · ${esc(p.title)}${p.suspect?' · <span style="color:var(--lose)">Suspect</span>':''}</div>${p.oldPseudo?`<div class="note">anciennement ${esc(p.oldPseudo)}</div>`:''}</div></div>
    ${p.bio?`<p class="bio" style="text-align:center">« ${esc(p.bio)} »</p>`:''}
    ${cardHTML(p)}
    <div class="stats"><div class="stat"><div class="l">Fortune</div><div class="v">${eur(p.worth)}</div></div><div class="stat"><div class="l">Plus gros gain</div><div class="v">${eur(p.best)}</div></div><div class="stat"><div class="l">Parties</div><div class="v">${fr.format(p.played)}</div></div>
      <div class="stat"><div class="l">Victoires</div><div class="v">${fr.format(p.wins)}</div></div><div class="stat"><div class="l">Faillites</div><div class="v" style="color:${p.bankrupt?'var(--lose)':'inherit'}">${p.bankrupt}</div></div><div class="stat"><div class="l">Braquages</div><div class="v">${p.heistOk}${p.jail?` <small class="note">· ${p.jail} 🚔</small>`:''}</div></div></div>
    ${fav?`<div class="lrow2"><span>Jeu préféré</span><b>${fav.ic||''} ${esc(fav.nm)} <span class="note">· ${p.favN} parties</span></b></div>`:''}
    ${p.bounty?`<div class="lrow2" style="border-color:var(--lose)"><span>🎯 Prime sur sa tête</span><b class="num" style="color:var(--lose)">${eur(p.bounty)}</b></div>`:''}
    <h3 style="margin:6px 0 0">Vitrine${p.nItems>its.length?` <span class="note">· ${p.nItems} objets</span>`:''}</h3>${its.length?`<div class="vitrine">${its.map(x=>`<div><span class="ic">${x.it.ic}</span><small>${esc(x.it.nm)}</small></div>`).join('')}${pet?`<div><span class="ic">${pet.ic}</span><small>${pet.nm}</small></div>`:''}</div>`:'<div class="empty">Rien à montrer. Pour l\'instant.</div>'}
    ${rare.length?`<h3 style="margin:6px 0 0">Succès · ${rare.length}/${D.ACH.length}</h3><div class="tags">${rare.slice(0,10).map(a=>`<span class="tag ${a.sh?'bad':''}" title="${esc(a.d)}">${a.ic} ${a.nm}</span>`).join('')}</div>`:''}
    ${mine?'':`<div class="row2"><button class="btn gold" data-act="pduel" data-v="${p.id}" ${p.on?'':'disabled'}>🪙 Défier en duel</button><button class="btn" data-act="ploan" data-v="${p.id}" data-n="${esc(p.pseudo)}">🤝 Demander un prêt</button></div>${PROF_EXTRA.map(f=>f(p)).join('')}`}
    ${S.admin&&!mine?`<button class="btn sm" data-act="admopen" data-v="${p.id}">👑 Gérer ce joueur</button>`:''}
    <button class="btn" data-close>Fermer</button>`,'sheet')};
const PROF_EXTRA=[]; // boutons ajoutés par d'autres modules (prime, pickpocket…)

/* ---------- Compte ---------- */
function rCompte(v){const wait=S.pseudoAt+30*864e5-now(),can=wait<=0||S.admin;
  v.innerHTML=`<div class="box"><h3 style="margin:0">Pseudo</h3><p class="note" style="margin:0">${can?'Tu peux changer de pseudo une fois par mois. Tu gardes ton argent, tes objets et ton niveau.':'Prochain changement possible dans '+Math.ceil(wait/864e5)+' jour(s).'}</p>
    <form class="inrow" id="fPs"><input id="iPs" maxlength="16" value="${esc(me())}" aria-label="Nouveau pseudo" autocomplete="off" ${can?'':'disabled'}><button class="btn gold sm" ${can?'':'disabled'}>Changer</button></form></div>
  <div class="box"><h3 style="margin:0">Bio</h3><p class="note" style="margin:0">Une phrase visible sur ton profil. Exemple : « Roi du Crash, ruiné 3 fois ».</p>
    <form class="inrow" id="fBio"><input id="iBio" maxlength="90" value="${esc(S.bio||'')}" placeholder="Ta phrase" aria-label="Bio"><button class="btn gold sm">OK</button></form></div>
  <div class="box"><h3 style="margin:0">Mot de passe</h3><form id="fPw" style="display:grid;gap:8px"><label class="field"><span class="note">Mot de passe actuel</span><input id="iPw0" type="password" autocomplete="current-password"></label><label class="field"><span class="note">Nouveau mot de passe (6 caractères minimum)</span><input id="iPw1" type="password" autocomplete="new-password"></label><button class="btn gold sm" style="justify-self:start">Changer le mot de passe</button></form></div>
  <div class="box"><h3 style="margin:0">Signaler un bug</h3><p class="note" style="margin:0">Un truc bizarre ? Explique ce que tu faisais. Momo le reçoit directement.</p><form id="fBug" style="display:grid;gap:8px"><textarea id="iBug" rows="3" maxlength="600" placeholder="Ex : à la roulette, mon jeton a disparu quand…" aria-label="Description du bug"></textarea><button class="btn gold sm" style="justify-self:start">Envoyer</button></form></div>
  <h3>Réglages</h3><div class="row2"><button class="btn" data-act="sound">${SOUND()?'🔊 Son : oui':'🔇 Son : non'}</button><button class="btn" data-act="music">${MUSIC()?'🎵 Musique : oui':'🎵 Musique : non'}</button></div>
  <div class="row2"><button class="btn" data-act="tuto">📖 Revoir le tutoriel</button><button class="btn" data-act="news">✨ Quoi de neuf</button></div>
  <div class="row2"><button class="btn" data-act="about">ℹ️ À propos</button><button class="btn" data-act="logout">Se déconnecter</button></div>
  <h3>Zone dangereuse</h3><div class="row2"><button class="btn red sm" data-act="reset">Recommencer à zéro</button>${S.admin?'':'<button class="btn red sm" data-act="delme">Supprimer mon compte</button>'}</div>${CREDIT}`;
  $('#fPs').onsubmit=async e=>{e.preventDefault();try{const r=await api('setPseudo',{pseudo:$('#iPs').value.trim()});toast('Tu t\'appelles maintenant '+r.pseudo+' !');burst(14);needRender()}catch(er){}};
  $('#fBio').onsubmit=async e=>{e.preventDefault();try{await api('setBio',{bio:$('#iBio').value});toast('Bio enregistrée.');needRender()}catch(er){}};
  $('#fPw').onsubmit=async e=>{e.preventDefault();try{await api('setPass',{old:$('#iPw0').value,pass:$('#iPw1').value});toast('Mot de passe changé.');$('#iPw0').value=$('#iPw1').value=''}catch(er){}};
  $('#fBug').onsubmit=async e=>{e.preventDefault();try{await api('bug',{text:$('#iBug').value,ua:navigator.userAgent});toast('Merci ! Momo a reçu ton signalement.');$('#iBug').value=''}catch(er){}}}
ACT.delme=()=>modal(`<p class="mt bad">Supprimer ton compte ?</p><p class="note">Tout est effacé pour de bon : argent, objets, niveau, pseudo. Impossible de revenir en arrière.</p><label class="field"><span class="note">Tape ton mot de passe pour confirmer</span><input id="iDel" type="password" autocomplete="current-password"></label><div class="row2"><button class="btn" data-close>Annuler</button><button class="btn red" data-act="delgo">Supprimer</button></div>`);
ACT.delgo=async()=>{try{await api('deleteMe',{pass:$('#iDel').value});store.del('fauche-token');closeModal();toast('Compte supprimé. Salut !');setTimeout(()=>location.reload(),1200)}catch(e){}};

/* ---------- Panneau admin (compte du créateur uniquement) ---------- */
let ADMU=null,ADMS=null;
async function rAdmin(v){if(!S.admin){v.innerHTML='<div class="empty">Réservé au créateur.</div>';return}v.innerHTML='<div class="empty">Chargement…</div>';
  try{ADMS=await api('admStats')}catch(e){return}if(sub.moi!=='admin'||!$('#mvv'))return;const s=ADMS,hp=s.happyUntil>now();
  v.innerHTML=`<div class="stats"><div class="stat"><div class="l">Comptes</div><div class="v">${s.users}</div></div><div class="stat"><div class="l">En ligne</div><div class="v">${s.online.length}</div></div><div class="stat"><div class="l">Joueurs du jour</div><div class="v">${s.today}</div></div>
      <div class="stat"><div class="l">Parties du jour</div><div class="v">${fr.format(s.parties)}</div></div><div class="stat"><div class="l">Jackpot</div><div class="v">${eur(s.jackpot)}</div></div><div class="stat"><div class="l">Bugs</div><div class="v">${s.bugs}</div></div></div>
    <h3>Pour tout le casino</h3><div class="box">
      <form class="inrow" id="fMsg"><input id="iMsg" maxlength="200" placeholder="Message à tout le monde (ex : MAJ ce soir !)" aria-label="Message global"><button class="btn gold sm">Envoyer</button></form>
      <div class="inrow"><input id="iRain" inputmode="numeric" value="1000" aria-label="Montant de la pluie"><button class="btn gold sm" data-act="admrain">💸 Donner à tous les connectés</button></div>
      <div class="row2"><button class="btn" data-act="admev" data-v="happy" ${hp?'disabled':''}>${hp?'🍾 Happy hour en cours':'🍾 Happy hour ×2 (30 min)'}</button><button class="btn" data-act="admev" data-v="jackpot">🎰 Jackpot géant (10 min)</button></div>
      <div class="row2"><button class="btn" data-act="admev" data-v="rainall">🌧️ Pluie de billets pour tous</button><button class="btn" data-act="admev" data-v="drop">🎁 Drop dans le chat</button></div>
      <div class="inrow"><input id="iJk" inputmode="numeric" value="50000" aria-label="Montant ajouté au jackpot"><button class="btn sm" data-act="admev" data-v="boostjk">Gonfler le jackpot commun</button></div></div>
    <h3>Trouver un joueur</h3><form class="inrow" id="fFind"><input id="iFind" placeholder="Pseudo (ou une partie)" aria-label="Recherche de joueur" autocomplete="off"><button class="btn gold sm">Chercher</button></form><div id="admRes"></div>
    <h3>En ligne maintenant</h3>${s.online.map(o=>`<button class="prow" data-act="admopen" data-v="${o.id}"><span>${fc(o,30)} <b>${esc(o.pseudo)}</b> <span class="note">niv. ${o.lvl}</span></span><span class="num">${eur(o.cash)}</span></button>`).join('')||'<div class="empty">Personne.</div>'}
    <h3>Jeux les plus joués aujourd'hui</h3>${s.games.length?`<div class="list">${s.games.map(([g,n])=>`<div class="lrow2"><span>${esc((GAMES.find(x=>x.id===g)||{}).nm||D.GN[g]||g)}</span><b class="num">${n}</b></div>`).join('')}</div>`:'<div class="empty">Pas encore de parties.</div>'}
    <h3>Bugs signalés</h3><div id="admBugs"><button class="btn sm" data-act="admbugs">Afficher les bugs</button></div>`;
  $('#fMsg').onsubmit=async e=>{e.preventDefault();const t=$('#iMsg').value.trim();if(!t)return;try{await api('admMsg',{text:t});toast('Message envoyé à tout le casino.');$('#iMsg').value=''}catch(er){}};
  $('#fFind').onsubmit=async e=>{e.preventDefault();try{const r=await api('admFind',{q:$('#iFind').value.trim()});$('#admRes').innerHTML=r.rows.map(o=>`<button class="prow" data-act="admopen" data-v="${o.id}"><span>${o.on?'<span class="on"></span>':''}<b>${esc(o.pseudo)}</b></span><span class="num">${eur(o.worth)}</span></button>`).join('')||'<div class="empty">Aucun joueur.</div>'}catch(er){}}}
ACT.admrain=async()=>{const a=+$('#iRain').value.replace(/\D/g,'');if(!a)return;try{const r=await api('admRain',{amt:a});toast(eur(a)+' donnés à '+r.n+' joueur(s).');burst(20)}catch(e){}};
ACT.admev=async el=>{const t=el.dataset.v;try{await api('admEvent',{type:t,amt:t==='boostjk'?+$('#iJk').value.replace(/\D/g,''):undefined});toast('C\'est lancé !');snd('big');setTimeout(needRender,300)}catch(e){}};
ACT.admbugs=async()=>{let r;try{r=await api('admBugs')}catch(e){return}const b=$('#admBugs');if(!b)return;
  b.innerHTML=r.list.length?r.list.map((x,i)=>`<div class="bugrow"><div class="note">${new Date(x.t).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · <b>${esc(x.pseudo)}</b></div><div>${esc(x.text)}</div><button class="btn sm" data-act="admbugdel" data-v="${i}">Traité ✓</button></div>`).join(''):'<div class="empty">Aucun bug signalé. 🎉</div>'};
ACT.admbugdel=async el=>{try{await api('admBugDel',{i:+el.dataset.v});ACT.admbugs()}catch(e){}};
ACT.admopen=async el=>{let o;try{o=await api('admUser',{id:+el.dataset.v})}catch(e){return}ADMU=o;
  modal(`<div class="pfhead"><div class="pfav">${avHTML(72,{v2:o.av})}</div><div><p class="mt" style="margin:0">${esc(o.pseudo)}</p><div class="note">Niveau ${o.lvl} · ${o.on?'en ligne':'hors ligne'}${o.banned?' · <b style="color:var(--lose)">banni</b>':''}</div></div></div>
    <div class="stats"><div class="stat"><div class="l">Cash</div><div class="v">${eur(o.cash)}</div></div><div class="stat"><div class="l">Fortune</div><div class="v">${eur(o.worth)}</div></div><div class="stat"><div class="l">Parties</div><div class="v">${fr.format(o.played)}</div></div></div>
    <h3 style="margin:4px 0 0">Argent</h3><div class="inrow"><input id="aAmt" inputmode="numeric" value="10000" aria-label="Montant"><input id="aMsg" placeholder="Petit mot (facultatif)" maxlength="80" aria-label="Message"></div>
    <div class="row2"><button class="btn gold" data-act="admgive" data-v="1">Donner</button><button class="btn red" data-act="admgive" data-v="-1">Retirer</button></div>
    <h3 style="margin:4px 0 0">Compte</h3><div class="inrow"><input id="aPs" maxlength="16" value="${esc(o.pseudo)}" aria-label="Pseudo"><button class="btn sm" data-act="admren">Renommer</button></div>
    <div class="inrow"><input id="aLv" inputmode="numeric" value="${o.xp}" aria-label="XP"><button class="btn sm" data-act="admlv">Régler l'XP</button></div>
    ${o.id===S.id?'':`<div class="row2"><button class="btn sm" data-act="admban" data-v="60">Bannir 1 h</button><button class="btn sm" data-act="admban" data-v="1440">Bannir 24 h</button></div><div class="row2"><button class="btn sm" data-act="admban" data-v="0">Débannir</button><button class="btn red sm" data-act="admreset">Remettre à zéro</button></div>`}
    <button class="btn" data-close>Fermer</button>`,'sheet')};
ACT.admgive=async el=>{const a=+$('#aAmt').value.replace(/\D/g,'')*+el.dataset.v;if(!a)return;try{await api('admGive',{id:ADMU.id,amt:a,msg:$('#aMsg').value});toast((a>0?'Donné : ':'Retiré : ')+eur(Math.abs(a)));ACT.admopen({dataset:{v:ADMU.id}})}catch(e){}};
ACT.admren=async()=>{try{await api('admRename',{id:ADMU.id,pseudo:$('#aPs').value.trim()});toast('Renommé.');ACT.admopen({dataset:{v:ADMU.id}})}catch(e){}};
ACT.admlv=async()=>{try{await api('admLevel',{id:ADMU.id,xp:+$('#aLv').value.replace(/\D/g,'')});toast('XP réglée.')}catch(e){}};
ACT.admban=async el=>{try{await api('admBan',{id:ADMU.id,min:+el.dataset.v});toast(+el.dataset.v?'Joueur banni.':'Joueur débanni.');ACT.admopen({dataset:{v:ADMU.id}})}catch(e){}};
ACT.admreset=()=>{const id=ADMU.id;modal(`<p class="mt bad">Remettre ${esc(ADMU.pseudo)} à zéro ?</p><p class="note">Argent, objets, niveau : tout repart de zéro. Il garde son pseudo et son avatar.</p><div class="row2"><button class="btn" data-close>Annuler</button><button class="btn red" data-act="admresetgo" data-v="${id}">Oui, remettre à zéro</button></div>`)};
ACT.admresetgo=async el=>{try{await api('admReset',{id:+el.dataset.v});closeModal();toast('Compte remis à zéro.')}catch(e){}};

/* ---------- Messages globaux, bannissement ---------- */
on('global',g=>{if(g.type==='msg')whenFree(()=>{snd('notif');modal(`<div class="center"><span class="crown big">👑</span></div><p class="mt">Message de ${esc(g.from)}</p><p style="font-size:17px">${esc(g.text)}</p><p class="note">Créateur de Fauché</p><button class="btn gold" data-close>Bien reçu</button>`)});
  if(g.type==='happy'){HAPPY=g.until;updTop();notif('🍾','Happy hour','Tous les gains sont doublés pendant 30 minutes !',()=>go('casino',null))}});
let HAPPY=0;
on('banned',b=>{store.del('fauche-token');setTimeout(()=>{$('#conn').hidden=true;authView('login','Ton compte est suspendu jusqu\'au '+new Date(b.until).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'.')},50)});

/* ---------- Quoi de neuf ---------- */
const NEWS=[['🎨','Nouvelle interface dorée','Tout le casino a été redessiné, avec des animations partout.'],['🧑‍🎤','Ton vrai avatar','Crée ta tête dans Moi › Avatar. Tes objets de luxe apparaissent dessus.'],['👀','Profils des joueurs','Touche un joueur pour voir sa fortune, sa vitrine et ses faillites.'],
  ['🎈','Plein de nouveaux jeux','Ballon, Dragon Tigre, Grande Roue, pousse-pièces, lingots, tickets à thème…'],['🎡','Roulette à cheval','Mise entre deux cases ou au coin de quatre numéros, comme au vrai casino.'],['💼','Braquages 2.0 et histoires','Le Daron, l\'huissier et Kevin reviennent avec de vraies conséquences.']];
ACT.news=()=>modal(`<p class="mt">Quoi de neuf · V${D.VERSION}</p><div class="news">${NEWS.map(([i,t,x])=>`<div><span class="ic">${i}</span><span><b>${t}</b><br><span class="note">${x}</span></span></div>`).join('')}</div><p class="note center">Mise à jour imaginée par Momo.</p><button class="btn gold" data-close>Trop bien</button>`);
on('me',d=>{if(!d||!d.tutoDone)return;if(store.get('fauche-seen')===D.VERSION)return;store.set('fauche-seen',D.VERSION);setTimeout(()=>whenFree(ACT.news),1200)});
