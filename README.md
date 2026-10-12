# Fauché — casino social en ligne

**Un jeu imaginé et créé par Momo.**

Argent 100 % fictif. Réservé aux plus de 18 ans.

## Nouveautés de la V6

- **Interface « casino doré »** redessinée, icônes dessinées, animations (pièces qui volent vers le solde, BIG WIN, roues…), icône d'appli pour l'écran d'accueil.
- **Navigation simplifiée** : Accueil, Casino, Ma vie, Social, Moi.
- **Avatars dessinés** personnalisables (tête, cheveux, yeux, barbe, chapeau, lunettes, tenue, bijoux) et **fiche profil** des autres joueurs (fortune, vitrine, faillites, succès).
- **Mon compte** : changer de pseudo (1 fois par mois), de mot de passe, bio, signaler un bug, supprimer son compte, **notifications sur le téléphone**.
- **Panneau admin** réservé au créateur (compte `monorime`) : stats, donner/retirer de l'argent, pluie d'argent pour tous, happy hour, jackpot, drop, message à tout le casino, renommer, remettre à zéro, bannir, lire les bugs.
- **10 nouveaux jeux** : Grande Roue en direct, Le Ballon, Empile les lingots, Pousse-pièces, Dragon Tigre, Kebab Royal, Le Daron, Braquage à Monaco, Caisses en duel, Pierre-feuille-ciseaux (contre le videur ou un pote).
- **Roulette** : mises à cheval, carrés, transversales, sixains, roulette éclair, tapis vertical sur téléphone et horizontal sur ordi. **Tirs au but** avec un vrai gardien. **Tickets à gratter** à thème.
- **Social** : classement de la semaine (récompenses chaque lundi), happy hour à 21 h, drops dans le chat, pickpocket, primes, sabotage d'entreprise, coup de rush, le Croupier qui clashe les gros perdants.
- **Histoires** : le Daron, Kevin, Gérard l'huissier, l'ex, avec des choix et des conséquences.
- **Braquages 2.0** : crochetage, piratage des caméras, code du coffre, fuite, prison (corruption ou évasion) et **braquages entre potes** avec trahison possible.

## Ce qu'il y a dedans

- **29 jeux** : poker et blackjack à plusieurs, roulette et Crash en direct, duel, machine à sous, Machine Dorée (jackpot commun à tous les joueurs), Megaways, vidéo poker, baccarat, keno, dés, limbo, la Tour, roue géante, tournoi éclair (classement du jour entre joueurs), braquages, La Poule, tirs au but, Sic Bo, Casino Hold'em, Craps, mines, plinko, plus haut plus bas, 421, tickets à gratter, bonneteau, machine à pince.
- Certains jeux se débloquent en montant de niveau (vérifié par le serveur).
- **Accueil** : bilan du jour, jeu chanceux du jour (+10 %), défis, raccourcis.
- **Pass de saison** (30 paliers), missions du jour et de la semaine, titres à choisir.
- **Caisses mystère**, animal porte-bonheur, entreprises améliorables, ta ville et les courses de rue.
- **Événements surprises** : pluie de billets, ton ex, influenceur, contrôle de police, défis du Croupier.
- **Le Croupier** annonce les gros gains et les braquages ratés dans le chat de tout le casino.
- BIG WIN / MEGA WIN / EPIC WIN, mode auto (s'arrête si tu perds la moitié de ta cagnotte), historique de tes parties, musique d'ambiance, tutoriel.

## Lancer sur ton Mac (pour tester)

1. Installe Node.js (version 18 ou plus) depuis https://nodejs.org
2. Ouvre le Terminal dans ce dossier, puis tape :
   ```
   npm install
   npm start
   ```
3. Ouvre http://localhost:3000 dans ton navigateur.

Sans base de données configurée, les comptes sont enregistrés dans le fichier `data.json`.

## Mettre en ligne gratuitement (Render + Neon)

1. **Neon** (base de données) : crée un compte sur https://neon.com, crée un projet, copie la « connection string » (elle commence par `postgresql://`).
2. **GitHub** : crée un dépôt et envoie tous les fichiers de ce dossier (sauf `node_modules`).
3. **Render** (serveur) : sur https://render.com, « New » → « Blueprint », choisis ton dépôt GitHub. Render lit le fichier `render.yaml`.
4. Quand Render demande `DATABASE_URL`, colle la connection string de Neon.
5. Attends la fin du déploiement, puis ouvre l'adresse en `.onrender.com` que Render te donne. C'est ton site.

Le serveur gratuit s'endort après 15 minutes sans joueur : le premier joueur attend environ une minute au réveil.

## Mettre à jour sans perdre les comptes

1. **Sauvegarde** : sur Neon, ouvre ton projet, clique sur « Create child branch » et nomme-la par exemple `sauvegarde-v5`. C'est une copie complète de la base, à garder au cas où.
2. Sur GitHub, « Add file » › « Upload files », glisse **le contenu** du dossier (pas le dossier lui-même), puis « Commit changes ».
3. Render redéploie tout seul. Les comptes, l'argent et les objets restent dans Neon.

Le compte administrateur est `monorime` par défaut. Pour en choisir un autre, ajoute la variable `ADMIN_PSEUDO` dans les réglages Render (Environment).

## Organisation du code

- `server/` : le serveur (comptes, argent, tous les jeux). Tous les tirages au sort se font ici, pour que personne ne puisse tricher.
- `public/` : le site affiché dans le navigateur.
- `public/data.js` et `public/data5.js` : les catalogues partagés (boutique, missions, succès, nouveaux jeux…).
- `test/sim.js`, `test/sim5.js`, `test/sim6.js` et `test/sim6b.js` : simulations de joueurs (lance le serveur, puis `URL=http://localhost:3000 node test/sim.js`).

---
Fauché · créé par Momo.
