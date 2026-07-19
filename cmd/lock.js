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
            await sock.groupSettingUpdate(from, 'locked');
            sock.sendMessage(from, { text: "🔒 Les infos du groupe sont verrouillées (admins seuls peuvent modifier)." });
        } catch (error) {
            console.error("Erreur lock:", error);
            sock.sendMessage(from, { text: "❌ Impossible de verrouiller." });
        }
    }
};
