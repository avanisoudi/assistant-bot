module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const result = Math.random() > 0.5 ? 'PILE' : 'FACE';
            const emoji = result === 'PILE' ? '🪙' : '🎪';
            await sock.sendMessage(from, {
                text: `${emoji} *PILE OU FACE*\n\n**${result}**`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
