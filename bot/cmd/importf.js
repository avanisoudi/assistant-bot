const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');

const FOLDER = path.join(__dirname, '..', 'Fichiers');

// Commande volontairement cachée du .menu — réservée aux administrateurs du bot
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!(await isBotAdmin(sender, sock))) return; // silencieux : ne révèle même pas que la commande existe

            if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER, { recursive: true });
            const files = fs.readdirSync(FOLDER).filter(f => f !== 'README.txt' && !f.startsWith('.'));

            if (files.length === 0) {
                return await sock.sendMessage(from, { text: '📁 Le dossier "Fichiers" est vide.' });
            }

            for (const file of files) {
                const filePath = path.join(FOLDER, file);
                if (!fs.statSync(filePath).isFile()) continue;
                try {
                    await sock.sendMessage(from, { document: fs.readFileSync(filePath), fileName: file, mimetype: 'application/octet-stream' });
                } catch (e) { console.error(`Erreur envoi ${file}:`, e); }
            }
        } catch (error) {
            console.error('Erreur importf:', error);
        }
    }
};
