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
            setGroupSetting(from, 'antipurge', true);
            return sock.sendMessage(from, { text: "🧹 *Anti-Purge activé !*\nLe bot notifiera si une suppression massive de messages est détectée." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antipurge', false);
            return sock.sendMessage(from, { text: "🧹 *Anti-Purge désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antipurge ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🧹 *Anti-Purge :` + ` ${status}\n\nUsage : .antipurge on/off` });
        }
    }
};
