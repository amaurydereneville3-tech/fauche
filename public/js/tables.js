/* ====================== Poker ====================== */
let PK={table:null,st:null,raise:0,showRaise:false};
const POS=[[50,90],[10,68],[12,22],[50,5],[88,22],[90,68]];
GAME_VIEW.poker=el=>{
  if(!PK.table){el.innerHTML=`<p class="sub">Texas Hold'em No Limit. Assieds-toi avec tes potes : s'il manque du monde, des bots complètent la table.</p><div class="list" id="pkL">${D.POKER.map(c=>`<div class="lrow2"><span><b>${c.nm}</b><br><small class="note">Blindes ${eur(c.sb)} / ${eur(c.bb)} · cave ${eur(c.min)} à ${eur(c.max)}</small><br><small class="note" id="pkn-${c.id}"></small></span><button class="btn gold sm" data-act="pkopen" data-v="${c.id}">Rejoindre</button></div>`).join('')}</div>
    <p class="note">Les cartes sont distribuées par le serveur : personne ne peut tricher.</p>`;
    api('pkLobby').then(r=>pkLobbyUI(r.tables)).catch(()=>{});return}
  el.innerHTML=`<div class="lrow2"><b id="pkName"></b><button class="btn sm" data-act="pkquit">← Tables</button></div><div class="ptable" id="pkT"></div><div class="section" id="pkCtl"></div>
    <div class="emotes">${['👍','😂','😱','🔥','🤡','💸','😡','🍀'].map(e=>`<button data-act="pkemote" data-v="${e}" aria-label="Réaction ${e}">${e}</button>`).join('')}</div><div class="plog" id="pkLog"></div>`;
  quiet(api('pkJoin',{id:PK.table}));const id=PK.table;onLeave(()=>quiet(api('pkLeaveRoom',{id})));pkUI()};
on('pkLobby',t=>pkLobbyUI(t));
function pkLobbyUI(ts){ts.forEach(t=>{const e=$('#pkn-'+t.id);if(e)e.textContent=`${t.n} joueur${t.n>1?'s':''}${t.bots?' + '+t.bots+' bot'+(t.bots>1?'s':''):''}`})}
ACT.pkopen=el=>{PK.table=el.dataset.v;PK.st=null;render()};
ACT.pkquit=async()=>{const t=PK.st;if(t&&t.me>=0){if(t.phase==='hand'&&t.seats[t.me].inHand&&!t.seats[t.me].folded){modal(`<p class="mt">Quitter la table ?</p><p class="note">Tu es dans une main : tu vas te coucher. Ton tapis restant retourne dans ta caisse.</p><div class="row2"><button class="btn" data-close>Rester</button><button class="btn red" data-act="pkstand">Quitter</button></div>`);return}await quiet(api('pkStand',{id:PK.table}))}PK.table=null;PK.st=null;render()};
ACT.pkstand=async()=>{closeModal();await quiet(api('pkStand',{id:PK.table}));PK.table=null;PK.st=null;render()};
BUSY.push(()=>false);
on('pk',d=>{if(d.id!==PK.table)return;const prev=PK.st;PK.st=d;if(prev&&d.board.length>prev.board.length)snd('card');if(prev&&prev.hand!==d.hand&&d.me>=0)snd('card');
  if(prev&&prev.toAct!==d.toAct&&d.toAct===d.me&&d.me>=0){snd('notif');vib(60)}if(d.phase==='show'&&prev&&prev.phase!=='show'&&d.me>=0&&d.seats[d.me]&&d.seats[d.me].win>0){burst(20);snd('big')}
  if(tab==='casino'&&sub.casino==='poker')pkUI()});
on('emote',d=>{if(d.table!==PK.table)return;const st=PK.st;if(!st)return;const i=st.seats.findIndex(s=>s&&s.pseudo===d.pseudo);const T=$('#pkT');if(!T||i<0)return;const p=POS[(i-(st.me>=0?st.me:0)+6)%6];
  const e=document.createElement('span');e.className='floatemote';e.textContent=d.e;e.style.left=p[0]+'%';e.style.top=(p[1]-6)+'%';T.appendChild(e);setTimeout(()=>e.remove(),1900)});
