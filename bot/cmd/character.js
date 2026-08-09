const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🎭 .character <nom du personnage anime>\nExemple: .character Naruto' });

            const query = args.join(' ');
            const res = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 });
            const character = res.data?.data?.[0];

            if (!character) return await sock.sendMessage(from, { text: `❌ Personnage "${query}" introuvable` });

            const text = `🎭 *${character.name}*\n\n${character.name_kanji ? `🈶 ${character.name_kanji}\n` : ''}❤️ Favoris: ${character.favorites?.toLocaleString() || 'N/A'}\n\n🔗 ${character.url}`;

            await sock.sendMessage(from, { image: { url: character.images?.jpg?.image_url }, caption: text });
        } catch (error) {
            console.error('Erreur character:', error.message);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la recherche' });
        }
    }
};
