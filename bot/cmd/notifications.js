const { getSettings, setSetting } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const action = args[0]?.toLowerCase();

            if (action === 'on' || action === 'off') {
                setSetting(sender, 'notifications', action === 'on');
                return await sock.sendMessage(from, { text: `🔔 Notifications: ${action.toUpperCase()}` });
            }

            const s = getSettings(sender);
            await sock.sendMessage(from, { text: `🔔 Notifications actuellement: ${s.notifications ? 'ON' : 'OFF'}\n\n.notifications on/off pour changer` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
