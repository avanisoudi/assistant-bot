const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const COOLDOWN = 90 * 60 * 1000; // 1h30
const ANIMALS = [
    { name: 'lapin', value: 40 }, { name: 'sanglier', value: 90 },
    { name: 'cerf', value: 150 }, { name: 'faisan', value: 60 }
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();
            const lastHunt = user.lastHunt || 0;

            if (now - lastHunt < COOLDOWN) {
                const left = COOLDOWN - (now - lastHunt);
                const m = Math.floor(left / 60000);
                return await sock.sendMessage(from, { text: `🏹 Prochaine chasse dans ${m}m` });
            }

            const success = Math.random() < 0.7;
            const db = loadEconomy();
            db[sender].lastHunt = now;

            if (success) {
                const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
                db[sender].coins += animal.value;
                saveEconomy(db);
                await sock.sendMessage(from, { text: `🏹 Tu as chassé un ${animal.name}!\n\n💰 +${animal.value} coins\n🏦 Solde: ${db[sender].coins}` });
            } else {
                saveEconomy(db);
                await sock.sendMessage(from, { text: `🏹 Aucune proie en vue... réessaie plus tard` });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
