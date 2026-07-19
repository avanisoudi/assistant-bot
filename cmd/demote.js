module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupes uniquement !" });
        }

        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!admins.includes(sender)) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        let targetUser = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }

        if (!targetUser) {
            return sock.sendMessage(from, { text: "❌ Mentionne un admin à rétrograder !" });
        }

        if (!admins.includes(targetUser)) {
            return sock.sendMessage(from, { text: "⚠️ Cet utilisateur n'est pas admin !" });
        }

        try {
            await sock.groupParticipantsUpdate(from, [targetUser], "demote");
            sock.sendMessage(from, { 
                text: `✅ @${targetUser.split('@')[0]} n'est plus admin.`,
                mentions: [targetUser]
            });
        } catch (error) {
            sock.sendMessage(from, { text: "❌ Impossible de rétrograder ce membre." });
        }
    }
};
