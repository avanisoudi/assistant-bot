const { fetchAIResponse } = require('../lib/aiAPI');
const { startGenerating } = require('../lib/generatingAnimation');

module.exports = {
    execute: async (sock, msg, from, args) => {
        let animation = { stop: async () => {} };
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, { text: '💬 .chatbot <message>' });
            }

            const userMessage = args.join(' ');
            animation = await startGenerating(sock, from, '🤖 Réflexion');
            await sock.sendPresenceUpdate('composing', from).catch(() => {});

            const response = await fetchAIResponse(userMessage);

            await animation.stop(`💬 Vous: ${userMessage}\n\n🤖 Bot: ${response}`);

        } catch (error) {
            console.error('Erreur chatbot:', error);
            await animation.stop();
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
