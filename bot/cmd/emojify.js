const EMOJI_WORDS = { amour: '❤️', coeur: '❤️', feu: '🔥', argent: '💰', etoile: '⭐', soleil: '☀️', lune: '🌙', eau: '💧', musique: '🎵', fete: '🎉', triste: '😢', content: '😄', rire: '😂', ok: '👌', bien: '👍' };
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '😀 .emojify <texte> — ajoute des émojis pertinents' });
            let text = args.join(' ');
            for (const [word, emoji] of Object.entries(EMOJI_WORDS)) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                text = text.replace(regex, `${word} ${emoji}`);
            }
            await sock.sendMessage(from, { text });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