ACT.pkemote=el=>quiet(api('pkEmote',{id:PK.table,e:el.dataset.v}));
function pkUI(){const t=PK.st,T=$('#pkT');if(!T||!t)return;$('#pkName').textContent=`${t.cfg.nm} · ${eur(t.cfg.sb)}/${eur(t.cfg.bb)}`;const base=t.me>=0?t.me:0;
  const seats=t.seats.map((s,i)=>{const p=POS[(i-base+6)%6];
    if(!s)return`<div class="pseat empty" style="left:${p[0]}%;top:${p[1]}%">${t.me<0?`<button class="av" data-act="pksit" data-v="${i}" aria-label="S'asseoir">+</button><span class="nm">S'asseoir</span>`:'<span class="av">·</span><span class="nm note">Libre</span>'}</div>`;
    const act=t.toAct===i&&t.phase==='hand';const cs=s.cards.length&&i!==t.me?`<div class="cs">${s.cards.map(c=>c==='??'?'<div class="pc down"><div class="in"><div class="face"></div><div class="back"></div></div></div>':cardEl(cardStr(c)).outerHTML).join('')}</div>`:'';
    return`<div class="pseat ${act?'act':''} ${s.folded?'fold':''}" style="left:${p[0]}%;top:${p[1]}%">${cs}<span class="av">${act?`<span class="ring" data-dl="${t.deadline}" data-dlt="${s.bot?1500:25000}"></span>`:''}${s.av?fc(s,40):s.face}</span>${t.dealer===i?'<span class="dl">D</span>':''}
      <span class="nm">${esc(s.pseudo)}${i===t.me?' (toi)':''}</span><span class="st">${eur(s.stack)}</span>${s.bet?`<span class="bt">${eur(s.bet)}</span>`:''}${s.hand?`<span class="hn">${s.hand}</span>`:''}${s.win?`<span class="hn">+${eur(s.win)}</span>`:''}${s.allin&&!s.folded&&t.phase==='hand'?'<span class="hn" style="color:var(--lose)">TAPIS</span>':''}</div>`}).join('');
  T.innerHTML=`<div class="oval"></div><div class="center"><div class="pboard">${t.board.map(c=>cardEl(cardStr(c)).outerHTML).join('')}</div><span class="pot">Pot ${eur(t.pot)}</span><span class="note" style="color:#d6e6df">${esc(t.msg||'')}</span></div>${seats}`;
  $('#pkLog').innerHTML=t.log.map(l=>`<div>${esc(l)}</div>`).join('');
  const c=$('#pkCtl'),meS=t.me>=0?t.seats[t.me]:null;
  if(!meS){c.innerHTML=`<p class="note center">Touche une place libre (+) pour t'asseoir. Cave entre ${eur(t.cfg.min)} et ${eur(t.cfg.max)}.</p>`;return}
  let h='';if(meS.cards.length)h+=`<div class="mycards">${meS.cards.map(x=>cardEl(cardStr(x)).outerHTML).join('')}</div>${meS.hand?`<p class="center" style="margin:0;font-weight:700">${meS.hand}</p>`:''}`;
  if(t.phase==='hand'&&t.toAct===t.me){const toCall=t.bet-meS.bet,minTo=Math.min(t.bet+t.minRaise,meS.stack+meS.bet),maxTo=meS.stack+meS.bet;if(!PK.raise||PK.raise<minTo||PK.raise>maxTo)PK.raise=minTo;
    h+=`<div class="row3"><button class="btn red" data-act="pka" data-v="fold">Se coucher</button>${toCall>0?`<button class="btn" data-act="pka" data-v="call">Suivre ${eur(Math.min(toCall,meS.stack))}</button>`:`<button class="btn" data-act="pka" data-v="check">Parole</button>`}<button class="btn gold" data-act="pkr">${PK.showRaise?'Fermer':'Relancer'}</button></div>`;
    if(PK.showRaise&&maxTo>t.bet)h+=`<div class="raise"><div style="display:flex;justify-content:space-between"><span>Relancer à</span><b class="num" id="pkRv">${eur(PK.raise)}</b></div><input type="range" id="pkRange" min="${minTo}" max="${maxTo}" step="${t.cfg.sb}" value="${PK.raise}" aria-label="Montant de la relance">
      <div class="row4"><button class="btn sm" data-act="pkp" data-v="${minTo}">Min</button><button class="btn sm" data-act="pkp" data-v="${Math.min(maxTo,Math.max(minTo,t.bet+Math.round(t.pot/2)))}">½ pot</button><button class="btn sm" data-act="pkp" data-v="${Math.min(maxTo,Math.max(minTo,t.bet+t.pot))}">Pot</button><button class="btn sm" data-act="pkp" data-v="${maxTo}">Tapis</button></div>
      <button class="btn gold" data-act="pka" data-v="raise">${PK.raise>=maxTo?'Faire tapis':'Relancer à '+eur(PK.raise)}</button></div>`}
  else if(t.phase==='hand'&&meS.inHand&&!meS.folded)h+=`<p class="note center">${t.toAct>=0&&t.seats[t.toAct]?esc(t.seats[t.toAct].pseudo)+' réfléchit…':'…'}</p>`;
  h+=`<button class="btn sm" data-act="pkquit" style="justify-self:center">Quitter la table (${eur(meS.stack)} retournent en caisse)</button>`;c.innerHTML=h;
  const rg=$('#pkRange');if(rg)rg.oninput=()=>{PK.raise=+rg.value;$('#pkRv').textContent=eur(PK.raise);const b=document.querySelector('[data-act="pka"][data-v="raise"]');if(b)b.textContent=PK.raise>=maxToOf()?'Faire tapis':'Relancer à '+eur(PK.raise)}}
