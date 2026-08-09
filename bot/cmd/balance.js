const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const dbPath = path.join(__dirname, '..', 'db', 'economy.json');
            let economy = {};

            if (fs.existsSync(dbPath)) {
                economy = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            }

            const coins = economy[sender]?.coins || 0;
            await sock.sendMessage(from, {
                text: `💰 *MON PORTEFEUILLE*\n\n🪙 ${coins} coins`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
