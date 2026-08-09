module.exports = {
    execute: async (sock, msg, from, args) => {
        // Vérifie si on est dans un groupe
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Cette commande ne fonctionne que dans les groupes !" });
        }

        try {
            // Récupère les métadonnées du groupe
            const metadata = await sock.groupMetadata(from);
            
            // Récupère tous les participants
            const participants = metadata.participants;
            const mentions = participants.map(p => p.id);

            // Détermine le type de tag
            let messageText = "";
            let quoted = null;

            // Cas 1 : tag reply (répond à un message)
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedMsg = msg.message.extendedTextMessage.contextInfo;
                const quotedText = quotedMsg.quotedMessage.conversation || 
                                   quotedMsg.quotedMessage.extendedTextMessage?.text || 
                                   "[Message]";
                
                messageText = `📢 *TAG SILENCIEUX*\n\n${quotedText}`;
                quoted = {
                    key: {
                        fromMe: msg.key.fromMe,
                        participant: msg.key.participant || msg.key.remoteJid,
                        id: quotedMsg.stanzaId
                    },
                    message: quotedMsg.quotedMessage
                };
            }
            // Cas 2 : tag <message> (avec message personnalisé)
            else if (args.length > 0) {
                messageText = `📢 *TAG SILENCIEUX*\n\n${args.join(' ')}`;
            }
            // Cas 3 : tag simple (sans message)
            else {
                messageText = `📢 *TAG SILENCIEUX*\n\n👋 Tous les membres ont été mentionnés !`;
            }

            // Envoie le message avec toutes les mentions
            await sock.sendMessage(from, {
                text: messageText,
                mentions: mentions,
                quoted: quoted
            });

        } catch (error) {
            console.error("Erreur tag:", error);
            sock.sendMessage(from, { text: "❌ Impossible de taguer les membres." });
        }
    }
};
