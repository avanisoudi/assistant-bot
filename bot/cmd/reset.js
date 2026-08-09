const { loadEconomy, saveEconomy } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;

            if (args[0] !== 'confirm') {
                return await sock.sendMessage(from, {
                    text: `⚠️ *RÉINITIALISER TES DONNÉES*\n\nCela va remettre tes coins, inventaire et progression à zéro.\n\nPour confirmer: .reset confirm`
                });
            }

            const db = loadEconomy();
            delete db[sender];
            saveEconomy(db);

            await sock.sendMessage(from, { text: `✅ Tes données ont été réinitialisées` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
