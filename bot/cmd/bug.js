const { addEntry } = require('../lib/feedback');
const { notifyBotAdmins } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `🐛 .bug <description du problème>\nExemple: .bug la commande .play ne fonctionne pas` });
            const sender = msg.key.participant || msg.key.remoteJid;
            const description = args.join(' ');
            const id = addEntry('bug', sender, description);

            await notifyBotAdmins(sock, {
                text: `🐛 *NOUVEAU BUG SIGNALÉ #${id}*\n\n👤 De: @${sender.split('@')[0]}\n💬 Depuis: ${from.endsWith('@g.us') ? 'un groupe' : 'un message privé'}\n📝 ${description}`,
                mentions: [sender]
            });

            await sock.sendMessage(from, { text: `✅ Bug #${id} signalé, merci! Les administrateurs du bot ont été notifiés.` });
        } catch (error) {
            console.error('Erreur bug:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
