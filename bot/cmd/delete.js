module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo || !contextInfo.stanzaId) {
                return await sock.sendMessage(from, { text: '❌ Réponds au message à supprimer avec .delete' });
            }

            const { checkAdmin, normalizeJid } = require('../lib/adminCheck');
            const sender = normalizeJid(msg.key.participant) || msg.key.remoteJid;
            if (from.endsWith('@g.us')) {
                const isSenderMsg = normalizeJid(contextInfo.participant) === sender;
                const { isAdmin, debug } = await checkAdmin(sock, from, msg);
                if (!isSenderMsg && !isAdmin) {
                    console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                    return await sock.sendMessage(from, { text: '❌ Tu ne peux supprimer que tes propres messages (ou être admin)' });
                }
            }

            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant,
                    fromMe: false
                }
            });
        } catch (error) {
            console.error('Erreur delete:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la suppression' });
        }
    }
};
