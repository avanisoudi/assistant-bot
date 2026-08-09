const { checkAdmin } = require('../lib/adminCheck');
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo || !contextInfo.stanzaId) {
                return await sock.sendMessage(from, { text: '❌ Réponds au message à épingler avec .pin' });
            }
            if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: '❌ Groupe seulement' });

            const { isAdmin, senderJid, debug } = await checkAdmin(sock, from, msg);
            if (!isAdmin) {
                console.log('[adminCheck] Refus admin:', JSON.stringify(debug));
                return sock.sendMessage(from, { text: "❌ Tu dois être admin (ou créateur) du groupe !" });
            }

            await sock.sendMessage(from, {
                pin: {
                    type: 1,
                    time: 86400,
                    key: { remoteJid: from, id: contextInfo.stanzaId, participant: contextInfo.participant }
                }
            });
            await sock.sendMessage(from, { text: '📌 Message épinglé pour 24h' });
        } catch (error) {
            console.error('Erreur pin:', error);
            await sock.sendMessage(from, { text: '❌ Erreur (fonctionnalité pin non supportée sur ta version WhatsApp)' });
        }
    }
};
