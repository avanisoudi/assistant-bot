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

        if (args.length === 0) {
            return sock.sendMessage(from, { text: "❌ Usage : `.setname Nouveau nom du groupe`" });
        }

        const newName = args.join(' ');

        try {
            await sock.groupUpdateSubject(from, newName);
            sock.sendMessage(from, { text: `✅ Le nom du groupe est maintenant : *${newName}*` });
        } catch (error) {
            console.error("Erreur setname:", error);
            sock.sendMessage(from, { text: "❌ Impossible de changer le nom." });
        }
    }
};
