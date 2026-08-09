module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '⏰ .remind <minutes> <message>\nExemple: .remind 30 Appeler le client' });
            const minutes = parseInt(args[0]);
            if (!minutes || minutes <= 0 || minutes > 1440) {
                return await sock.sendMessage(from, { text: '❌ Indique une durée entre 1 et 1440 minutes (24h)' });
            }
            const reminder = args.slice(1).join(' ');
            const sender = msg.key.participant || msg.key.remoteJid;

            await sock.sendMessage(from, { text: `⏰ Rappel programmé dans ${minutes} min: "${reminder}"` });

            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { text: `🔔 *RAPPEL*\n\n@${sender.split('@')[0]}: ${reminder}`, mentions: [sender] });
                } catch (e) { console.error('Erreur envoi remind:', e); }
            }, minutes * 60 * 1000);
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
