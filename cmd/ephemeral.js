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

        const duration = args[0]?.toLowerCase();
        let seconds = 0;

        if (duration === '24h' || duration === '1j') seconds = 86400;
        else if (duration === '7j' || duration === '7d') seconds = 604800;
        else if (duration === '90j' || duration === '90d') seconds = 7776000;
        else if (duration === 'off' || duration === '0') seconds = 0;
        else {
            return sock.sendMessage(from, {
                text: "❌ Usage : `.ephemeral <durée>`\n\nOptions :\n• `24h` — 24 heures\n• `7j` — 7 jours\n• `90j` — 90 jours\n• `off` — Désactiver"
            });
        }

        try {
            await sock.sendMessage(from, { disappearingMessagesInChat: seconds });
            if (seconds === 0) {
                sock.sendMessage(from, { text: "⏳ Messages éphémères *désactivés*." });
            } else {
                sock.sendMessage(from, { text: `⏳ Messages éphémères activés : *${duration}*` });
            }
        } catch (error) {
            console.error("Erreur ephemeral:", error);
            sock.sendMessage(from, { text: "❌ Impossible de modifier les messages éphémères." });
        }
    }
};
