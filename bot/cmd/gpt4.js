// 🤖 GPT4 V1.1.9 — pose une question à l'IA (Copilot en premier, puis chaîne de secours)
const { fetchAIResponse } = require('../lib/aiAPI');
const { simulateThinking } = require('../lib/typing');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🤖 .gpt4 <question>\n\nExemple: .gpt4 écris un poème sur l\'amitié' });
            const question = args.join(' ');
            await simulateThinking(sock, from, 1800, 4000);
            const response = await fetchAIResponse(question, 'copilot');
            await sock.sendMessage(from, { text: `🤖 *GPT-4:* ${response}` });
        } catch (error) {
            console.error('Erreur gpt4:', error);
            await sock.sendMessage(from, { text: '❌ Erreur IA' });
        }
    }
};
