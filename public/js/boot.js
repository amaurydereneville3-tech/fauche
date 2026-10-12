/* ====================== Connexion & démarrage ====================== */
function authView(mode='login',err=''){$('#app').hidden=true;$('#navWrap').hidden=true;const v=$('#authView');v.hidden=false;
  v.innerHTML=`<div class="auth"><div class="box"><div class="logo">Fau<span>ché</span></div><span class="tag">Le casino où l'argent ne sert qu'à flexer</span>
    <div class="seg"><button data-act="amode" data-v="login" class="${mode==='login'?'on':''}">Se connecter</button><button data-act="amode" data-v="register" class="${mode==='register'?'on':''}">Créer un compte</button></div>
    <form id="authF" class="section"><label class="field"><span class="note">Pseudo</span><input id="aP" autocomplete="username" maxlength="16" required></label>
      <label class="field"><span class="note">Mot de passe ${mode==='register'?'(6 caractères minimum)':''}</span><input id="aW" type="password" autocomplete="${mode==='register'?'new-password':'current-password'}" required></label>
      ${mode==='register'?'<label class="check"><input type="checkbox" id="aA"><span>J\'ai 18 ans ou plus. Je sais que Fauché est un jeu avec de l\'argent fictif : rien ne s\'achète ni ne se retire en vrai argent.</span></label>':''}
      <div class="err" id="aE">${esc(err)}</div><button class="btn gold big" type="submit">${mode==='register'?'Créer mon compte et jouer':'Entrer au casino'}</button></form>
    <p class="note center">Argent 100 % fictif. Réservé aux plus de 18 ans.</p><div class="credit">Un jeu créé par <b>Momo</b> 👑</div></div></div>`;
  $('#authF').onsubmit=async e=>{e.preventDefault();const body={pseudo:$('#aP').value.trim(),pass:$('#aW').value};if(mode==='register')body.age=$('#aA').checked;
    $('#aE').textContent='';try{const r=await fetch('/api/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json();
      if(!r.ok){$('#aE').textContent=j.err||'Erreur.';return}store.set('fauche-token',j.token);connect()}catch(er){$('#aE').textContent='Impossible de joindre le serveur. Réessaie dans un instant.'}}}
ACT.amode=el=>authView(el.dataset.v);
function connect(){const token=store.get('fauche-token');if(!token)return authView();
  $('#authView').hidden=true;$('#conn').hidden=false;if(sock){sock.removeAllListeners();sock.disconnect()}
  sock=io({auth:{token},transports:['websocket','polling']});
  sock.on('connect_error',e=>{if(e.message==='auth'){store.del('fauche-token');$('#conn').hidden=true;authView('login','Session expirée, reconnecte-toi.')}});
  sock.on('connect',()=>{$('#conn').hidden=true;$('#app').hidden=false;$('#navWrap').hidden=false;if(lastKey){const k=lastKey;lastKey='';render()}});
  sock.on('disconnect',()=>{$('#conn').hidden=false});
  sock.on('logout',()=>{store.del('fauche-token');authView()});
  sock.onAny((ev,d)=>{(BUS[ev]||[]).forEach(f=>{try{f(d)}catch(e){console.error(ev,e)}})})}
let first=true;
on('me',d=>{const before=S;S=d;SKEW=d.now-Date.now();if(first){first=false;shown=S.cash;$('#cash').textContent=eur(S.cash);nav();applyTheme();updTop();render();return}
  applyTheme();updTop();if(wantRender){wantRender=false;render()}else if(['moi','shop','social'].includes(tab)&&!modalOpen()&&!document.activeElement?.matches('input')&&before&&(before.cash!==S.cash||before.items.length!==S.items.length||(before.loanReq||[]).length!==(S.loanReq||[]).length))render()});
on('hello',h=>{FEED=h.feed||[];setFeed();ONLINE=h.online||[];CHAT=h.chat||[];JACKPOT=h.jackpotUntil||0;if(h.jackpot)JACKPOT_G=h.jackpot;updTop()});
on('feed',h=>{FEED.unshift(h);FEED.length=Math.min(FEED.length,20);setFeed()});
on('notif',n=>{const go_=n.go==='missions'?()=>go('moi','missions'):n.go==='loans'?()=>go('social','loans'):(n.go||'').startsWith('game:')?()=>go('casino',n.go.slice(5)):null;notif(n.ic,n.from,n.body,go_);if(n.big)burst(24);if(n.snd)snd(n.snd);if(n.boom){snd('boom');shake()}});
on('global',g=>{if(g.type==='jackpot'){JACKPOT=g.until;updTop();notif('🎰','Casino','JACKPOT GÉANT : la machine à sous paie double pendant 10 minutes !',()=>go('casino','sl'))}
  if(g.type==='krach'){snd('boom');shake();notif('📉','Marchés',`KRACH ! Les marchés perdent jusqu'à ${g.pct} % d'un coup.`,()=>go('marches','bourse'))}});
on('bigloss',d=>bigLoss(d));
setInterval(()=>{if(S)updTop()},30000);
connect();
