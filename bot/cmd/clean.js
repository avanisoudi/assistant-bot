const { checkAdmin } = require('../lib/adminCheck');
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });
            const { isAdmin, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
            }

            // Supprime le message .clean lui-même et informe (Baileys ne permet pas de purger tout l'historique d'un coup)
            await sock.sendMessage(from, {
                text: '🧹 Pour supprimer un message, réponds-y avec .delete\n\n⚠️ WhatsApp ne permet pas de purger tout un historique en une seule commande'
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
