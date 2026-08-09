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

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0] ? mentioned[0] : (msg.message?.extendedTextMessage?.contextInfo?.participant);
            if (!target) return await sock.sendMessage(from, { text: '❌ Mentionne la personne: .remove @user' });

            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, { text: `👋 @${target.split('@')[0]} a été retiré du groupe`, mentions: [target] });
        } catch (error) {
            console.error('Erreur remove:', error);
            await sock.sendMessage(from, { text: '❌ Erreur - vérifie que le bot est admin' });
        }
    }
};
