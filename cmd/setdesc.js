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

        if (args.length === 0) {
            return sock.sendMessage(from, { text: "❌ Usage : `.setdesc Nouvelle description du groupe`" });
        }

        const newDesc = args.join(' ');

        try {
            await sock.groupUpdateDescription(from, newDesc);
            sock.sendMessage(from, { text: `✅ Description du groupe mise à jour !` });
        } catch (error) {
            console.error("Erreur setdesc:", error);
            sock.sendMessage(from, { text: "❌ Impossible de changer la description." });
        }
    }
};
