module.exports = {
    execute: async (sock, msg, from, args) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.stanzaId) {
            return sock.sendMessage(from, { text: "❌ Réponds à un message avec `.del` pour le supprimer" });
        }

        try {
            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: quoted.participant === sock.user?.id?.split(':')[0] + '@s.whatsapp.net',
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });
        } catch (error) {
            console.error("Erreur del:", error);
            sock.sendMessage(from, { text: "❌ Je ne peux supprimer que mes propres messages ou je dois être admin." });
        }
    }
};
