const { addEntry } = require('../lib/feedback');
const { notifyBotAdmins } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `💬 .feedback <ton avis sur le bot>` });
            const sender = msg.key.participant || msg.key.remoteJid;
            const text = args.join(' ');
            const id = addEntry('feedback', sender, text);

            await notifyBotAdmins(sock, { text: `💬 *NOUVEL AVIS #${id}*\n\n👤 De: @${sender.split('@')[0]}\n📝 ${text}`, mentions: [sender] });

            await sock.sendMessage(from, { text: `✅ Avis #${id} envoyé, merci pour ton retour!` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
