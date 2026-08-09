module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const { checkAdmin } = require('../lib/adminCheck');
        const { isAdmin, debug, metadata } = await checkAdmin(sock, from, msg);
        if (!isAdmin) {
            console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
            return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
        }

        try {
            const inviteCode = await sock.groupInviteCode(from);
            const link = `https://chat.whatsapp.com/${inviteCode}`;

            sock.sendMessage(from, {
                text: `╭───「 *LIEN DU GROUPE* 」\n│\n│ 📎 *${metadata.subject}*\n│\n│ ${link}\n│\n╰──────────────────`
            });
        } catch (error) {
            console.error("Erreur linkgroup:", error);
            sock.sendMessage(from, { text: "❌ Impossible de récupérer le lien." });
        }
    }
};
