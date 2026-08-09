const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const amount = parseInt(args[0]);
            if (!amount || amount <= 0) return await sock.sendMessage(from, { text: `📈 .invest <montant>\nRendement entre -30% et +60%` });

            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            if (user.coins < amount) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const returnRate = (Math.random() * 0.9) - 0.3; // -30% à +60%
            const result = Math.floor(amount * returnRate);

            const db = loadEconomy();
            db[sender].coins = Math.max(0, db[sender].coins + result);
            saveEconomy(db);

            const pct = (returnRate * 100).toFixed(1);
            await sock.sendMessage(from, {
                text: `📈 *INVESTISSEMENT*\n\n💼 Mise: ${amount} coins\n${result >= 0 ? '📈' : '📉'} Rendement: ${pct}%\n${result >= 0 ? '✅ +' : '❌ '}${result} coins\n🏦 Solde: ${db[sender].coins}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
