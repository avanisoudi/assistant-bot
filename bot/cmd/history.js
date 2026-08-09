const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const now = Date.now();

            const events = [];
            if (user.lastDaily) events.push(`📅 Dernière récompense quotidienne: il y a ${Math.floor((now - user.lastDaily) / 3600000)}h`);
            if (user.lastWork) events.push(`💼 Dernier travail: il y a ${Math.floor((now - user.lastWork) / 3600000)}h`);
            if (user.lastMining) events.push(`⛏️ Dernier minage: il y a ${Math.floor((now - user.lastMining) / 3600000)}h`);
            if (user.lastTreasure) events.push(`🗺️ Dernière chasse au trésor: il y a ${Math.floor((now - user.lastTreasure) / 3600000)}h`);

            await sock.sendMessage(from, {
                text: `📜 *HISTORIQUE*\n\n${events.length ? events.join('\n') : 'Aucune activité enregistrée encore'}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
