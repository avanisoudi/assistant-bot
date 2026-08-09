const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: `🔴 .roulette <mise> <rouge|noir|numéro 0-36>\nExemple: .roulette 100 rouge` });
            const bet = parseInt(args[0]);
            const choice = args[1].toLowerCase();
            if (!bet || bet <= 0) return await sock.sendMessage(from, { text: `❌ Mise invalide` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const spin = Math.floor(Math.random() * 37); // 0-36
            const isRed = RED_NUMBERS.includes(spin);
            const color = spin === 0 ? '🟢 vert' : isRed ? '🔴 rouge' : '⚫ noir';

            let winnings = -bet;
            if (choice === 'rouge' && isRed) winnings = bet;
            else if (choice === 'noir' && !isRed && spin !== 0) winnings = bet;
            else if (/^\d+$/.test(choice) && parseInt(choice) === spin) winnings = bet * 35;

            const db = loadEconomy();
            db[sender].coins = Math.max(0, db[sender].coins + winnings);
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `🎡 La bille tombe sur *${spin}* (${color})\n\n${winnings > 0 ? `🎉 Gagné +${winnings}` : `😢 Perdu ${winnings}`} coins\n🏦 Solde: ${db[sender].coins}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
