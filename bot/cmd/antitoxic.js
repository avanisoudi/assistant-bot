const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const { checkAdmin } = require('../lib/adminCheck');
        const { isAdmin, debug } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'antitoxic', true);
            return sock.sendMessage(from, { text: "🤬 *Antitoxic activé !*\nLes mots interdits seront supprimés." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antitoxic', false);
            return sock.sendMessage(from, { text: "🤬 *Antitoxic désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antitoxic ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🤬 *Antitoxic :* ${status}\n\nUsage : .antitoxic on/off` });
        }
    }
};
