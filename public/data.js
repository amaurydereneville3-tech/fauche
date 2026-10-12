/* Données partagées entre le serveur et le navigateur */
(function(D){
D.TIERS=[{name:'Classic',min:-Infinity,next:100000},{name:'Gold',min:100000,next:1000000},{name:'Platinum',min:1000000,next:10000000},{name:'Black',min:10000000,next:100000000},{name:'Métal',min:100000000,next:null}];
D.SHOP=[
  {id:'trot',ic:'🛴',nm:'Trottinette',pr:300},{id:'seiko',ic:'⌚',nm:'Montre Seiko',pr:450},{id:'casque',ic:'🎧',nm:'Casque haut de gamme',pr:550},
  {id:'scoot',ic:'🛵',nm:'Scooter 125',pr:2500},{id:'clio',ic:'🚗',nm:'Clio 4',pr:12000},{id:'jetski',ic:'🌊',nm:'Jet-ski',pr:15000},
  {id:'rolex',ic:'💎',nm:'Montre de luxe',pr:25000,tier:1},{id:'studio',ic:'🏠',nm:'Studio à Vannes',pr:120000,tier:1,rent:450},{id:'911',ic:'🏎️',nm:'Porsche 911',pr:150000,tier:1},
  {id:'chauf',ic:'🤵',nm:'Chauffeur perso',pr:400000,tier:1},{id:'garde',ic:'🕶️',nm:'Garde du corps',pr:600000,tier:1},
  {id:'yacht',ic:'🛥️',nm:'Yacht',pr:2000000,tier:2},{id:'helico',ic:'🚁',nm:'Hélicoptère',pr:3500000,tier:2},{id:'imm',ic:'🏢',nm:'Immeuble',pr:8000000,tier:2,rent:28000},
  {id:'ecurie',ic:'🏁',nm:'Écurie de course',pr:25000000,tier:3},{id:'jet',ic:'✈️',nm:'Jet privé',pr:40000000,tier:3},{id:'villa',ic:'🏝️',nm:'Villa à Monaco',pr:90000000,tier:3,rent:250000},
  {id:'ile',ic:'🗺️',nm:'Île privée',pr:500000000,tier:4,rent:1200000}];
D.SPECIAL={sp_scoot:{ic:'🛵',nm:'Scooter de collection',pr:6000},sp_watch:{ic:'⏱️',nm:'Chrono de pilote unique',pr:300000},sp_car:{ic:'🚙',nm:'Supercar unique de 1987',pr:900000},
  sp_sea:{ic:'🚤',nm:'Canot en bois vintage',pr:1200000},sp_air:{ic:'🛩️',nm:'Avion de voltige',pr:2500000},sp_art:{ic:'🖼️',nm:'Tableau de maître',pr:15000000}};
D.itemInfo=id=>D.SHOP.find(x=>x.id===id)||D.SPECIAL[id];
D.BIZ=[{id:'kebab',ic:'🥙',nm:'Kebab du coin',pr:8000,inc:300},{id:'laverie',ic:'🧺',nm:'Laverie',pr:25000,inc:900},{id:'barber',ic:'💈',nm:'Barbershop',pr:60000,inc:2100},
  {id:'bar',ic:'🍸',nm:'Bar à cocktails',pr:150000,inc:5200},{id:'concess',ic:'🚘',nm:'Concession auto',pr:400000,inc:13000},{id:'boite',ic:'🪩',nm:'Boîte de nuit',pr:1500000,inc:48000},
  {id:'hotel',ic:'🏨',nm:'Hôtel 5 étoiles',pr:12000000,inc:360000},{id:'club',ic:'⚽',nm:'Club de foot',pr:80000000,inc:2200000}];
D.BOOSTS=[
  {id:'requin',ic:'🦈',nm:'Élixir du Requin',pr:2000,n:3,ef:'Tu vois la carte cachée du croupier pendant 3 mains de blackjack.',se:'Ton profil affiche « Suspect » pendant 10 minutes.'},
  {id:'parrain',ic:'🎩',nm:'Cigare du Parrain',pr:5000,n:3,ef:'+50 % sur tes 3 prochains gains au casino.',se:'À chaque gain, 20 % de risque d\'être fouillé par la sécurité : −5 % de ton cash.'},
  {id:'flambeur',ic:'🔥',nm:'Shot de Flambeur',pr:3000,n:3,ef:'Gains doublés sur tes 3 prochaines mises à la roulette.',se:'Un de tes jetons glisse sur un numéro au hasard à chaque fois.'},
  {id:'cafe',ic:'☕',nm:'Café Triple',pr:300,n:0,ef:'Petits boulots payés ×3 pendant 5 minutes.',se:'Tes mains tremblent : chrono des petits boulots raccourci de 3 secondes.'},
  {id:'xp',ic:'⚡',nm:'Boisson Énergie XP',pr:1500,n:0,ef:'XP doublée pendant 10 minutes.',se:'Tu parles trop vite : tes potes ne comprennent plus rien.'}];
D.ALBUMS=[{id:'garage',nm:'Le Garage',ic:'🚗',items:['trot','scoot','sp_scoot','clio','911','sp_car'],bonus:50000},
  {id:'montres',nm:'Les Montres',ic:'⌚',items:['seiko','rolex','sp_watch'],bonus:80000},{id:'mer',nm:'La Mer',ic:'🌊',items:['jetski','yacht','sp_sea'],bonus:500000},
  {id:'ciel',nm:'Le Ciel',ic:'☁️',items:['helico','jet','sp_air'],bonus:5000000},{id:'immo',nm:'L\'Immobilier',ic:'🏙️',items:['studio','imm','villa','ile'],bonus:20000000},
  {id:'art',nm:'La Galerie',ic:'🖼️',items:['casque','garde','chauf','sp_art'],bonus:3000000}];
D.FACES=[['🙂',1],['😎',2],['🤑',4],['🤠',6],['🥸',9],['😈',12],['🤖',15],['👽',20]];
D.ACCS=[['',1],['🧢',1],['🕶️',3],['🎩',6],['🎓',8],['💍',10],['👑',12]];
D.TITLES=[[1,'Fauché'],[3,'Petit joueur'],[5,'Flambeur'],[8,'Requin'],[12,'Baron'],[16,'Magnat'],[20,'Légende de Monaco']];
D.THEMES={monaco:{nm:'Monaco',lvl:1},pmu:{nm:'Le PMU',lvl:1},vegas:{nm:'Las Vegas',lvl:4},macao:{nm:'Macao',lvl:8}};
D.CARDCOL=[null,'linear-gradient(135deg,#0e7c86,#073c41)','linear-gradient(135deg,#c3343a,#4a1218)','linear-gradient(135deg,#7b3fc4,#2a1450)','linear-gradient(135deg,#ff5fb2,#6b1d4a)','linear-gradient(135deg,#1f8a5b,#0b3322)','linear-gradient(135deg,#f6dd96,#c99a3e)'];
D.MOTIFS=[['lisse','Lisse',1],['carbone','Carbone',3],['marbre','Marbre',5],['flammes','Flammes',7],['or','Feuille d\'or',10]];
D.WALLS=['#3b2f45','#2f4a45','#4a3a2a','#1f2a44','#4a2430'];
D.JOBS=[{id:'kebab',ic:'🥙',nm:'Livreur de kebab',pay:12},{id:'roses',ic:'🌹',nm:'Vendeur de roses',pay:9},{id:'pare',ic:'🧽',nm:'Laveur de pare-brise',pay:10},{id:'plonge',ic:'🍽️',nm:'Plongeur au resto',pay:11}];
D.SYM=[{s:'🍒',w:6,p3:5,p2:1},{s:'🍋',w:6,p3:8,p2:1},{s:'🔔',w:5,p3:12,p2:1},{s:'⭐',w:4,p3:20,p2:1},{s:'💎',w:2,p3:50,p2:3},{s:'7',w:1,p3:150,p2:5}];
D.PLM=[10,4,2,1.3,1.1,.9,.5,.9,1.1,1.3,2,4,10];
D.TICKETS=[{id:'p',nm:'Petit Grattage',pr:50,c:'#2d6cdf'},{id:'m',nm:'Millionnaire',pr:500,c:'#7b3fc4'},{id:'x',nm:'Cash Monaco',pr:5000,c:'#e3b558'}];
D.PZPRICE=[100,1000,10000];
D.LOTO_PRICE=20;D.LOTO_GAIN={2:30,3:300,4:5000,5:500000};
D.ASSETS=[{id:'BTC',nm:'Bitcoin',p:58000,v:.005,t:'Crypto'},{id:'ETH',nm:'Ethereum',p:2300,v:.0065,t:'Crypto'},{id:'SOL',nm:'Solana',p:140,v:.0085,t:'Crypto'},{id:'DOGE',nm:'Dogecoin',p:.12,v:.011,t:'Crypto'},
  {id:'AAPL',nm:'Apple',p:210,v:.002,t:'Action'},{id:'TSLA',nm:'Tesla',p:240,v:.0042,t:'Action'},{id:'MC',nm:'LVMH',p:620,v:.002,t:'Action'},{id:'AIR',nm:'Airbus',p:165,v:.002,t:'Action'}];
D.POKER=[{id:'p1',nm:'Table des fauchés',sb:5,bb:10,min:200,max:1000},{id:'p2',nm:'Table du Requin',sb:50,bb:100,min:2000,max:10000},{id:'p3',nm:'Salon Monaco',sb:1000,bb:2000,min:40000,max:200000}];
D.BJT=[{id:'b1',nm:'Table classique',min:10,max:5000},{id:'b2',nm:'Table VIP',min:1000,max:500000}];
D.RACES={f1:{nm:'Grand Prix',ic:'🏎️',cls:'',run:['Rouge Racing','Flèche d\'argent','Bleu Alpin','Orange Papaye','Vert Anglais','Taureau Rouge'],col:['#e10600','#c0c0c8','#2d6cdf','#ff8000','#1f8a5b','#1e3a8a'],
    ev:['{n} rate son freinage !','Arrêt au stand raté pour {n} !','{n} prend l\'aspiration et remonte !','Dépassement de folie de {n} !']},
  snail:{nm:'Course d\'escargots',ic:'🐌',cls:'snail',run:['Turbo','Baveux','Lent-Lent','Gégé','La Fusée','Mollusque'],col:['#e3b558','#5fd39a','#ff7a6b','#7b3fc4','#2d6cdf','#e08a1e'],
    ev:['{n} s\'est endormi en pleine course…','{n} mange une feuille de salade.','{n} rentre dans sa coquille !','{n} accélère comme jamais (2 cm/min) !']},
  pigeon:{nm:'Course de pigeons',ic:'🐦',cls:'pigeon',run:['Roucoulou','Plume','Biscotte','Le Boss','Fientos','Jean-Pigeon'],col:['#e3b558','#5fd39a','#ff7a6b','#7b3fc4','#2d6cdf','#e08a1e'],
    ev:['{n} se pose sur une statue !','{n} pique une frite à un touriste.','{n} fait demi-tour sans raison !','{n} profite d\'un coup de vent !']}};
D.MISSIONS=[
  {id:'bj3',t:'Gagne 3 mains de blackjack',type:'win',g:'bj',n:3,rw:800},{id:'ro5',t:'Mise sur 5 tours de roulette',type:'play',g:'ro',n:5,rw:500},
  {id:'crash5',t:'Encaisse à ×5 ou plus au Crash',type:'mult',g:'crash',n:5,rw:1500},{id:'mines2',t:'Encaisse à ×2 ou plus aux Mines',type:'mult',g:'mines',n:2,rw:900},
  {id:'pl10',t:'Lâche 10 billes au Plinko',type:'play',g:'plinko',n:10,rw:400},{id:'sl10',t:'Tire 10 fois le levier',type:'play',g:'sl',n:10,rw:400},
  {id:'sport1',t:'Gagne un pari sportif',type:'win',g:'sport',n:1,rw:700},{id:'race1',t:'Gagne une course',type:'win',g:'race',n:1,rw:700},
  {id:'profit5k',t:'Fais 5 000 € de bénéfice',type:'profit',n:5000,rw:1500},{id:'buy1',t:'Achète quelque chose (boutique, entreprise, enchère)',type:'buy',n:1,rw:300},
  {id:'hilo3',t:'Enchaîne 3 bonnes réponses à Plus haut plus bas',type:'mult',g:'hilo',n:3,rw:700},{id:'job1',t:'Fais un petit boulot',type:'play',g:'job',n:1,rw:300},
  {id:'gr3',t:'Gratte 3 tickets',type:'play',g:'gratte',n:3,rw:400},{id:'duel1',t:'Gagne un duel pile ou face',type:'win',g:'duel',n:1,rw:600},
  {id:'d421',t:'Gagne une partie de 421',type:'win',g:'d421',n:1,rw:600},{id:'pince1',t:'Tente 3 fois la machine à pince',type:'play',g:'pince',n:3,rw:500},
  {id:'poker3',t:'Joue 3 mains de poker',type:'play',g:'poker',n:3,rw:800},{id:'chat1',t:'Envoie un message dans le chat',type:'play',g:'chat',n:1,rw:150}];
D.ACH=[
  ['first','👶','Premier pas','Joue ta première partie',0],['win10','🔥','En feu','Gagne 10 parties',0],['win100','🏆','Machine de guerre','Gagne 100 parties',0],
  ['streak5','⚡','Intouchable','Gagne 5 fois d\'affilée',0],['gold','💳','Carte Gold','Atteins 100 000 € de patrimoine',0],['plat','💠','Platinum','Atteins 1 M€',0],
  ['black','🖤','Carte Black','Atteins 10 M€',0],['boss','🏪','Patron','Possède 3 entreprises',0],['col','📒','Collectionneur','Complète un album',0],
  ['auc','🔨','Adjugé !','Remporte une enchère',0],['loto','🎱','Gros lot','Trouve 4 bons numéros au loto',0],['job50','🥙','Roi du kebab','Fais 50 clics en un seul petit boulot',0],
  ['lvl10','🎖️','Vétéran','Atteins le niveau 10',0],['pkwin','♠️','Requin des tables','Gagne un pot de poker contre un vrai joueur',0],['social','💬','Grande gueule','Envoie 20 messages dans le chat',0],
  ['broke','🪦','Fauché pour de vrai','Fais faillite',1],['broke3','💀','Ruiné ×3','Fais faillite 3 fois',1],['loss1k','😬','Ça pique','Perds 1 000 € d\'un coup',1],
  ['loss1m','🫠','A perdu 1 M€ en 3 secondes','Perds 1 M€ d\'un coup',1],['cursed','🐈‍⬛','Maudit','Perds 5 parties d\'affilée',1],
  ['owe3','🙈','Le pote qui doit à tout le monde','Dois de l\'argent à 3 joueurs en même temps',1],['liq','💥','Liquidé','Te faire liquider en bourse',1],
  ['greedy','🚀','Trop gourmand','Exploser au Crash alors que la fusée a dépassé ×10',1],['hung','📵','A raccroché au nez de son daron','Raccroche quand ton père t\'appelle',1],
  ['seized','⚖️','Saisi','Un huissier a saisi un de tes biens',1]].map(([id,ic,nm,d,sh])=>({id,ic,nm,d,sh}));
D.FISC=[['Que veut dire TVA ?',['Taxe sur la valeur ajoutée','Taxe des voitures anciennes','Tarif variable de l\'argent'],0],
  ['Quel est le taux normal de TVA en France ?',['5,5 %','10 %','20 %'],2],['Un « découvert bancaire », c\'est…',['Un compte à découvrir','Un compte en négatif','Un compte secret'],1],
  ['Que signifie « CA » pour une entreprise ?',['Chiffre d\'affaires','Capital accumulé','Compte annuel'],0],['Marge = …',['Prix de vente − coût d\'achat','Prix d\'achat × 2','CA ÷ nombre de clients'],0],
  ['Le panier moyen, c\'est…',['CA ÷ nombre de clients','Le nombre de produits par rayon','Le prix d\'un caddie vide'],0],['Un taux d\'intérêt de 10 % sur 1 000 € coûte…',['10 €','100 €','1 000 €'],1],
  ['L\'impôt sur le revenu se déclare…',['Une fois par an','Chaque mois','Jamais si on est fauché'],0],['Combien de chiffres a un numéro SIRET ?',['9','14','20'],1],['Que veut dire « HT » ?',['Hors taxes','Haute tension','Hyper tendance'],0]];
D.GN={bj:'au blackjack',ro:'à la roulette',sl:'à la machine à sous',crash:'au Crash',mines:'aux Mines',plinko:'au Plinko',hilo:'à Plus haut plus bas',d421:'au 421',bonneteau:'au bonneteau',pince:'à la pince',gratte:'au grattage',duel:'en duel',sport:'aux paris sportifs',race:'aux courses',loto:'au loto',bourse:'en bourse',mo:'à Monte ou descend',auction:'aux enchères',poker:'au poker'};
D.levelOf=xp=>{let l=1,need=100;while(xp>=need){xp-=need;l++;need=100+l*40}return{l,cur:xp,need}};
D.title=l=>{let t='Fauché';D.TITLES.forEach(([n,x])=>{if(l>=n)t=x});return t};
D.crashM=ms=>Math.exp(.00013*ms);
})(typeof module!=='undefined'?module.exports:(window.D={}));
