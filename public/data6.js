/* Catalogues V6 partagés entre le serveur et le navigateur. Jeu créé par Momo. */
(function(D){
D.VERSION='6.0';
/* ---------- Avatars dessinés ---------- */
D.AVC={
  skin:['#f6d7c3','#ecc09c','#d9a074','#b97a4f','#8d5a36','#5e3b22'],
  hairC:['#1c1412','#4a2e1f','#7a4a28','#b7814a','#e3c27a','#d9d2c7','#b5322e','#3d5bd9','#e36aa8','#2f9e6a'],
  topC:['#1a1a22','#f2f0ea','#c3343a','#2d6cdf','#1f8a5b','#7b3fc4','#e08a1e','#e3b558','#ff7ab3','#6b6f7a'],
  bg:['#2a1d33','#1d3a2e','#3a1d24','#1d2a3a','#3a3020','#14111a','#4a2a0c','#26304a']};
// [id, nom, condition] — condition : {lv} niveau, {tier} carte, {item} objet possédé, {ach} succès
D.AVP={
  shape:[['ovale','Ovale'],['rond','Rond'],['carre','Carré']],
  hair:[['court','Court'],['degrade','Dégradé'],['rase','Rasé'],['boucles','Bouclés'],['long','Longs'],['queue','Queue de cheval'],['chignon','Chignon'],['meche','Mèche'],['tresses','Tresses',{lv:4}],['afro','Afro',{lv:3}],['crete','Crête',{lv:5}],['chauve','Chauve']],
  eyes:[['normal','Normaux'],['grands','Grands'],['plisses','Plissés'],['clin','Clin d\'œil',{lv:3}],['dollars','Yeux dollars',{lv:8}]],
  brows:[['normaux','Normaux'],['fronces','Froncés'],['leves','Levés'],['epais','Épais']],
  mouth:[['sourire','Sourire'],['neutre','Neutre'],['rire','Gros rire'],['moue','Moue'],['langue','Langue',{lv:2}],['dentor','Dent en or',{lv:6}]],
  beard:[['aucune','Aucune'],['barbe3j','Barbe de 3 jours'],['barbe','Barbe'],['moustache','Moustache'],['bouc','Bouc']],
  hat:[['aucun','Aucun'],['casquette','Casquette'],['casquette_env','Casquette à l\'envers'],['bonnet','Bonnet'],['bob','Bob',{lv:2}],['chapeau','Chapeau de mafieux',{lv:8}],['couronne','Couronne',{item:'cr_couronne'}],['masque','Cagoule de braqueur',{ach:'heist'}]],
  glasses:[['aucunes','Aucunes'],['rondes','Rondes'],['soleil','Soleil',{lv:2}],['coeur','Cœurs',{lv:4}],['aviateur','Aviateur doré',{lv:6}],['monocle','Monocle',{tier:2}]],
  top:[['tshirt','T-shirt'],['sweat','Sweat à capuche'],['survet','Survêt'],['debardeur','Débardeur'],['chemise','Chemise',{lv:2}],['costume','Costume',{lv:5}],['smoking','Smoking',{tier:3}]],
  bling:[['aucun','Aucun'],['boucle','Boucle d\'oreille',{lv:2}],['chaine','Chaîne en or',{tier:1}],['chaine_xl','Grosse chaîne',{tier:3}]]};
D.AVPN={shape:'Tête',hair:'Cheveux',eyes:'Yeux',brows:'Sourcils',mouth:'Bouche',beard:'Barbe',hat:'Chapeau',glasses:'Lunettes',top:'Haut',bling:'Bijoux'};
D.avLock=(part,id,ctx)=>{const e=(D.AVP[part]||[]).find(x=>x[0]===id);if(!e)return'Inconnu';const c=e[2];if(!c)return'';
  if(c.lv&&ctx.lvl<c.lv)return'Niv. '+c.lv;if(c.tier&&ctx.tier<c.tier)return'Carte '+D.TIERS[c.tier].name;if(c.item&&!(ctx.items||[]).includes(c.item))return'Objet rare';if(c.ach&&!(ctx.ach||[]).includes(c.ach))return'Succès';return''};
D.avRandom=seed=>{const r=D.seeded('av'+seed),p=a=>a[r()*a.length|0],free=k=>D.AVP[k].filter(x=>!x[2]).map(x=>x[0]);
  return{skin:r()*6|0,hairC:r()*6|0,topC:r()*10|0,bg:r()*8|0,shape:p(free('shape')),hair:p(free('hair')),eyes:p(['normal','grands','normal']),brows:'normaux',mouth:p(['sourire','sourire','neutre','rire']),
    beard:r()<.3?p(['barbe3j','moustache','bouc']):'aucune',hat:r()<.3?p(['casquette','bonnet','casquette_env']):'aucun',glasses:r()<.2?'rondes':'aucunes',top:p(['tshirt','sweat','survet']),bling:'aucun'}};
D.avClean=(v,old)=>{const o=Object.assign({},old||D.avRandom(1));v=v||{};
  ['skin','hairC','topC','bg'].forEach(k=>{if(v[k]!==undefined){const n=Math.floor(+v[k]);if(n>=0&&n<D.AVC[k].length)o[k]=n}});
  Object.keys(D.AVP).forEach(k=>{if(v[k]!==undefined&&D.AVP[k].some(x=>x[0]===v[k]))o[k]=v[k]});return o};

/* ---------- Nouveaux jeux V6 ---------- */
Object.assign(D.GN,{ballon:'au Ballon',lingots:'aux Lingots',pousse:'au Pousse-pièces',rps:'à Pierre-feuille-ciseaux',dt:'au Dragon Tigre',kebab:'au Kebab Royal',daron:'à la machine Le Daron',monaco:'au Braquage à Monaco',battle:'en caisses en duel',wshow:'à la Grande Roue',arc:'en petit boulot'});
Object.assign(D.GLV,{ballon:1,lingots:2,dt:3,wshow:2,kebab:3,daron:5,monaco:7,battle:4});
D.BALMODES=[{nm:'Prudent',p:.04},{nm:'Normal',p:.08},{nm:'Kamikaze',p:.15}];D.BALMAX=40;
D.balM=(k,m)=>k?+(.97*Math.pow(1/(1-m.p),k)).toFixed(2):1;
D.LGW=9;D.LGW0=3;D.LGMIN=3;D.LGTOP=10;D.LGMULT=[0,0,0,1,1.1,1.3,1.6,2,2.6,3.6,5.5];
D.lgSpeed=l=>7.5+l*1;
D.lgPos=(ms,w,l,ph)=>{const R=D.LGW-w;if(R<=0)return 0;const t=ms/1000*D.lgSpeed(l)+ph,f=t%(2*R);return Math.min(R,Math.floor(f<R?f:2*R-f+.0001))};
D.PPDIST=[[0,.496],[.5,.18],[1,.14],[2,.09],[3,.05],[5,.025],[10,.015],[30,.004]];
D.DTPAY={d:2,t:2,tie:9};
D.TSLOTS={kebab:{nm:'Kebab Royal',map:{'🍒':'🧅','🍋':'🍅','🍇':'🥬','🔔':'🌶️','⭐':'🍟','💎':'🥙','7':'👑','W':'🔥','💰':'💶'},c:'#e08a1e'},
  daron:{nm:'Le Daron',map:{'🍒':'📺','🍋':'🔧','🍇':'🧾','🔔':'📞','⭐':'🚗','💎':'💼','7':'👨','W':'🏆','💰':'💸'},c:'#2d6cdf'},
  monaco:{nm:'Braquage à Monaco',map:{'🍒':'🍾','🍋':'🕶️','🍇':'⌚','🔔':'🏎️','⭐':'🛥️','💎':'💎','7':'🎰','W':'🦹','💰':'💰'},c:'#c3343a'}};
D.TSJACK=500; // cinq symboles « 7 » sur une ligne : 500 fois la mise par ligne
D.WSEG=[];(function(){const base=[['1',20],['2',13],['5',7],['10',4],['coin',4],['hunt',2],['pach',2],['top',2]];const order=[];base.forEach(([k,n])=>{for(let i=0;i<n;i++)order.push(k)});
  // mélange déterministe pour que tout le monde voie la même roue
  const r=D.seeded('roue-fauche');for(let i=order.length-1;i>0;i--){const j=r()*(i+1)|0;[order[i],order[j]]=[order[j],order[i]]}D.WSEG.push(...order)})();
D.WPAY={'1':2.5,'2':4,'5':7,'10':13};D.WKEYS=['1','2','5','10','coin','hunt','pach'];
D.WCOL={'1':'#e3b558','2':'#2d6cdf','5':'#c3343a','10':'#7b3fc4',coin:'#1f8a5b',hunt:'#e08a1e',pach:'#ff5fb2',top:'#0e7c86'};
D.WNAME={'1':'1','2':'2','5':'5','10':'10',coin:'Pile ou Face',hunt:'Chasse au trésor',pach:'Pachinko',top:'Relance ×2'};
D.WCOIN=[3,4,5,6,8,10,12,15,20,30];D.WBIG=[5,8,10,12,15,20,25,30,40,80];
D.ARC={velo:{nm:'Livreur à vélo',ic:'🚲',pay:40,rate:1/1.4,dur:30,d:'Esquive les voitures, livre un max de commandes.'},plonge:{nm:'Plonge en rush',ic:'🍽️',pay:14,rate:2.6,dur:25,d:'Lave les assiettes avant qu\'elles s\'empilent.'}};
D.TICKETS.length=0;D.TICKETS.push({id:'f',nm:'Le Petit Fauché',pr:10,c:'#2d6cdf',th:'coin'},{id:'p',nm:'Petit Grattage',pr:50,c:'#1f8a5b',th:'clover'},{id:'k',nm:'Kebab Royal',pr:200,c:'#e08a1e',th:'kebab'},
  {id:'m',nm:'Millionnaire',pr:500,c:'#7b3fc4',th:'star'},{id:'x',nm:'Cash Monaco',pr:5000,c:'#e3b558',th:'crown'},{id:'n',nm:'Diamant Noir',pr:25000,c:'#16141a',th:'gem'});
D.ACH.push({id:'evade',ic:'🥄',nm:'La grande évasion',d:'S\'évader de prison',f:0},{id:'traitre',ic:'🐍',nm:'Serpent',d:'Trahir ses complices pendant un braquage entre potes',f:0,sh:1},{id:'roiweek',ic:'👑',nm:'Roi de la semaine',d:'Finir premier du classement de la semaine',f:0},{id:'fierte',ic:'🥹',nm:'Fierté du Daron',d:'Rendre ton père fier (enfin)',f:0},{id:'pick',ic:'🫳',nm:'Doigts de fée',d:'Réussir un pickpocket',f:0});
D.ROPAY={n:36,s:18,q:9,t:12,x:6,d:3,c:3,e:2};
})(typeof module!=='undefined'?(module.exports=require('./data5')):window.D);
