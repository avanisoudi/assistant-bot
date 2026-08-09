const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const amount = parseInt(args[0]);
            if (!amount || amount <= 0) return await sock.sendMessage(from, { text: `🚀 .startup <mise>\nLance une startup: 20% de chance de x4, sinon tout perdu (risqué!)` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (user.coins < amount) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const success = Math.random() < 0.2; // 20% succès
            const db = loadEconomy();

            if (success) {
                const gain = amount * 4;
                db[sender].coins += (gain - amount);
                saveEconomy(db);
                await sock.sendMessage(from, { text: `🚀 *STARTUP RÉUSSIE!*\n\n🦄 Ta startup a explosé!\n💰 +${gain - amount} coins\n🏦 Solde: ${db[sender].coins}` });
            } else {
                db[sender].coins -= amount;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `💥 *STARTUP EN FAILLITE*\n\n😢 Perdu: ${amount} coins\n🏦 Solde: ${db[sender].coins}` });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
