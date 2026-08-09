const { fetchAIResponse } = require('../lib/aiAPI');
const { startGenerating } = require('../lib/generatingAnimation');

module.exports = {
    execute: async (sock, msg, from, args) => {
        let animation = { stop: async () => {} };
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, {
                    text: '🤖 .ai <question>\n\nExemple: .ai explique moi python'
                });
            }

            const question = args.join(' ');
            animation = await startGenerating(sock, from, '🤖 Réflexion');
            await sock.sendPresenceUpdate('composing', from).catch(() => {});

            const response = await fetchAIResponse(question);

            await animation.stop(`❓ Question: ${question}\n\n💭 Réponse: ${response}`);

        } catch (error) {
            await animation.stop();
            await sock.sendMessage(from, { text: '❌ Erreur IA' });
        }
    }
};
