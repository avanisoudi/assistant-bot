const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');

const FOLDER = path.join(__dirname, '..', 'Fichiers');

// Commande volontairement cachée du .menu — réservée aux administrateurs du bot
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!(await isBotAdmin(sender, sock))) return;

            if (args[0]?.toLowerCase() !== 'all') {
                return await sock.sendMessage(from, { text: '🗑️ .supp all — supprime tous les fichiers du dossier Fichiers' });
            }

            if (!fs.existsSync(FOLDER)) return await sock.sendMessage(from, { text: '📁 Dossier déjà vide' });
            const files = fs.readdirSync(FOLDER).filter(f => f !== 'README.txt' && !f.startsWith('.'));

            let count = 0;
            for (const file of files) {
                const filePath = path.join(FOLDER, file);
                if (fs.statSync(filePath).isFile()) { fs.unlinkSync(filePath); count++; }
            }

            await sock.sendMessage(from, { text: `🗑️ ${count} fichier(s) supprimé(s) du dossier Fichiers` });
        } catch (error) {
            console.error('Erreur supp:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
