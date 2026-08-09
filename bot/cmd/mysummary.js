const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();

            let text = `📊 *TON RÉSUMÉ COMPLET*\n\n`;
            text += `💰 Coins: ${user.coins}\n`;
            text += `🎒 Objets: ${user.inventory.length}\n`;
            text += `🏢 Business: ${user.business || 'Aucun'}\n`;
            text += `📈 Actions: ${Object.keys(user.stocks || {}).length}\n\n`;
            text += `⏳ *Cooldowns:*\n`;
            text += `📅 Daily: ${user.lastDaily && (now - user.lastDaily) < 86400000 ? '⏳ En attente' : '✅ Disponible'}\n`;
            text += `⛏️ Minage: ${user.lastMining && (now - user.lastMining) < 7200000 ? '⏳ En attente' : '✅ Disponible'}\n`;
            text += `🗺️ Trésor: ${user.lastTreasure && (now - user.lastTreasure) < 10800000 ? '⏳ En attente' : '✅ Disponible'}`;

            // Envoyé en privé même si demandé depuis un groupe ; si ça échoue (JID non joignable en DM), on l'affiche sur place
            if (from.endsWith('@g.us')) {
                try {
                    await sock.sendMessage(sender, { text });
                    await sock.sendMessage(from, { text: '✅ Résumé envoyé en message privé !' });
                } catch (e) {
                    await sock.sendMessage(from, { text: `⚠️ Impossible de t'envoyer un DM (écris-moi d'abord en privé). Voici ton résumé ici:\n\n${text}` });
                }
            } else {
                await sock.sendMessage(from, { text });
            }
        } catch (error) {
            console.error('Erreur mysummary:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
