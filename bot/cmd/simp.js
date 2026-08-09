const axios = require('axios');
const { getAvatarUrl } = require('../lib/overlayEffects');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const avatar = await getAvatarUrl(sock, msg, args);
            const url = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatar)}`;
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
            await sock.sendMessage(from, { image: Buffer.from(response.data), caption: '🃏 Carte de simp générée' });
        } catch (error) {
            console.error('Erreur simp:', error.message);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la génération' });
        }
    }
};
