module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const result = Math.floor(Math.random() * 6) + 1;
            const emojis = ['🎲', '🎲', '🎲', '🎲', '🎲', '🎲'];
            await sock.sendMessage(from, {
                text: `🎲 *LANCER DÉ*\n\n${emojis[result - 1]} **${result}**`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
