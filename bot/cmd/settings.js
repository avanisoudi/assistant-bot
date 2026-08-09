const { getSettings, setSetting } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;

            if (args.length === 0) {
                const s = getSettings(sender);
                return await sock.sendMessage(from, {
                    text: `⚙️ *TES PARAMÈTRES*\n\n🔔 Notifications: ${s.notifications ? 'ON' : 'OFF'}\n🌐 Langue: ${s.language}\n🎨 Thème: ${s.theme}\n\n.settings notifications on/off\n.settings language <fr/en>`
                });
            }

            const key = args[0].toLowerCase();
            const value = args[1]?.toLowerCase();
            if (key === 'notifications' && (value === 'on' || value === 'off')) {
                setSetting(sender, 'notifications', value === 'on');
                return await sock.sendMessage(from, { text: `✅ Notifications: ${value.toUpperCase()}` });
            }
            if (key === 'language' && value) {
                setSetting(sender, 'language', value);
                return await sock.sendMessage(from, { text: `✅ Langue définie: ${value}` });
            }
            await sock.sendMessage(from, { text: `❌ Utilise: .settings notifications on/off | .settings language <code>` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
