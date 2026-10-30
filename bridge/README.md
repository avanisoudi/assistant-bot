# Pont panneau ↔ bot (groupes WhatsApp)

Le panneau n'invente aucun groupe : il lit `bot/data/groups.json`, un fichier écrit par ce
pont. Sans pont installé, l'onglet **Groupes** affiche l'état réel (aucun groupe lu) et
propose le bouton **Installer le pont**.

## Installation

1. Onglet **Groupes** → **Installer le pont dans bot/**.
   Le panneau copie `bridge/panel-bridge.js` vers `bot/panel-bridge.js`.
2. Dans `bot/index.js`, quand la connexion WhatsApp s'ouvre, ajoute une ligne :

```js
if (update.connection === 'open') {
  require('./panel-bridge').attachPanelBridge(sock)
}
```

Avec Baileys, `sock` est l'instance renvoyée par `makeWASocket`. La ligne peut aussi être
placée juste après la création du socket si tu préfères.

3. Redémarre le bot. Les groupes réels apparaissent dans l'onglet Groupes.

## Ce que fait le pont

| Écriture | Lecture |
| --- | --- |
| `bot/data/groups.json` — groupes réels (`groupFetchAllParticipating`), rôle du bot, code d'invitation (admins seulement), photo | panneau → `GET /api/groups` |
| exécution de `bot/data/panel-commands/<id>.json` puis résultat `<id>.result.json` | panneau → `POST /api/groups/command` + `GET /api/groups/command/:id` |
| republication toutes les 15 s, à la reconnexion, et sur `bot/data/groups-refresh.request` | bouton **Actualiser** |

Commandes acceptées : `refresh`, `create`, `rename`, `describe`, `invite`, `leave`,
`add`, `remove`, `promote`, `demote`.

## Réglages (variables d'environnement du bot)

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `PANEL_DATA_DIR` | `bot/data` | dossier des fichiers échangés |
| `PANEL_PUBLISH_MS` | `15000` | fréquence de republication |
| `PANEL_COMMAND_MS` | `2000` | fréquence de lecture des commandes |
| `PANEL_REFRESH_MS` | `3000` | fréquence de veille du fichier de rafraîchissement |
| `PANEL_BRIDGE_LOG` | `1` | `0` pour couper la ligne de log |

## Comportement en cas de panne

- WhatsApp ne répond pas : `groups.json` conserve les derniers groupes connus et porte un
  champ `error` que le panneau affiche tel quel (aucune donnée inventée).
- Aucune réponse en 45 s : le panneau annonce « Le bot ne répond pas (pont non installé ?) ».
- Un membre non admin ne reçoit pas de code d'invitation (limite WhatsApp) : le panneau
  affiche « Lien indisponible : WhatsApp le réserve aux admins du groupe ».
