const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);

            if (user.inventory.length === 0) {
                return await sock.sendMessage(from, { text: `🎒 *INVENTAIRE VIDE*\n\nAchète des objets avec .shop et .buy` });
            }

            const counts = {};
            user.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1);
            let text = `🎒 *TON INVENTAIRE*\n\n`;
            for (const [item, count] of Object.entries(counts)) {
                text += `• ${item} x${count}\n`;
            }

            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
