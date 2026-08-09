const fs = require('fs');
const path = require('path');
const { isBotAdmin } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!(await isBotAdmin(sender, sock))) return await sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du bot' });

            const dbDir = path.join(__dirname, '..', 'db');
            const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json'));
            const backup = {};
            files.forEach(f => {
                try { backup[f] = JSON.parse(fs.readFileSync(path.join(dbDir, f), 'utf-8')); } catch {}
            });

            await sock.sendMessage(from, {
                document: Buffer.from(JSON.stringify(backup, null, 2), 'utf-8'),
                mimetype: 'application/json',
                fileName: `backup_${Date.now()}.json`
            });
        } catch (error) {
            console.error('Erreur backup:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du backup' });
        }
    }
};
