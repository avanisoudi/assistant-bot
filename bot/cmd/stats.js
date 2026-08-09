const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            await sock.sendMessage(from, {
                text: `📊 *TES STATS*\n\n💰 Coins: ${user.coins}\n🎒 Objets: ${user.inventory.length}\n📈 Actions détenues: ${Object.keys(user.stocks || {}).length}\n\n💡 .networth pour la valeur totale`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
