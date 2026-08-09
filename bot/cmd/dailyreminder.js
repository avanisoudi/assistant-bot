const { getSettings, setSetting } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const option = args[0]?.toLowerCase();

            if (option === 'on') {
                setSetting(sender, 'dailyReminder', true);
                return await sock.sendMessage(from, { text: '🔔 Rappel activé ! Je t\'enverrai un message privé dès que ta récompense .daily sera de nouveau disponible.' });
            }
            if (option === 'off') {
                setSetting(sender, 'dailyReminder', false);
                return await sock.sendMessage(from, { text: '🔕 Rappel désactivé.' });
            }

            const s = getSettings(sender);
            const status = s.dailyReminder ? '✅ Activé' : '❌ Désactivé';
            await sock.sendMessage(from, { text: `🔔 *Rappel quotidien :* ${status}\n\n.dailyreminder on/off\n\n⚠️ Fonctionne tant que le bot reste allumé sans redémarrer entre-temps.` });
        } catch (error) {
            console.error('Erreur dailyreminder:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
