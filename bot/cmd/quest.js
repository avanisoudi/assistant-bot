const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');
const QUESTS = [
    { task: 'Envoie 5 messages dans le groupe', reward: 80 },
    { task: 'Utilise 3 commandes différentes', reward: 100 },
    { task: 'Joue à un mini-jeu (.slots, .dice, .8ball...)', reward: 60 },
    { task: 'Souhaite bonne journée à quelqu\'un dans le groupe', reward: 50 }
];
const COOLDOWN = 24 * 60 * 60 * 1000;

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();

            if (args[0] === 'claim') {
                if (!user.currentQuest) return await sock.sendMessage(from, { text: `❌ Tu n'as pas de mission active. Tape .quest pour en obtenir une` });
                if (now - (user.questAssigned || 0) < 5 * 60 * 1000) {
                    return await sock.sendMessage(from, { text: `⏳ Attends encore un peu avant de réclamer (mission trop récente)` });
                }
                const quest = QUESTS[user.currentQuest.idx];
                const db = loadEconomy();
                db[sender].coins += quest.reward;
                db[sender].currentQuest = null;
                db[sender].lastQuest = now;
                saveEconomy(db);
                return await sock.sendMessage(from, { text: `✅ Mission accomplie: "${quest.task}"\n💰 +${quest.reward} coins\n🏦 Solde: ${db[sender].coins}` });
            }

            if (now - (user.lastQuest || 0) < COOLDOWN && !user.currentQuest) {
                const left = COOLDOWN - (now - user.lastQuest);
                return await sock.sendMessage(from, { text: `📜 Prochaine mission dans ${Math.floor(left / 3600000)}h` });
            }

            if (user.currentQuest) {
                const quest = QUESTS[user.currentQuest.idx];
                return await sock.sendMessage(from, { text: `📜 *MISSION EN COURS*\n\n${quest.task}\n💰 Récompense: ${quest.reward} coins\n\n.quest claim quand c'est fait!` });
            }

            const idx = Math.floor(Math.random() * QUESTS.length);
            const db = loadEconomy();
            db[sender].currentQuest = { idx };
            db[sender].questAssigned = now;
            saveEconomy(db);

            await sock.sendMessage(from, { text: `📜 *NOUVELLE MISSION*\n\n${QUESTS[idx].task}\n💰 Récompense: ${QUESTS[idx].reward} coins\n\n.quest claim quand c'est fait!` });
        } catch (error) {
            console.error('Erreur quest:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
