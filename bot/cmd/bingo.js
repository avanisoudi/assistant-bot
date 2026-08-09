const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const bet = parseInt(args[0]) || 0;
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (bet > 0 && user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant` });

            // Génère une carte de 5 numéros et tire 5 numéros au hasard
            const card = new Set();
            while (card.size < 5) card.add(Math.floor(Math.random() * 75) + 1);
            const drawn = new Set();
            while (drawn.size < 15) drawn.add(Math.floor(Math.random() * 75) + 1);

            const matches = [...card].filter(n => drawn.has(n));
            const cardDisplay = [...card].join(', ');

            let text = `🎱 *BINGO*\n\n🎴 Ta carte: ${cardDisplay}\n🎯 Correspondances: ${matches.length}/5\n\n`;

            if (bet > 0) {
                const db = loadEconomy();
                let winnings = 0;
                if (matches.length >= 4) winnings = bet * 5;
                else if (matches.length >= 2) winnings = bet;
                else winnings = -bet;
                db[sender].coins = Math.max(0, db[sender].coins + winnings);
                saveEconomy(db);
                text += `${winnings >= 0 ? '🎉 +' : ''}${winnings} coins\n🏦 Solde: ${db[sender].coins}`;
            } else {
                text += matches.length >= 4 ? '🎉 Excellent score!' : matches.length >= 2 ? '👍 Pas mal!' : '😢 Pas de chance';
            }

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
