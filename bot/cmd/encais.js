const { loadEconomy, saveEconomy } = require('../lib/economy');

const GROWTH_RATE = 0.13; // doit rester identique à aviator.js pour un calcul cohérent

function currentMultiplier(startTime) {
    const elapsedSec = (Date.now() - startTime) / 1000;
    return Math.exp(GROWTH_RATE * elapsedSec);
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const game = global.crashGames && global.crashGames[from];

            if (!game || game.phase !== 'flying') {
                return await sock.sendMessage(from, { text: '❌ Aucune fusée en vol actuellement. Tape . aviator <mise> pour lancer une manche' });
            }

            const player = game.players.get(sender);
            if (!player) return await sock.sendMessage(from, { text: '❌ Tu n\'as pas misé sur cette manche' });
            if (player.cashedOutAt) return await sock.sendMessage(from, { text: '⚠️ Tu as déjà encaissé sur cette manche' });

            const mult = currentMultiplier(game.startTime);
            if (mult >= game.crashPoint) {
                return await sock.sendMessage(from, { text: '💥 Trop tard, la fusée vient de crasher !' });
            }

            player.cashedOutAt = mult;
            const winnings = Math.floor(player.bet * mult);

            const db = loadEconomy();
            db[sender].coins += winnings;
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `✅ @${sender.split('@')[0]} a encaissé à *${mult.toFixed(2)}x* !\n💰 +${winnings} coins`,
                mentions: [sender]
            });
        } catch (error) {
            console.error('Erreur cashout:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
