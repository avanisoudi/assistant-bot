const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);

        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'goodbye', true);
            return sock.sendMessage(from, { text: "👋 *Goodbye activé !*" });
        } else if (option === 'off') {
            setGroupSetting(from, 'goodbye', false);
            return sock.sendMessage(from, { text: "👋 *Goodbye désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.goodbye ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `👋 *Goodbye :* ${status}\n\nUsage : .goodbye on/off` });
        }
    }
};
