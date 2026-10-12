/* Catalogues V4/V5 partagés entre le serveur et le navigateur. Jeu créé par Momo. */
(function(D){
D.CREDIT='Momo';
D.GLV={chicken:1,pen:2,sicbo:3,mega:4,holdem:5,craps:6};
Object.assign(D.GN,{vp:'au vidéo poker',bac:'au baccarat',keno:'au keno',dice:'aux dés',limbo:'au Limbo',tower:'à la Tour',wheel:'à la Roue géante',gold:'à la Machine Dorée',tourney:'au tournoi',heist:'au braquage',crate:'aux caisses mystère',
  chicken:'à La Poule',pen:'aux tirs au but',sicbo:'au Sic Bo',mega:'au Bonanza Megaways',holdem:'au Casino Hold\'em',craps:'au Craps',street:'en course de rue',job:'en petit boulot'});
D.seeded=function(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}};
D.LUCKY=['crash','mines','plinko','bj','ro','sl','gold','vp','bac','keno','dice','limbo','tower','wheel','hilo','chicken','pen','mega'];
D.luckyGame=dk=>{const r=D.seeded('lucky'+dk);return D.LUCKY[r()*D.LUCKY.length|0]};
D.SIGNS=['♈ Bélier','♉ Taureau','♊ Gémeaux','♋ Cancer','♌ Lion','♍ Vierge','♎ Balance','♏ Scorpion','♐ Sagittaire','♑ Capricorne','♒ Verseau','♓ Poissons'];
D.HORO=['Mercure est en roue libre : évite de prêter de l\'argent ce soir.','Les astres te conseillent de tout miser… sur une salade.','Une personne proche va te demander 20 €. Fuis.','Jupiter dit oui. Ta banque dit non.','Journée parfaite pour flamber, d\'après personne.','Un inconnu va t\'appeler. C\'est ton daron avec un nouveau numéro.','Les étoiles s\'alignent comme trois 7. Ou trois citrons.','Un adversaire au poker bluffe. C\'est peut-être toi.'];

/* Objets exclusifs */
Object.assign(D.SPECIAL,{cr_canard:{ic:'🦆',nm:'Canard en or massif',pr:8000},cr_licorne:{ic:'🦄',nm:'Licorne de collection',pr:60000},cr_dragon:{ic:'🐉',nm:'Dragon de jade',pr:600000},cr_couronne:{ic:'👑',nm:'Couronne du roi des fauchés',pr:6000000},
  ps_trophy:{ic:'🏆',nm:'Trophée Saison 1',pr:50000},ps_statue:{ic:'🗿',nm:'Statue en or à ton effigie',pr:500000},ps_yacht:{ic:'🛳️',nm:'Méga-yacht doré',pr:50000000}});
D.ALBUMS.push({id:'caisses',nm:'Les Caisses',ic:'📦',items:['cr_canard','cr_licorne','cr_dragon','cr_couronne'],bonus:2000000});
D.FACES.push(['🦊',99],['🦁',99],['🐲',99],['🧛',99],['🤴',99],['😺',99]);

/* Caisses mystère */
D.RAR={c:['Commun','#8d8d99'],r:['Rare','#2d6cdf'],e:['Épique','#a35cf0'],l:['Légendaire','#e3b558']};
D.CRATES=[
  {id:'b',nm:'Caisse Bronze',pr:1000,col:'#a0673a',loot:[['cash',250,'c',30],['cash',500,'c',25],['item','seiko','c',12],['cash',1200,'r',10],['item','casque','r',8],['cash',2500,'e',6],['item','cr_canard','e',1.5],['cash',10000,'l',1],['item','cr_licorne','l',.1]]},
  {id:'a',nm:'Caisse Argent',pr:10000,col:'#9aa3b5',loot:[['cash',2500,'c',30],['cash',4000,'c',25],['item','clio','c',12],['cash',12000,'r',10],['item','jetski','r',8],['cash',25000,'e',6],['item','cr_licorne','e',1],['cash',100000,'l',1],['item','cr_dragon','l',.06]]},
  {id:'o',nm:'Caisse Or',pr:100000,col:'#e3b558',loot:[['cash',25000,'c',30],['cash',50000,'c',25],['item','rolex','c',12],['cash',120000,'r',10],['item','911','r',8],['cash',250000,'e',6],['item','cr_dragon','e',2],['cash',1000000,'l',1],['item','cr_couronne','l',.12]]}];

/* Animaux */
D.PETS=[{id:'cat',ic:'🐈‍⬛',nm:'Minuit',sp:'Chat noir',pr:5000,bonus:'+5 % sur tous tes gains au casino'},{id:'dog',ic:'🐶',nm:'Rocky',sp:'Chien fidèle',pr:3000,bonus:'Petits boulots payés ×1,5'},
  {id:'parrot',ic:'🦜',nm:'Coco',sp:'Perroquet',pr:4000,bonus:'+20 % d\'XP sur tout'},{id:'pig',ic:'🐷',nm:'Gros Billet',sp:'Cochon tirelire',pr:6000,bonus:'Met de côté 3 % de chaque gain, à casser quand tu veux'}];
D.FOOD_PR=150;D.PET_DAY=864e5;
D.petOn=(d,k,now=Date.now())=>!!(d.pet&&d.pet.id===k&&now-d.pet.fedAt<D.PET_DAY);

/* Pass de saison */
D.PASS_XP=250;
D.PASS=[[500,'cash'],[3,'requin'],[1000,'cash'],['b','crate'],['🦊','face','Renard du casino'],[2500,'cash'],['a','crate'],[5000,'cash'],[3,'parrain'],['🦁','face','Roi de la jungle','ps_trophy'],
  [10000,'cash'],[30,'xpboost'],['a','crate'],[20000,'cash'],['🐲','face','Dragon des tables'],[30000,'cash'],['o','crate'],[50000,'cash'],[3,'flambeur'],['🧛','face','Vampire des machines','ps_statue'],
  [75000,'cash'],['o','crate'],[100000,'cash'],[150000,'cash'],['🤴','face','Prince du flambe'],[250000,'cash'],['o','crate'],[500000,'cash'],[1000000,'cash'],['😺','face','Légende de la Saison 1','ps_yacht']];

/* Missions et succès supplémentaires */
D.MISSIONS.push({id:'vp1',t:'Fais une paire de valets ou mieux au vidéo poker',type:'win',g:'vp',n:1,rw:500},{id:'keno1',t:'Gagne une partie de Keno',type:'win',g:'keno',n:1,rw:500},
  {id:'tower4',t:'Monte au 4e étage de la Tour',type:'mult',g:'tower',n:4,rw:900},{id:'gold10',t:'Fais 10 tours à la Machine Dorée',type:'play',g:'gold',n:10,rw:600},
  {id:'bac3',t:'Joue 3 coups de baccarat',type:'play',g:'bac',n:3,rw:400},{id:'crate1',t:'Ouvre une caisse mystère',type:'play',g:'crate',n:1,rw:400},
  {id:'limbo10',t:'Gagne au Limbo avec une cible ×10 ou plus',type:'mult',g:'limbo',n:10,rw:1200},{id:'wheel1',t:'Gagne à la Roue géante',type:'win',g:'wheel',n:1,rw:500},
  {id:'heist1',t:'Tente un braquage',type:'play',g:'heist',n:1,rw:600},{id:'tour1',t:'Participe à un tournoi éclair',type:'play',g:'tourney',n:1,rw:500},
  {id:'chick5',t:'Traverse 5 voies à La Poule',type:'mult',g:'chicken',n:5,rw:800},{id:'pen3',t:'Marque 3 buts d\'affilée aux tirs au but',type:'mult',g:'pen',n:3,rw:800},{id:'mega5',t:'Fais 5 tours de Bonanza Megaways',type:'play',g:'mega',n:5,rw:500});
D.WMIS=[{id:'w_win30',t:'Gagne 30 parties',type:'win',n:30,rw:15000},{id:'w_prof',t:'Fais 100 000 € de bénéfice',type:'profit',n:100000,rw:30000},{id:'w_crate5',t:'Ouvre 5 caisses mystère',type:'play',g:'crate',n:5,rw:12000},
  {id:'w_heist2',t:'Réussis 2 braquages',type:'win',g:'heist',n:2,rw:25000},{id:'w_slots',t:'Fais 60 tours de machines à sous',type:'play',gs:['sl','gold','mega'],n:60,rw:15000},{id:'w_crash10',t:'Encaisse à ×10 au Crash',type:'mult',g:'crash',n:10,rw:20000},
  {id:'w_hold5',t:'Gagne 5 mains de Casino Hold\'em',type:'win',g:'holdem',n:5,rw:15000},{id:'w_div',t:'Joue à 12 jeux différents',type:'div',n:12,rw:20000},{id:'w_play150',t:'Joue 150 parties',type:'play',n:150,rw:15000},{id:'w_poker',t:'Joue 20 mains de poker',type:'play',g:'poker',n:20,rw:20000}];
D.ACH.push(...[['royal','👑','Quinte flush royale','Fais une quinte flush royale au vidéo poker',0],['heist','💼','Le casse du siècle','Réussis un braquage',0],['champ','🏆','Champion','Gagne un tournoi éclair',0],
  ['pet','🐾','Meilleur ami','Adopte un animal',0],['crate1','📦','Déballage','Ouvre ta première caisse mystère',0],['streak7','🔥','Fidèle au poste','Ouvre le coffre 7 jours de suite',0],['jackpot','🎰','JACKPOT','Décroche le jackpot commun de la Machine Dorée',0],
  ['jail','🚔','Menottes','Te faire arrêter pendant un braquage',1],['crate10','🫣','Accro aux caisses','Ouvre 10 caisses mystère',1],['ex','💔','Le resto de la honte','Payer le resto à ton ex',1]].map(([id,ic,nm,d,sh])=>({id,ic,nm,d,sh})));

/* Vidéo poker */
D.VPT=[['Quinte flush royale',800],['Quinte flush',50],['Carré',25],['Full',9],['Couleur',6],['Suite',4],['Brelan',3],['Double paire',2],['Paire de valets ou mieux',1]];
const rv=c=>({A:14,K:13,Q:12,J:11}[c.r]||+c.r);
D.vpEval=h=>{const v=h.map(rv).sort((a,b)=>a-b),fl=h.every(c=>c.s===h[0].s),st=new Set(v).size===5&&(v[4]-v[0]===4||v.join()==='2,3,4,5,14');const cnt={};v.forEach(x=>cnt[x]=(cnt[x]||0)+1);const g=Object.values(cnt).sort((a,b)=>b-a);
  if(st&&fl)return v[0]===10?0:1;if(g[0]===4)return 2;if(g[0]===3&&g[1]===2)return 3;if(fl)return 4;if(st)return 5;if(g[0]===3)return 6;if(g[0]===2&&g[1]===2)return 7;if(g[0]===2&&+Object.keys(cnt).find(k=>cnt[k]===2)>=11)return 8;return -1};
/* Baccarat */
D.bv=c=>c.r==='A'?1:['10','J','Q','K'].includes(c.r)?0:+c.r;D.bTot=h=>h.reduce((a,c)=>a+D.bv(c),0)%10;
/* Keno */
D.KN=40;D.KD=10;
function comb(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r}
D.KPAY={};for(let k=1;k<=10;k++){const hmin=Math.max(1,Math.ceil(k/2)),P=h=>comb(k,h)*comb(D.KN-k,D.KD-h)/comb(D.KN,D.KD);let ws=0;for(let h=hmin;h<=k;h++)ws+=Math.pow(2,h-hmin);
  D.KPAY[k]={};for(let h=hmin;h<=k;h++){let m=.94*Math.pow(2,h-hmin)/ws/P(h);m=m>=100?Math.round(m/10)*10:m>=10?Math.round(m):Math.round(m*10)/10;D.KPAY[k][h]=Math.min(10000,m)}}
/* Tour, Poule, Tirs au but */
D.TMODES=[{k:'easy',nm:'Facile',n:4,b:1},{k:'mid',nm:'Moyen',n:3,b:1},{k:'hard',nm:'Difficile',n:2,b:1},{k:'xtr',nm:'Extrême',n:3,b:2}];D.FLOORS=8;
D.twM=(f,m)=>.98*Math.pow(m.n/(m.n-m.b),f);
D.CHMODES=[{nm:'Facile',p:.08},{nm:'Moyen',p:.16},{nm:'Difficile',p:.28},{nm:'Hardcore',p:.45}];D.LANES=10;D.chM=(k,m)=>.97/Math.pow(1-m.p,k);
D.PKMODES=[{nm:'Gardien nul',k:1},{nm:'Gardien normal',k:2},{nm:'Gardien en feu',k:3}];D.PMAX=5;D.peM=(g,m)=>.97*Math.pow(1/(1-m.k/5),g);
/* Roue géante */
D.WTYPES=[{k:'1',n:24,pay:1,c:'#e3b558',t:'#2a1d05'},{k:'2',n:15,pay:2,c:'#2d6cdf',t:'#fff'},{k:'5',n:7,pay:5,c:'#c3343a',t:'#fff'},{k:'10',n:4,pay:10,c:'#1f8a5b',t:'#fff'},{k:'20',n:2,pay:20,c:'#7b3fc4',t:'#fff'},{k:'★',n:1,pay:40,c:'#ff5fb2',t:'#fff'},{k:'💰',n:1,pay:40,c:'#141114',t:'#fff'}];
D.WSEGS=(()=>{const out=[],acc=D.WTYPES.map(()=>0);for(let i=0;i<54;i++){D.WTYPES.forEach((t,j)=>acc[j]+=t.n/54);const j=acc.indexOf(Math.max(...acc));acc[j]-=1;out.push(j)}return out})();
/* Machine Dorée */
D.GSYM=[{s:'🍒',w:12,p:[5,14,45]},{s:'🍋',w:12,p:[5,14,45]},{s:'🍇',w:10,p:[7,20,65]},{s:'🔔',w:8,p:[9,28,100]},{s:'⭐',w:6,p:[13,45,160]},{s:'💎',w:4,p:[22,90,320]},{s:'7',w:2,p:[45,220,0]},{s:'W',w:3},{s:'💰',w:2.4}];
D.GLINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,2,1]];D.GFS={3:8,4:12,5:20};
D.gEval=(grid,lb)=>{let total=0,jack=false;const hits=new Set();D.GLINES.forEach(L=>{const cells=L.map((r,c)=>grid[c][r]);let base=null,n=0;for(const s of cells){if(s==='💰')break;if(s==='W'){n++;continue}if(base===null){base=s;n++;continue}if(s===base)n++;else break}
  if(base===null)base='💎';if(n>=3){const G=D.GSYM.find(x=>x.s===base);if(base==='7'&&n===5)jack=true;else total+=lb*G.p[n-3];for(let c=0;c<n;c++)hits.add(c+'-'+L[c])}});
  const sc=grid.flat().filter(s=>s==='💰').length;if(sc>=3)grid.forEach((col,c)=>col.forEach((s,r)=>{if(s==='💰')hits.add(c+'-'+r)}));return{total,jack,sc,hits:[...hits]}};
