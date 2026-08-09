module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, { text: `🐶 *PHOTO DE CHIEN*\n\nhttps://dog.ceo/api/breeds/image/random\n\nVous êtes trop mignon!` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
