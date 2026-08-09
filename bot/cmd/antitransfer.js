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
            setGroupSetting(from, 'antitransfer', true);
            return sock.sendMessage(from, { text: "👑 *Anti-Transfert activé !*\nLe bot notifiera le groupe si la propriété du groupe change (limitation: ne peut pas bloquer le transfert lui-même, WhatsApp le gère nativement)." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antitransfer', false);
            return sock.sendMessage(from, { text: "👑 *Anti-Transfert désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antitransfer ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `👑 *Anti-Transfert :` + ` ${status}\n\nUsage : .antitransfer on/off` });
        }
    }
};