const maxToOf=()=>{const t=PK.st,m=t.seats[t.me];return m.stack+m.bet};
setInterval(()=>{$$('[data-dl]').forEach(e=>{const l=Math.max(0,+e.dataset.dl-now());e.style.setProperty('--p',(l/+e.dataset.dlt*100)+'%')})},200);
ACT.pkr=()=>{PK.showRaise=!PK.showRaise;pkUI()};
ACT.pkp=el=>{PK.raise=+el.dataset.v;pkUI()};
ACT.pka=async el=>{const a=el.dataset.v;PK.showRaise=false;try{await api('pkAct',{id:PK.table,a,amount:PK.raise});snd(a==='fold'?'card':'chip')}catch(e){}};
ACT.pksit=el=>{const c=PK.st.cfg;if(S.cash<c.min)return toast('Il te faut au moins '+eur(c.min)+' pour cette table.');const max=Math.min(c.max,S.cash);ST.pk=Math.min(max,Math.max(c.min,c.bb*50));
  modal(`<p class="mt">S'asseoir</p><p class="note">Combien de jetons prends-tu à la table ?</p><b class="num" id="pkBv" style="font-size:24px">${eur(ST.pk)}</b><input type="range" id="pkBuy" min="${c.min}" max="${max}" step="${c.bb}" value="${ST.pk}" aria-label="Cave">
    <div class="row2"><button class="btn" data-close>Annuler</button><button class="btn gold" data-act="pksitgo" data-v="${el.dataset.v}">S'asseoir</button></div>`);
  $('#pkBuy').oninput=e=>{ST.pk=+e.target.value;$('#pkBv').textContent=eur(ST.pk)}};
ACT.pksitgo=async el=>{closeModal();try{await api('pkSit',{id:PK.table,seat:+el.dataset.v,buyin:ST.pk});snd('chip')}catch(e){}};

