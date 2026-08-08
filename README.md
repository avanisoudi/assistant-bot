# AVANCODE - Assistant Bot WhatsApp

Panneau de contrôle pour déployer et gérer votre bot WhatsApp.

## Déploiement GRATUIT sur Render

### Étape 1 : Créer un compte GitHub
1. Allez sur https://github.com
2. Créez un compte gratuit

### Étape 2 : Créer un dépôt
1. Cliquez sur "New Repository"
2. Nommez-le "assistant-bot"
3. Uploadez tous les fichiers de ce dossier

### Étape 3 : Déployer sur Render
1. Allez sur https://render.com
2. Créez un compte gratuit (avec GitHub)
3. Cliquez sur "New" > "Web Service"
4. Connectez votre dépôt GitHub "assistant-bot"
5. Configuration :
   - Name: assistant-bot
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
6. Cliquez "Create Web Service"

### Étape 4 : Utiliser le bot
1. Ouvrez l'URL fournie par Render (ex: https://assistant-bot-xxxx.onrender.com)
2. Entrez votre numéro WhatsApp
3. Cliquez "Déployer"
4. Copiez le code AVANCODE affiché
5. Ouvrez WhatsApp > Appareils connectés > Connecter avec numéro > Collez le code

## Commandes disponibles
- start_bot : Démarrer le bot
- stop_bot : Arrêter le bot

## Auteur
AVANI_SOUDI - AVANI Tech
