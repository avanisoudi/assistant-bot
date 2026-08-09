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
            const newCode = await sock.groupRevokeInvite(from);
            const newLink = `https://chat.whatsapp.com/${newCode}`;

            sock.sendMessage(from, {
                text: `🔄 Le lien du groupe a été réinitialisé !\n\n📎 Nouveau lien : ${newLink}\n\n⚠️ L'ancien lien ne fonctionne plus.`
            });
        } catch (error) {
            console.error("Erreur revoke:", error);
            sock.sendMessage(from, { text: "❌ Impossible de réinitialiser le lien." });
        }
    }
};