/* ====================== Blackjack partagé ====================== */
let BJ={table:null,st:null};
GAME_VIEW.bj=el=>{
  if(!BJ.table){el.innerHTML=`<p class="sub">Jusqu'à 5 joueurs face au même croupier. Chacun joue sa main à son tour.</p><div class="list">${D.BJT.map(c=>`<div class="lrow2"><span><b>${c.nm}</b><br><small class="note">Mise de ${eur(c.min)} à ${eur(c.max)}</small><br><small class="note" id="bjn-${c.id}"></small></span><button class="btn gold sm" data-act="bjopen" data-v="${c.id}">Rejoindre</button></div>`).join('')}</div>
    <div class="center"><button class="linkbtn" data-act="bjrules">Voir les règles</button></div>`;
    api('bjLobby').then(r=>r.tables.forEach(t=>{const e=$('#bjn-'+t.id);if(e)e.textContent=t.n+' joueur'+(t.n>1?'s':'')+' assis'})).catch(()=>{});return}
  el.innerHTML=`<div class="lrow2"><b id="bjName"></b><button class="btn sm" data-act="bjquit">← Tables</button></div><div class="felt"><div class="shoe" aria-hidden="true"></div>
    <div class="seat"><div class="lbl">Croupier <span class="pill" id="dTot"></span></div><div class="cards" id="dCards"></div><div class="spy" id="spy" hidden></div></div>
    <div class="arc">LE BLACKJACK PAIE 3 POUR 2 · LE CROUPIER RESTE À 17</div><div class="msg" id="bjMsg"></div><div class="bjseats" id="bjSeats"></div></div><div id="bjCtl" class="section"></div>`;
  quiet(api('bjJoin',{id:BJ.table}));const id=BJ.table;onLeave(()=>quiet(api('bjLeaveRoom',{id})));bjUI()};
ACT.bjopen=el=>{BJ.table=el.dataset.v;BJ.st=null;render()};
ACT.bjquit=async()=>{const t=BJ.st;if(t&&t.me>=0){try{await api('bjStand',{id:BJ.table})}catch(e){return}}BJ.table=null;BJ.st=null;render()};
BUSY.push(()=>!!(BJ.st&&BJ.st.me>=0&&['deal','play','dealer'].includes(BJ.st.phase)&&BJ.st.seats[BJ.st.me].hands.length));
on('bj',d=>{if(d.id!==BJ.table)return;const prev=BJ.st;BJ.st=d;const cnt=x=>x?x.dealer.length+x.seats.reduce((a,s)=>a+(s?s.hands.reduce((b,h)=>b+h.cards.length,0):0),0):0;if(cnt(d)>cnt(prev))snd('card');
  if(prev&&d.phase==='play'&&d.active[0]===d.me&&(prev.active[0]!==d.me||prev.phase!=='play')){snd('notif');vib(60)}if(tab==='casino'&&sub.casino==='bj')bjUI()});
