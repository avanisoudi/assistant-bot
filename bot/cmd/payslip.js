const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            const now = Date.now();
            const dailyReady = (now - (user.lastDaily || 0)) > 86400000;
            const workReady = (now - (user.lastWork || 0)) > 3600000;

            await sock.sendMessage(from, {
                text: `📋 *RELEVÉ DE COMPTE*\n\n💰 Solde actuel: ${user.coins} coins\n🎒 Objets possédés: ${user.inventory.length}\n\n📅 .daily: ${dailyReady ? '✅ Disponible' : '⏳ Déjà réclamé'}\n💼 .work: ${workReady ? '✅ Disponible' : '⏳ En cooldown'}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
