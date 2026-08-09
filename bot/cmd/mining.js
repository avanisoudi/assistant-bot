const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const COOLDOWN = 2 * 60 * 60 * 1000; // 2h

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();

            if (now - (user.lastMining || 0) < COOLDOWN) {
                const left = COOLDOWN - (now - user.lastMining);
                const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
                return await sock.sendMessage(from, { text: `⛏️ Tu dois attendre ${h}h ${m}m avant de miner à nouveau` });
            }

            const hasTool = user.inventory.includes('pelle');
            const base = Math.floor(Math.random() * 150) + 50;
            const reward = hasTool ? Math.floor(base * 1.5) : base;

            const db = loadEconomy();
            db[sender].coins += reward;
            db[sender].lastMining = now;
            saveEconomy(db);

            await sock.sendMessage(from, {
                text: `⛏️ *MINAGE*\n\n${hasTool ? '🔨 Bonus pelle appliqué!\n' : ''}💰 +${reward} coins\n🏦 Solde: ${db[sender].coins}\n\n⏳ Reviens dans 2h`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
