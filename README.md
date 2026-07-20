# AVANCODE - Assistant Bot WhatsApp

Application web complete pour deployer et gerer un bot WhatsApp avec 58 commandes.

## Architecture

- **Frontend** : React 19 + Tailwind CSS 4 + tRPC (landing page + dashboard)
- **Backend** : Express + Baileys (bot WhatsApp)
- **Base de donnees** : MySQL via Drizzle ORM

## Structure

```
client/          -> Landing page + Dashboard (React)
server/          -> API tRPC + Bot Manager (Baileys)
bot-commands/    -> 58 commandes du bot (cmd/ + lib/)
drizzle/         -> Schema et migrations BDD
```

## Fonctionnalites

- Landing page professionnelle avec dark theme et couleur WhatsApp #25D366
- Systeme d'authentification securise
- Dashboard avec pairing code AVANCODE (3 min)
- Envoi automatique du code par WhatsApp
- Console de logs temps reel
- 58 commandes : antilink, antitoxic, antiflood, autoread, autotype, welcome/goodbye, antidelete, stickers, stats, etc.

## Deploiement

### Option 1 : Deployer sur Render (recommande)

1. Fork ce depot GitHub
2. Allez sur https://render.com
3. Créez un compte gratuit (avec GitHub)
4. Cliquez "New" > "Web Service"
5. Connectez votre fork
6. Configuration :
   - Name: avancode
   - Runtime: Node
   - Node Version: 18+
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
7. Cliquez "Create Web Service"

### Option 2 : Lancer localement

```bash
pnpm install
pnpm dev       # Developpement
pnpm build     # Build production
pnpm start     # Demarrer en production
pnpm test      # Tests Vitest
```

## Commands disponibles

| Categorie | Commandes |
|-----------|-----------|
| Protection | antilink, antibot, antispam, antitoxic, antidelete |
| Groupes | add, kick, promote, demote, lock, unlock, warn, admins, tag |
| Stats | chatstats, groupanalysts, mostactive, msgcount, wordcloud |
| Media | fb, ig, tiktok, yt, play |
| Fun | dare, truth, flip, kiss, hug, slap, joke, quote, ping |
| Config | prefix, setname, setdesc, setpp, autoread, autotype, set |
| Autres | welcome, goodbye, ephemeral, ginfo, linkgroup, menu, list, revoke |

## Configuration

Editez `config.json` pour personnaliser :
- `prefix` : Prefixe des commandes (defaut: ".")
- `botNumber` : Numero du bot (avec indicatif)
- `mode` : "public" ou "private"

## Auteur

2026 AVANI_SOUDI - AVANI Tech
