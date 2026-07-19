# 🎉 AssistantBot V1.0.5 - Nouvelles Commandes Privées

## 📊 Résumé des modifications
- ✦ Tous les emojis devant les commandes ont été remplacés par `✦`
- 📜 L'emoji du menu reste `📜` (inchangé)
- 🆕 27 nouvelles commandes privées ajoutées
- **Total: 58 commandes disponibles**

---

## 🆕 Nouvelles Commandes Ajoutées

### 📥 **Téléchargeurs de Médias**
```
.vv         - Vue unique (répondre à une photo/vidéo)
.fb <url>   - Télécharger une vidéo Facebook
.ig <url>   - Télécharger du contenu Instagram
.tiktok <url> - Télécharger une vidéo TikTok
.yt <url>   - Télécharger une vidéo YouTube
.play <titre> - Télécharger de la musique
```

### 👥 **Commandes Sociales & Amusantes**
```
.hug        - Recevoir un câlin ❤️
.kiss       - Recevoir un bisou 💋
.slap       - Recevoir une claque 💥
.anonhidemsg <texte> - Message anonyme caché
.fakecall <nom> - Faux appel entrant
.nudes      - Blague amusante 😅
```

### 🎮 **Jeux & Amusements**
```
.tictac     - Jouer au tic-tac-toe
.truth      - Vérité du jeu "Vérité ou Défi"
.dare       - Défi du jeu "Vérité ou Défi"
.random [min] [max] - Nombre aléatoire
.flip       - Pile ou Face
.joke       - Blague aléatoire 😂
.quote      - Citation inspirante
```

### 🔞 **Contenu Adulte**
```
.nsfw       - Avertissement de contenu adulte
```

---

## 📝 Notes Importantes

### API Externes Requises
Certaines commandes nécessitent des APIs externes:
- **Facebook/Instagram/TikTok/YouTube**: Nécessite une API de téléchargement
- **Musique**: Utilise une API de streaming musical
- **Blagues**: Utilise JokeAPI (gratuit)
- **Citations**: Utilise Quotable.io (gratuit)

### Configuration Nécessaire
Remplacez `https://api.example.com` par vos vraies URLs d'API dans:
- `fb.js`
- `ig.js`
- `tiktok.js`
- `yt.js`
- `play.js`

### Exemple de Modification
```javascript
// Avant
const response = await axios.get(`https://api.example.com/facebook?url=...`);

// Après (avec votre API)
const response = await axios.get(`https://votreapi.com/facebook?url=...`);
```

---

## 🎯 Utilisation

```
.menu                    - Afficher toutes les commandes
.vv                      - Vue unique (répondre à un message)
.fb https://...          - Télécharger vidéo Facebook
.play Blinding Lights    - Télécharger musique
.truth                   - Question de vérité
.dare                    - Défi amusant
.random 1 100            - Nombre entre 1 et 100
```

---

## 📦 Fichiers Modifiés
- ✅ `cmd/menu.js` - Emojis remplacés par ✦
- ✅ `cmd/vv.js` - NOUVEAU
- ✅ `cmd/fb.js` - NOUVEAU
- ✅ `cmd/ig.js` - NOUVEAU
- ✅ `cmd/tiktok.js` - NOUVEAU
- ✅ `cmd/yt.js` - NOUVEAU
- ✅ `cmd/play.js` - NOUVEAU
- ✅ `cmd/hug.js` - NOUVEAU
- ✅ `cmd/kiss.js` - NOUVEAU
- ✅ `cmd/slap.js` - NOUVEAU
- ✅ `cmd/anonhidemsg.js` - NOUVEAU
- ✅ `cmd/fakecall.js` - NOUVEAU
- ✅ `cmd/nudes.js` - NOUVEAU
- ✅ `cmd/tictac.js` - NOUVEAU
- ✅ `cmd/truth.js` - NOUVEAU
- ✅ `cmd/dare.js` - NOUVEAU
- ✅ `cmd/random.js` - NOUVEAU
- ✅ `cmd/flip.js` - NOUVEAU
- ✅ `cmd/joke.js` - NOUVEAU
- ✅ `cmd/quote.js` - NOUVEAU
- ✅ `cmd/nsfw.js` - NOUVEAU

---

## 🚀 Prochaines Étapes

1. Téléchargez le nouveau ZIP
2. Remplacez votre ancienne version
3. Configurez les APIs externes
4. Redémarrez le bot
5. Testez avec `.menu`

---

**Bon divertissement avec votre bot amélioré!** 🎉
