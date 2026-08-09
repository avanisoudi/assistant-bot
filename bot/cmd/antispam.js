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
            setGroupSetting(from, 'antispam', true);
            return sock.sendMessage(from, { text: "🚫 *Antispam activé !*\nAu-delà de 8 messages en 10s, le membre reçoit un avertissement (sans kick).\n\n💡 Pour un kick automatique après spam, utilise .antiflood on" });
        } else if (option === 'off') {
            setGroupSetting(from, 'antispam', false);
            return sock.sendMessage(from, { text: "🚫 *Antispam désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antispam ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `🚫 *Antispam :* ${status}\n\nUsage : .antispam on/off` });
        }
    }
};
