const fs = require('fs');
const path = require('path');

const FOLDER = path.join(__dirname, '..', 'Fichiers');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER, { recursive: true });

            const files = fs.readdirSync(FOLDER).filter(f => f !== 'README.txt' && !f.startsWith('.'));

            if (files.length === 0) {
                return await sock.sendMessage(from, {
                    text: '📁 Le dossier "Fichiers" est vide.\n\nDépose des fichiers dedans (sur le serveur) pour qu\'ils soient envoyables ici.'
                });
            }

            await sock.sendMessage(from, { text: `📁 Envoi de ${files.length} fichier(s)...` });

            for (const file of files) {
                const filePath = path.join(FOLDER, file);
                const stat = fs.statSync(filePath);
                if (!stat.isFile()) continue;

                try {
                    await sock.sendMessage(from, {
                        document: fs.readFileSync(filePath),
                        fileName: file,
                        mimetype: 'application/octet-stream'
                    });
                } catch (e) {
                    console.error(`Erreur envoi ${file}:`, e);
                }
            }
        } catch (error) {
            console.error('Erreur fichiers:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de l\'envoi des fichiers' });
        }
    }
};
