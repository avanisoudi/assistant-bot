const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!(await isBotAdmin(sender, sock))) return await sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du bot' });

        if (args[0] !== 'confirm') {
            return await sock.sendMessage(from, { text: '⚠️ Ceci va vider tous les avertissements et notes de modération du bot.\n\nPour confirmer: .clearall confirm' });
        }

        const dbDir = path.join(__dirname, '..', 'db');
        let cleared = 0;
        for (const file of ['warns.json', 'modnotes.json']) {
            const p = path.join(dbDir, file);
            if (fs.existsSync(p)) { fs.writeFileSync(p, '{}'); cleared++; }
        }

        await sock.sendMessage(from, { text: `🗑️ Nettoyage terminé (${cleared} fichiers réinitialisés)` });
    }
};
