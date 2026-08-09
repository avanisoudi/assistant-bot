module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const replies = [
                '❤️ Avec plaisir!',
                '😊 De rien, c\'est pour ça que je suis là!',
                '🙏 Merci à toi de m\'utiliser!',
                '✨ Toujours content d\'aider!'
            ];
            await sock.sendMessage(from, { text: replies[Math.floor(Math.random() * replies.length)] });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
