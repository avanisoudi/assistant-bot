module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, { text: `🐱 *PHOTO DE CHAT*\n\nhttps://api.thecatapi.com/v1/images/search\n\nTellement adorable!` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
