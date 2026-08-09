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
            setGroupSetting(from, 'antidemote', true);
            return sock.sendMessage(from, { text: "⬇️ *Anti-Démotion activé !*\n⚠️ Limitation WhatsApp: le bot ne peut pas identifier qui a rétrogradé un admin, donc il notifie le groupe à chaque démotion plutôt que de bloquer l'action." });
        } else if (option === 'off') {
            setGroupSetting(from, 'antidemote', false);
            return sock.sendMessage(from, { text: "⬇️ *Anti-Démotion désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.antidemote ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `⬇️ *Anti-Démotion :` + ` ${status}\n\nUsage : .antidemote on/off` });
        }
    }
};
