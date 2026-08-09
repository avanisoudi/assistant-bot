const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            // Vérifier si c'est un groupe
            if (!from.endsWith('@g.us')) {
                return await sock.sendMessage(from, { text: '❌ Cette commande ne fonctionne que dans les groupes' });
            }

            // Charge la DB des groupes
            const dbPath = path.join(__dirname, '..', 'db', 'groups.json');
            let db = {};

            if (fs.existsSync(dbPath)) {
                try {
                    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                } catch (e) {
                    db = {};
                }
            }

            // Initialiser le groupe s'il n'existe pas
            if (!db[from]) {
                db[from] = {
                    antilink: false,
                    antibot: false,
                    antiflood: false,
                    antitoxic: false,
                    antidelete: false,
                    welcome: false,
                    goodbye: false,
                    autoread: false,
                    autotype: false,
                    antilock: false,
                    toxicWords: ['putain', 'merde', 'connard', 'fdp', 'ntm', 'salaud']
                };
            }

            // Pas d'argument = afficher l'état
            if (args.length === 0) {
                const status = db[from].antilock ? '✅ ACTIVÉ' : '❌ DÉSACTIVÉ';
                return await sock.sendMessage(from, {
                    text: `*🔒 Anti-Lock*\n\nÉtat: ${status}\n\n.antilock on - Activer\n.antilock off - Désactiver\n\n⚠️ Si activé, les gens ne pourront pas quitter le groupe`
                });
            }

            const action = args[0].toLowerCase();

            if (action === 'on') {
                db[from].antilock = true;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                await sock.sendMessage(from, {
                    text: '✅ *Anti-Lock ACTIVÉ*\n\n🔒 Les membres ne peuvent plus quitter le groupe!\n\nNote: Le bot rappellera automatiquement ceux qui tentent de partir.'
                });
            } else if (action === 'off') {
                db[from].antilock = false;
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                await sock.sendMessage(from, {
                    text: '❌ *Anti-Lock DÉSACTIVÉ*\n\nLes membres peuvent maintenant quitter librement'
                });
            } else {
                await sock.sendMessage(from, { text: '❌ Utilise: .antilock on ou .antilock off' });
            }
        } catch (error) {
            console.error('Erreur antilock:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de l\'exécution' });
        }
    }
};
