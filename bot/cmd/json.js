module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📋 .json <texte JSON>\nValide et formate ton JSON' });
            const raw = args.join(' ');
            const parsed = JSON.parse(raw);
            const formatted = JSON.stringify(parsed, null, 2);
            await sock.sendMessage(from, { text: `✅ *JSON VALIDE*\n\n\`\`\`${formatted}\`\`\`` });
        } catch (error) {
            await sock.sendMessage(from, { text: `❌ JSON invalide: ${error.message}` });
        }
    }
};