on('bjRes',d=>{if(d.net>0){burst(14);toast('Gagné ! +'+eur(d.net))}else if(d.net<0)toast('Perdu '+eur(-d.net));else toast('Égalité, mise rendue.')});
const RES={bust:['Sauté','lose'],bj:['Blackjack !','gold'],win:['Gagné','win'],lose:['Perdu','lose'],push:['Égalité','']};
function bjUI(){const t=BJ.st;if(!t||!$('#bjSeats'))return;$('#bjName').textContent=t.cfg.nm;
  const dc=$('#dCards');dc.innerHTML='';t.dealer.forEach(c=>dc.appendChild(cardEl(c,!c)));$('#dTot').textContent=t.dealer.length?t.dealerTot:'';
  const sp=$('#spy');sp.hidden=!t.spy;if(t.spy)sp.textContent='🦈 Élixir du Requin : carte cachée = '+t.spy.r+t.spy.s;
  $('#bjMsg').textContent=t.msg||'';
  $('#bjSeats').innerHTML=t.seats.map((s,i)=>{if(!s)return`<div class="bjseat">${t.me<0?`<button class="sit" data-act="bjsit" data-v="${i}">S'asseoir</button>`:'<span class="note">·</span>'}</div>`;
    const act=t.phase==='play'&&t.active[0]===i;
    return`<div class="bjseat ${i===t.me?'me':''} ${act?'act':''}"><span class="nm">${fc(s,22)} ${esc(s.pseudo)}</span>${s.hands.length?s.hands.map((h,k)=>`<div class="cards" style="${act&&t.active[1]===k?'outline:2px solid var(--gold);border-radius:6px':''}">${h.cards.map(c=>cardEl(c).outerHTML).join('')}</div><span class="pill">${h.tot||''}</span>${h.res?`<span class="pill ${RES[h.res][1]}">${RES[h.res][0]}</span>`:''}`).join(''):''}
      ${s.bet&&!s.hands.length?`${chipSpan(s.bet)}<span class="pill">${eur(s.bet)}</span>`:s.hands.length?`<span class="note num">${eur(s.hands.reduce((a,h)=>a+h.bet,0))}</span>`:''}</div>`}).join('');
  const c=$('#bjCtl');if(t.me<0){c.innerHTML='<p class="note center">Choisis une place libre pour t\'asseoir.</p>';return}const meS=t.seats[t.me];
  if(t.phase==='bet'){const mode='bet'+t.endsAt+(meS.bet?'b':'');if(c.dataset.mode===mode)return;c.dataset.mode=mode;
    c.innerHTML=`<div class="countdown"><span>Distribution dans <b data-secs="${t.endsAt}">${secs(t.endsAt)}</b> s</span>${timerBar(t.endsAt,12000)}</div>${meS.bet?`<p class="note center">Ta mise : <b>${eur(meS.bet)}</b>. Tu peux encore en ajouter.</p>`:''}${stakeUI('bj')}<button class="btn gold big" data-act="bjbet">Miser · <span data-sl="bj">${eur(ST.bj)}</span></button><button class="btn sm" data-act="bjquit" style="justify-self:center">Se lever</button>`;return}
  c.dataset.mode='';
  if(t.phase==='play'&&t.active[0]===t.me){const h=meS.hands[t.active[1]];const canD=h.cards.length===2&&S.cash>=h.bet,canS=h.cards.length===2&&h.cards[0]&&(cvc(h.cards[0])===cvc(h.cards[1]))&&meS.hands.length<4&&S.cash>=h.bet;
    c.innerHTML=`<div class="countdown"><span>À toi !</span>${timerBar(t.deadline,20000)}</div><div class="row4"><button class="btn" data-act="bja" data-v="hit">Carte</button><button class="btn" data-act="bja" data-v="stand">Rester</button><button class="btn" data-act="bja" data-v="double" ${canD?'':'disabled'}>Doubler</button><button class="btn" data-act="bja" data-v="split" ${canS?'':'disabled'}>Séparer</button></div>`}
  else if(t.phase==='idle')c.innerHTML=`<p class="note center">En attente…</p><button class="btn sm" data-act="bjquit" style="justify-self:center">Se lever</button>`;
  else c.innerHTML=`<p class="note center">${t.phase==='done'?'Nouvelle donne dans un instant…':'Patience, ce n\'est pas encore ton tour.'}</p>`}
const cvc=c=>c.r==='A'?11:'JQK'.includes(c.r)?10:+c.r;
ACT.bjsit=el=>quiet(api('bjSit',{id:BJ.table,seat:+el.dataset.v}));
ACT.bjbet=async()=>{if(!canBet(ST.bj))return;try{await api('bjBet',{id:BJ.table,amt:ST.bj});snd('chip')}catch(e){}};
ACT.bja=el=>quiet(api('bjAct',{id:BJ.table,a:el.dataset.v}));
ACT.bjrules=()=>modal(`<p class="mt">Règles du blackjack</p><ul><li>But : faire plus que le croupier sans dépasser 21.</li><li>Figures = 10, As = 1 ou 11.</li><li>Blackjack (As + 10 dès les 2 premières cartes) : payé 3 pour 2.</li><li>Victoire normale : payée 1 pour 1. Égalité : mise rendue.</li><li>Le croupier tire jusqu'à 16 et reste à partir de 17.</li><li>Doubler : uniquement sur tes 2 premières cartes, tu reçois une seule carte.</li><li>Séparer : deux cartes de même valeur, jusqu'à 4 mains. As séparés : une seule carte chacun.</li><li>Le croupier vérifie son blackjack quand il montre un As ou un 10.</li><li>Chaque joueur a 20 secondes pour jouer.</li></ul><button class="btn gold" data-close>Compris</button>`);
