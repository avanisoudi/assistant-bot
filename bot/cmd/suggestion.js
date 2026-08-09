const { addEntry } = require('../lib/feedback');
const { notifyBotAdmins } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: `💡 .suggestion <ton idée>` });
            const sender = msg.key.participant || msg.key.remoteJid;
            const text = args.join(' ');
            const id = addEntry('suggestion', sender, text);

            await notifyBotAdmins(sock, { text: `💡 *NOUVELLE SUGGESTION #${id}*\n\n👤 De: @${sender.split('@')[0]}\n📝 ${text}`, mentions: [sender] });

            await sock.sendMessage(from, { text: `✅ Suggestion #${id} envoyée, merci!` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
