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
            setGroupSetting(from, 'antitag', true);
            return sock.sendMessage(from, { text: "🏷️ *Anti-Tag activé !*\nLe spam de mentions (5+ personnes) sera supprimé." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antitag', false);
            return sock.sendMessage(from, { text: "🏷️ *Anti-Tag désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antitag ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🏷️ *Anti-Tag :` + ` ${status}\n\nUsage : .antitag on/off` });
        }
    }
};
