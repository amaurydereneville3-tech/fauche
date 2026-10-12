/* ====================== Social ====================== */
let ONLINE=[],CHAT=[];
VIEWS.social=v=>{const n=(S.loanReq||[]).length;
  v.innerHTML=`<h2>Social</h2><p class="sub">${ONLINE.length} joueur${ONLINE.length>1?'s':''} en ligne. Discute, défie, prête… et réclame ton argent.</p>
  ${segHTML('social',[['chat','💬 Chat'],['players','👥 En ligne'],['top','🏆 Classement'],['loans','🤝 Prêts'+(n?' ('+n+')':'')]])}<div class="section" style="margin-top:12px" id="sov"></div>`;
  ({chat:rChat,players:rPlayers,top:rTop,loans:rLoans})[sub.social]($('#sov'))};
function rChat(v){v.innerHTML=`<div class="chatbox"><div class="chatlist" id="chatL"></div><form class="chatin" id="chatF"><input id="chatI" maxlength="200" placeholder="Écris un message…" aria-label="Message" autocomplete="off"><button class="btn gold sm" type="submit">Envoyer</button></form></div><p class="note">Reste cool : les insultes sont masquées automatiquement.</p>`;
  chatUI();$('#chatF').onsubmit=async e=>{e.preventDefault();const i=$('#chatI'),t=i.value.trim();if(!t)return;try{await api('say',{text:t});i.value=''}catch(er){}};unread=0;nav()}
function chatUI(){const L=$('#chatL');if(!L)return;const atBottom=L.scrollTop+L.clientHeight>=L.scrollHeight-40;
  L.innerHTML=CHAT.map(m=>`<div class="cmsg"><button class="f" data-act="prof" data-v="${m.uid}" ${m.uid?'':'disabled'} aria-label="Profil de ${esc(m.pseudo)}">${fc(m,34)}</button><span class="w"><b>${esc(m.pseudo)}</b>${m.cr?' <span class="crown" title="Créateur du jeu">👑 Créateur</span>':''} · ${new Date(m.t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span><span class="x">${esc(m.text)}</span></div>`).join('')||'<div class="empty">Personne n\'a encore parlé. Lance la discussion !</div>';
  if(atBottom||L.dataset.init!=='1'){L.scrollTop=L.scrollHeight;L.dataset.init='1'}}
on('chat',m=>{CHAT.push(m);if(CHAT.length>80)CHAT.shift();if(tab==='social'&&sub.social==='chat')chatUI();else if(m.uid!==S.id){unread++;nav()}});
function rPlayers(v){v.innerHTML=ONLINE.map(p=>`<button class="prow" data-act="prof" data-v="${p.id}"><span><span class="on"></span>${fc(p,30)} <b>${esc(p.pseudo)}</b>${p.cr?' <span class="crown">👑</span>':''}${p.id===S.id?' (toi)':''}</span><span class="note">niv. ${p.lvl} ›</span></button>`).join('')||'<div class="empty">Personne en ligne.</div>';
  v.insertAdjacentHTML('beforeend','<p class="note">Invite tes potes : envoie-leur simplement le lien du site.</p>')}
on('online',l=>{ONLINE=l;if(tab==='social'&&sub.social==='players')render();if(tab==='casino'&&!sub.casino)render()});
async function rTop(v){v.innerHTML='<div class="empty">Chargement du classement…</div>';try{const r=await api('top');if(sub.social!=='top')return;
  v.innerHTML=r.rows.map((p,i)=>`<button class="prow" data-act="prof" data-v="${p.id}"><span>${i<3?['🥇','🥈','🥉'][i]:(i+1)+'.'} ${fc(p,30)} <b class="${p.id===S.id?'me':''}" style="${p.id===S.id?'color:var(--gold)':''}">${esc(p.pseudo)}</b>${p.cr?' <span class="crown">👑</span>':''}${p.on?' <span class="on"></span>':''}</span><span class="num">${eur(p.worth)}</span></button>`).join('')}catch(e){}}
