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
            setGroupSetting(from, 'antibot', true);
            return sock.sendMessage(from, { text: "🤖 *Antibot activé !*\nLes autres bots seront kick." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antibot', false);
            return sock.sendMessage(from, { text: "🤖 *Antibot désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antibot ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🤖 *Antibot :* ${status}\n\nUsage : .antibot on/off` });
        }
    }
};
