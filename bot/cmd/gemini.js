// ✨ GEMINI V1.1.9 — pose une question à l'IA Gemini (API compatible)
const { fetchAIResponse } = require('../lib/aiAPI');
const { simulateThinking } = require('../lib/typing');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '✨ .gemini <question>\n\nExemple: .gemini donne moi des idées de business' });
            const question = args.join(' ');
            await simulateThinking(sock, from, 1800, 4000);
            const response = await fetchAIResponse(question, 'gemini');
            await sock.sendMessage(from, { text: `✨ *Gemini:* ${response}` });
        } catch (error) {
            console.error('Erreur gemini:', error);
            await sock.sendMessage(from, { text: '❌ Erreur IA' });
        }
    }
};
