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
            const newCode = await sock.groupRevokeInvite(from);
            const newLink = `https://chat.whatsapp.com/${newCode}`;

            sock.sendMessage(from, {
                text: `🔄 Le lien du groupe a été réinitialisé !\n\n📎 Nouveau lien : ${newLink}\n\n⚠️ L'ancien lien ne fonctionne plus.`
            });
        } catch (error) {
            console.error("Erreur revoke:", error);
            sock.sendMessage(from, { text: "❌ Impossible de réinitialiser le lien." });
        }
    }
};
