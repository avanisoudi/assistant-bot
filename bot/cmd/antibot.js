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
            setGroupSetting(from, 'antibot', true);
            return sock.sendMessage(from, { text: "🤖 *Antibot activé !*\nLes numéros suspects (préfixes bots connus) seront expulsés à l'arrivée." });
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
