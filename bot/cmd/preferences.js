const { getSettings, setSetting } = require('../lib/userSettings');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;

            if (args.length === 0) {
                const s = getSettings(sender);
                return await sock.sendMessage(from, { text: `🎨 *PRÉFÉRENCES*\n\nThème: ${s.theme}\n\n.preferences theme <default/dark/fun>` });
            }
            if (args[0] === 'theme' && args[1]) {
                setSetting(sender, 'theme', args[1]);
                return await sock.sendMessage(from, { text: `✅ Thème défini: ${args[1]}` });
            }
            await sock.sendMessage(from, { text: `❌ Utilise: .preferences theme <nom>` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
