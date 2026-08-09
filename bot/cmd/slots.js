const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const bet = parseInt(args[0]);
            if (!bet || bet <= 0) return await sock.sendMessage(from, { text: `🎰 .slots <mise>\nExemple: .slots 50` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const roll = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            const display = roll.join(' | ');
            let winnings = 0;

            if (roll[0] === roll[1] && roll[1] === roll[2]) {
                winnings = bet * (roll[0] === '7️⃣' ? 10 : roll[0] === '💎' ? 7 : 5);
            } else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) {
                winnings = Math.floor(bet * 1.5);
            } else {
                winnings = -bet;
            }

            const db = loadEconomy();
            db[sender].coins = Math.max(0, db[sender].coins + winnings);
            saveEconomy(db);

            const text = winnings > 0
                ? `🎰 [ ${display} ]\n\n🎉 Gagné: +${winnings} coins!\n🏦 Solde: ${db[sender].coins}`
                : `🎰 [ ${display} ]\n\n😢 Perdu: ${winnings} coins\n🏦 Solde: ${db[sender].coins}`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            console.error('Erreur slots:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
