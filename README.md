# AVANCODE - Assistant Bot WhatsApp

Panneau de controle et bot complet pour gerer vos groupes WhatsApp.

## Fonctionnalites

- **Code AVANCODE avec duree de 3 minutes** : Le code de pairing est valide pendant 3 minutes
- **Envoi automatique par WhatsApp** : Le code AVANCODE est envoye directement par message WhatsApp
- **Affichage web en temps reel** : Le code est affiche dans le panneau web avec un compte a rebours
- **Copier en un clic** : Cliquez sur le code pour le copier automatiquement
- **Pas de regeneration intempestive** : Le code n'est demande qu'une seule fois par session
- **58 commandes** : Antilink, antitoxic, antibot, antidelete, antispam, kick, promote, demote, stickers, stats, welcome/goodbye, et plus

## Deploiement GRATUIT sur Render

### Etape 1 : Creer un compte GitHub
1. Allez sur https://github.com
2. Créez un compte gratuit

### Etape 2 : Creer un depot
1. Cliquez sur "New Repository"
2. Nommez-le "assistant-bot"
3. Uploadez tous les fichiers de ce dossier

### Etape 3 : Deployer sur Render
1. Allez sur https://render.com
2. Créez un compte gratuit (avec GitHub)
3. Cliquez sur "New" > "Web Service"
4. Connectez votre depot GitHub "assistant-bot"
5. Configuration :
   - Name: assistant-bot
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
6. Cliquez "Create Web Service"

### Etape 4 : Utiliser le bot
1. Ouvrez l'URL fournie par Render (ex: https://assistant-bot-xxxx.onrender.com)
2. Entrez votre numero WhatsApp
3. Cliquez "Deployer"
4. Le code AVANCODE sera envoye automatiquement par WhatsApp
5. Il sera aussi affiche dans le panneau web avec un compte a rebours de 3 minutes
6. Pour vous connecter : WhatsApp > Appareils connectes > Connecter avec numero > Collez le code

## Configuration

Editiez `config.json` pour personnaliser :
- `prefix` : Prefixe des commandes (defaut: ".")
- `botNumber` : Numero du bot (avec indicatif)
- `mode` : "public" ou "private"

## Commandes disponibles

| Categorie | Commandes |
|-----------|-----------|
| Protection | antilink, antibot, antispam, antitoxic, antidelete |
| Groupes | add, kick, promote, demote, lock, unlock, warn, admins, tag |
| Stats | chatstats, groupanalysts, mostactive, msgcount, wordcloud |
| Media | fb, ig, tiktok, yt, play |
| Fun | dare, truth, flip, kiss, hug, slap, joke, quote, ping |
| Config | prefix, setname, setdesc, setpp, autoread, autotype, set |
| Autres | welcome, goodbye, ephemeral, ginfo, linkgroup, menu, list, revoke |

## Auteur
AVANI_SOUDI - AVANI Tech
