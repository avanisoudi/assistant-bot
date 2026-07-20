module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!msg.quoted) {
            return await sock.sendMessage(from, {
                text: "❌ Veuillez répondre à un message pour utiliser la vue unique"
            });
        }

        try {
            const quotedMsg = await msg.quoted;
            
            // Vérifier si c'est un média
            if (!quotedMsg.mediaKey) {
                return await sock.sendMessage(from, {
                    text: "❌ Le message doit contenir un média (photo/vidéo)"
                });
            }

            // Récupérer le média et le renvoyer en vue unique
            const media = await sock.downloadMediaMessage(quotedMsg);
            
            if (quotedMsg.message.imageMessage) {
                await sock.sendMessage(from, {
                    image: media,
                    viewOnce: true,
                    caption: "✦ Vue unique"
                });
            } else if (quotedMsg.message.videoMessage) {
                await sock.sendMessage(from, {
                    video: media,
                    viewOnce: true,
                    caption: "✦ Vue unique"
                });
            }

            await sock.sendMessage(from, {
                text: "✅ Média envoyé en vue unique!"
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du traitement du média"
            });
        }
    }
};