/* Megaways */
D.MSYM=[{s:'🍒',w:8,p:[.1,.25,.5,1]},{s:'🍋',w:8,p:[.1,.25,.5,1]},{s:'🍊',w:7,p:[.15,.3,.6,1.2]},{s:'🍇',w:7,p:[.15,.3,.6,1.2]},{s:'🍉',w:5,p:[.2,.4,.8,1.5]},{s:'🔔',w:4,p:[.3,.6,1.2,2.5]},{s:'💎',w:3,p:[.5,1,2,4]},{s:'👑',w:2,p:[1,2,5,10]},{s:'🎁',w:1.1}];
D.MMULT=[1,2,3,5,8,12,20];D.MGK=.075;
D.mEval=(g,bet)=>{let win=0;const hit=g.map(c=>c.map(()=>false));for(const M of D.MSYM){if(!M.p)continue;let ways=1,len=0;for(let r=0;r<6;r++){const c=g[r].filter(x=>x===M.s).length;if(!c)break;ways*=c;len++}
  if(len>=3){win+=bet*M.p[len-3]*ways*D.MGK;for(let r=0;r<len;r++)g[r].forEach((x,i)=>{if(x===M.s)hit[r][i]=true})}}return{win,hit}};
/* Sic Bo */
D.SBT={4:60,5:30,6:17,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:17,16:30,17:60};
D.sbPay=(k,d)=>{const s=d[0]+d[1]+d[2],tr=d[0]===d[1]&&d[1]===d[2];if(k==='small')return!tr&&s>=4&&s<=10?2:0;if(k==='big')return!tr&&s>=11&&s<=17?2:0;if(k==='triple')return tr?31:0;
  if(/^n[1-6]$/.test(k)){const c=d.filter(x=>x===+k[1]).length;return c?1+c:0}if(/^t\d+$/.test(k))return +k.slice(1)===s?D.SBT[s]+1:0;return 0};
