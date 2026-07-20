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
            return sock.sendMessage(from, { text: "❌ Usage : `.add <numéro>` (ex: .add 24174569963)" });
        }

        const number = args[0].replace(/[^0-9]/g, '');
        const target = `${number}@s.whatsapp.net`;

        try {
            await sock.groupParticipantsUpdate(from, [target], 'add');
            await sock.sendMessage(from, {
                text: `✅ @${number} a été ajouté au groupe !`,
                mentions: [target]
            });
        } catch (error) {
            console.error("Erreur add:", error);
            sock.sendMessage(from, { text: "❌ Impossible d'ajouter cet utilisateur. Vérifie le numéro." });
        }
    }
};