function rLoans(v){const R=S.loanReq||[];
  v.innerHTML=`<h3 style="margin-top:0">Demandes reçues</h3>${R.length?R.map(r=>`<div class="lrow2"><span><b>${esc(r.fromP)}</b> veut ${eur(r.amt)} à ${r.rate} %<br><small class="note">Il te rendra ${eur(Math.round(r.amt*(1+r.rate/100)))}</small></span><span style="display:flex;gap:6px"><button class="btn sm" data-act="lans" data-id="${r.id}" data-v="0">Non</button><button class="btn gold sm" data-act="lans" data-id="${r.id}" data-v="1">Prêter</button></span></div>`).join(''):'<div class="empty">Aucune demande.</div>'}
  <h3>Ce que tu dois</h3>${S.fdebts.length?S.fdebts.map(d=>`<div class="lrow2"><span>Tu dois <b class="num">${eur(d.owed)}</b> à ${esc(d.pseudo)}</span><button class="btn gold sm" data-act="lrepay" data-id="${d.id}" ${S.cash<d.owed?'disabled':''}>Rembourser</button></div>`).join(''):'<div class="empty">Tu ne dois rien à personne. Pour l\'instant.</div>'}
  <h3>Ce qu'on te doit</h3>${S.lent.length?S.lent.map(d=>`<div class="lrow2"><span>${esc(d.pseudo)} te doit <b class="num">${eur(d.owed)}</b></span><button class="btn sm" data-act="lremind" data-id="${d.id}">Relancer 😤</button></div>`).join(''):'<div class="empty">Personne ne te doit d\'argent.</div>'}
  <p class="note">Pour demander un prêt, ouvre le profil d'un joueur (onglet En ligne ou Classement).</p>`}
ACT.lans=async el=>{try{await api('loanAnswer',{id:el.dataset.id,yes:el.dataset.v==='1'});toast(el.dataset.v==='1'?'Prêt accordé.':'Demande refusée.');needRender()}catch(e){}};
ACT.lrepay=async el=>{try{await api('loanRepay',{id:el.dataset.id});toast('Dette remboursée.');needRender()}catch(e){}};
ACT.lremind=async el=>{try{await api('loanRemind',{id:el.dataset.id});toast('Relance envoyée.')}catch(e){}};
ACT.prof=async el=>{let p;try{p=await api('profile',{id:+el.dataset.v})}catch(e){return}const mine=p.id===S.id;
  const its=p.items.map(itemInfo).filter(Boolean);
  modal(`<div class="center">${avHTML(80,p.av)}</div><p class="mt">${esc(p.pseudo)}</p><p class="note" style="margin:0">Niveau ${p.lvl} · ${D.title(p.lvl)} ${p.on?'· en ligne':''}${p.suspect?' · <span style="color:var(--lose)">Suspect</span>':''}</p>
  ${cardHTML(p)}<div class="stats"><div class="stat"><div class="l">Victoires</div><div class="v">${p.wins}</div></div><div class="stat"><div class="l">Défaites</div><div class="v">${p.losses}</div></div><div class="stat"><div class="l">Succès</div><div class="v">${p.ach.length}/${D.ACH.length}</div></div></div>
  <div class="tags" style="justify-content:center">${p.ach.map(id=>{const a=D.ACH.find(x=>x.id===id);return a?`<span class="tag ${a.sh?'bad':''}" title="${a.nm}">${a.ic} ${a.nm}</span>`:''}).slice(0,8).join('')}</div>
  <div class="room" style="--wall:${D.WALLS[p.wall||0]};height:200px"><div class="win"></div>${its.slice(0,12).map((it,i)=>`<span class="it" style="left:${6+(i*15)%84}%;top:${58+(i%3)*12}%">${it.ic}</span>`).join('')}<span class="it" style="left:46%;top:52%;font-size:40px">${p.av.face}</span></div>
  ${mine?'':`<div class="row2"><button class="btn gold" data-act="pduel" data-v="${p.id}" ${p.on?'':'disabled'}>🪙 Défier en duel</button><button class="btn" data-act="ploan" data-v="${p.id}" data-n="${esc(p.pseudo)}">🤝 Demander un prêt</button></div>`}<button class="btn" data-close>Fermer</button>`)};
ACT.pduel=el=>{closeModal();DU.opp=+el.dataset.v;go('casino','duel')};
ACT.ploan=el=>{const id=+el.dataset.v,n=el.dataset.n;ST.loan=Math.min(ST.loan||500,1e7);
  modal(`<p class="mt">Demander un prêt à ${esc(n)}</p>${stakeUI('loan').replace('Ta mise','Montant')}<label class="field"><span class="note">Intérêts que tu proposes (%)</span><input id="lrate" type="text" inputmode="numeric" value="10"></label>
  <div class="row2"><button class="btn" data-close>Annuler</button><button class="btn gold" data-act="ploango" data-v="${id}">Envoyer la demande</button></div><p class="note">Si ${esc(n)} accepte, ta dette sera visible par tout le monde jusqu'au remboursement.</p>`)};
ACT.ploango=async el=>{const rate=+($('#lrate').value||'0').replace(/\D/g,'');const amt=ST.loan;if(amt<1)return toast('Choisis un montant.');try{await api('loanAsk',{to:+el.dataset.v,amt,rate});closeModal();toast('Demande envoyée !')}catch(e){}};
