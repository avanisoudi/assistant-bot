const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const COOLDOWN = 3 * 60 * 60 * 1000; // 3h

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();

            if (now - (user.lastTreasure || 0) < COOLDOWN) {
                const left = COOLDOWN - (now - user.lastTreasure);
                const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
                return await sock.sendMessage(from, { text: `🗺️ Prochaine chasse au trésor dans ${h}h ${m}m` });
            }

            const hasMap = user.inventory.includes('carte');
            const found = Math.random() < (hasMap ? 0.8 : 0.5);
            const db = loadEconomy();
            db[sender].lastTreasure = now;

            if (found) {
                const reward = Math.floor(Math.random() * 300) + 100;
                db[sender].coins += reward;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `🗺️ *TRÉSOR TROUVÉ!*\n\n💰 +${reward} coins\n🏦 Solde: ${db[sender].coins}` });
            } else {
                saveEconomy(db);
                await sock.sendMessage(from, { text: `🗺️ Tu as creusé partout mais rien trouvé... ${hasMap ? '' : '(Astuce: achète une 🗺️ carte au .shop pour augmenter tes chances!)'}` });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
