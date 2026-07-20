module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);

        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        try {
            const inviteCode = await sock.groupInviteCode(from);
            const link = `https://chat.whatsapp.com/${inviteCode}`;

            sock.sendMessage(from, {
                text: `╭───「 *LIEN DU GROUPE* 」\n│\n│ 📎 *${metadata.subject}*\n│\n│ ${link}\n│\n╰──────────────────`
            });
        } catch (error) {
            console.error("Erreur linkgroup:", error);
            sock.sendMessage(from, { text: "❌ Impossible de récupérer le lien." });
        }
    }
};
