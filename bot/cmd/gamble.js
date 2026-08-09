const fs = require('fs');
const path = require('path');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!args[0]) return await sock.sendMessage(from, { text: '❌ .gamble <montant>' });

            const sender = msg.key.participant || msg.key.remoteJid;
            const dbPath = path.join(__dirname, '..', 'db', 'economy.json');
            let economy = {};

            if (fs.existsSync(dbPath)) {
                economy = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            }

            if (!economy[sender]) economy[sender] = { coins: 0 };

            const bet = parseInt(args[0]);
            if (isNaN(bet) || bet <= 0 || bet > (economy[sender].coins || 0)) {
                return await sock.sendMessage(from, { text: '❌ Montant invalide' });
            }

            const win = Math.random() > 0.5;
            if (win) {
                economy[sender].coins += bet;
                await sock.sendMessage(from, { text: `🎰 *VICTOIRE!*\n\n💰 +${bet}\n Total: ${economy[sender].coins}` });
            } else {
                economy[sender].coins -= bet;
                await sock.sendMessage(from, { text: `💔 *PERDU!*\n\n-${bet}\nTotal: ${economy[sender].coins}` });
            }

            fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
