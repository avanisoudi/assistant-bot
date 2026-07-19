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

        let target = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            target = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        }

        if (!target) {
            return sock.sendMessage(from, { text: "❌ Usage : `.kick @user` ou réponds à un message" });
        }

        if (target === sender) {
            return sock.sendMessage(from, { text: "❌ Tu ne peux pas te kick toi-même !" });
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, {
                text: `✅ @${target.split('@')[0]} a été expulsé !`,
                mentions: [target]
            });
        } catch (error) {
            console.error("Erreur kick:", error);
            sock.sendMessage(from, { text: "❌ Impossible d'expulser cet utilisateur." });
        }
    }
};
