# Fauché — casino social en ligne

**Un jeu imaginé et créé par Momo.**

Argent 100 % fictif. Réservé aux plus de 18 ans.

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

## Organisation du code

- `server/` : le serveur (comptes, argent, tous les jeux). Tous les tirages au sort se font ici, pour que personne ne puisse tricher.
- `public/` : le site affiché dans le navigateur.
- `public/data.js` et `public/data5.js` : les catalogues partagés (boutique, missions, succès, nouveaux jeux…).
- `test/sim.js` et `test/sim5.js` : simulations de joueurs (lance le serveur, puis `URL=http://localhost:3000 node test/sim.js`).

---
Fauché · créé par Momo.
