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
            setGroupSetting(from, 'antilink', true);
            return sock.sendMessage(from, { text: "🔗 *Antilink activé !*\nLes liens seront supprimés automatiquement." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antilink', false);
            return sock.sendMessage(from, { text: "🔗 *Antilink désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antilink ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🔗 *Antilink :* ${status}\n\nUsage : .antilink on/off` });
        }
    }
};
