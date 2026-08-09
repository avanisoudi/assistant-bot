const { checkAdmin } = require('../lib/adminCheck');
const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const { isAdmin, debug } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'antisticker', true);
            return sock.sendMessage(from, { text: "🎭 *Anti-Sticker activé !*\nLes stickers envoyés par les non-admins seront supprimés." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antisticker', false);
            return sock.sendMessage(from, { text: "🎭 *Anti-Sticker désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antisticker ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🎭 *Anti-Sticker :` + ` ${status}\n\nUsage : .antisticker on/off` });
        }
    }
};
