const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Extrait le vrai contenu média d'un message potentiellement enveloppé en "vue unique"
// (viewOnceMessage / viewOnceMessageV2 / viewOnceMessageV2Extension, ou flag viewOnce
// direct sur imageMessage/videoMessage) — même logique que celle utilisée pour antiviewonce.
function extractMediaMessage(quotedMsg) {
    if (quotedMsg.viewOnceMessage?.message) return quotedMsg.viewOnceMessage.message;
    if (quotedMsg.viewOnceMessageV2?.message) return quotedMsg.viewOnceMessageV2.message;
    if (quotedMsg.viewOnceMessageV2Extension?.message) return quotedMsg.viewOnceMessageV2Extension.message;
    if (quotedMsg.imageMessage) return { imageMessage: quotedMsg.imageMessage };
    if (quotedMsg.videoMessage) return { videoMessage: quotedMsg.videoMessage };
    return null;
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quotedMsg = contextInfo?.quotedMessage;

            if (!quotedMsg) {
                return await sock.sendMessage(from, {
                    text: "❌ *Utilisation:* Réponds à un message vue-unique (photo/vidéo) avec *.vv* pour le révéler"
                });
            }

            const mediaContent = extractMediaMessage(quotedMsg);
            if (!mediaContent) {
                return await sock.sendMessage(from, { text: "❌ Le message cité ne contient pas de photo/vidéo" });
            }

            const mediaType = mediaContent.imageMessage ? 'image' : mediaContent.videoMessage ? 'video' : null;
            if (!mediaType) {
                return await sock.sendMessage(from, { text: "❌ Type de média non supporté" });
            }

            const stream = await downloadContentFromMessage(mediaContent[`${mediaType}Message`], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const sender = msg.key.participant || msg.key.remoteJid;
            const caption = `👁️ Révélé par @${sender.split('@')[0]}`;

            if (mediaType === 'image') {
                await sock.sendMessage(from, { image: buffer, caption, mentions: [sender] });
            } else {
                await sock.sendMessage(from, { video: buffer, caption, mentions: [sender] });
            }

        } catch (error) {
            console.error('Erreur vv:', error);
            await sock.sendMessage(from, { text: `❌ Erreur: impossible de récupérer ce média (peut-être déjà expiré)` });
        }
    }
};
