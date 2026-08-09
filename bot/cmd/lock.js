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

        try {
            await sock.groupSettingUpdate(from, 'locked');
            sock.sendMessage(from, { text: "🔒 Les infos du groupe sont verrouillées (admins seuls peuvent modifier)." });
        } catch (error) {
            console.error("Erreur lock:", error);
            sock.sendMessage(from, { text: "❌ Impossible de verrouiller." });
        }
    }
};
