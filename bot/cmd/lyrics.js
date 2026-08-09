const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .lyrics <chanson>' });
            const song = args.join(' ');

            const res = await axios.get(`https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(song)}`, { timeout: 10000 });
            const data = res.data;

            if (!data || (!data.lyrics && !data.title)) {
                return await sock.sendMessage(from, { text: `❌ Paroles introuvables pour "${song}"` });
            }

            // Par respect du droit d'auteur, on ne republie pas les paroles complètes :
            // juste un court extrait (première ligne) + les infos, avec renvoi vers une source légale.
            const firstLine = (data.lyrics || '').split('\n').find(l => l.trim().length > 0) || '';

            let text = `🎵 *${data.title || song}*\n`;
            if (data.artist) text += `👤 ${data.artist}\n`;
            text += `\n"${firstLine.slice(0, 80)}${firstLine.length > 80 ? '...' : ''}"\n\n`;
            text += `📖 Paroles complètes (respect des droits d'auteur):\nhttps://genius.com/search?q=${encodeURIComponent(song)}`;

            await sock.sendMessage(from, { text });
        } catch (error) {
            console.error('Erreur lyrics:', error);
            await sock.sendMessage(from, { text: `❌ Erreur lors de la recherche.\n\n📖 Essaie: https://genius.com/search?q=${encodeURIComponent(args.join(' '))}` });
        }
    }
};