D.SBKEYS=['small','big','triple',...[1,2,3,4,5,6].map(n=>'n'+n),...Object.keys(D.SBT).map(t=>'t'+t)];
/* Casino Hold'em */
D.HCAT=['Carte haute','Paire','Double paire','Brelan','Suite','Couleur','Full','Carré','Quinte flush','Quinte flush royale'];
D.ev5=h=>{const v=h.map(rv).sort((a,b)=>b-a),fl=h.every(c=>c.s===h[0].s);let st=0;if(new Set(v).size===5){if(v[0]-v[4]===4)st=v[0];else if(v.join()==='14,5,4,3,2')st=5}
  const cnt={};v.forEach(x=>cnt[x]=(cnt[x]||0)+1);const g=Object.entries(cnt).map(([r,n])=>[n,+r]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]),k=g.map(x=>x[1]);
  if(st&&fl)return[st===14?9:8,st];if(g[0][0]===4)return[7,...k];if(g[0][0]===3&&g[1][0]===2)return[6,...k];if(fl)return[5,...v];if(st)return[4,st];if(g[0][0]===3)return[3,...k];if(g[0][0]===2&&g[1][0]===2)return[2,...k];if(g[0][0]===2)return[1,...k];return[0,...v]};
D.hcmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0};
D.best7=cs=>{let b=null;const go=(s,p)=>{if(p.length===5){const e=D.ev5(p);if(!b||D.hcmp(e,b)>0)b=e;return}for(let i=s;i<cs.length;i++)go(i+1,[...p,cs[i]])};go(0,[]);return b};
D.AA={9:100,8:20,7:10,6:3,5:2};
/* Tournoi, braquage, garage */
D.TOUR={fee:500,spins:20,prizes:[4000,1500,700]};
D.HEISTS=[{id:'sup',nm:'La supérette du coin',ic:'🏪',loot:[2000,6000],cost:300,zone:30,speed:1.2},{id:'bijou',nm:'La bijouterie',ic:'💍',loot:[15000,45000],cost:2500,zone:22,speed:1.7},
  {id:'banque',nm:'La banque centrale',ic:'🏦',loot:[120000,350000],cost:20000,zone:15,speed:2.2},{id:'monaco',nm:'Le casino de Monaco',ic:'🎰',loot:[900000,2500000],cost:150000,zone:10,speed:2.9}];
D.CREW=[['🧔','Le Chauffeur'],['👩‍💻','La Hackeuse'],['🕵️','Le Guetteur']];
D.needle=(ms,speed,ph)=>50+50*Math.sin(ms/1000*speed*2.2+ph);
D.CARS={trot:2,scoot:4,clio:6,'911':9,sp_car:10,ecurie:12};
D.BOTCARS=[['🛺','Tuk-tuk de Gégé',2],['🚐','Van de Mathis',4],['🚗','Golf GTI de Hugo',6],['🏎️','Ferrari de Léa',9],['🚀','Fusée de Yanis',11]];
/* Entreprises */
D.bizInc=(b,lv)=>Math.round(b.inc*(1+.6*((lv||1)-1)));D.bizUpCost=(b,lv)=>Math.round(b.pr*.5*(lv||1));
})(typeof module!=='undefined'?(module.exports=require('./data')):window.D);
