const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = (mentioned && mentioned[0]) || msg.key.participant || msg.key.remoteJid;
            const user = getUser(target);

            let rank = '🌱 Débutant';
            if (user.coins >= 50000) rank = '👑 Légende';
            else if (user.coins >= 10000) rank = '💎 Expert';
            else if (user.coins >= 2000) rank = '⭐ Avancé';
            else if (user.coins >= 500) rank = '🔹 Intermédiaire';

            await sock.sendMessage(from, {
                text: `👤 *PROFIL*\n\n📛 @${target.split('@')[0]}\n🏆 Rang: ${rank}\n💰 Coins: ${user.coins}\n🎒 Objets: ${user.inventory.length}\n🏢 Business: ${user.business || 'Aucun'}`,
                mentions: [target]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
