module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .synonym <mot>' });
            const word = args[0];
            const synonyms = { 'heureux': ['joyeux', 'content', 'ravi'], 'triste': ['malheureux', 'abattu', 'déprimé'], 'beau': ['magnifique', 'splendide', 'superbe'] };
            const result = synonyms[word.toLowerCase()] || ['aucun', 'synonyme', 'trouvé'];
            await sock.sendMessage(from, { text: `📚 *SYNONYMES*\n\n📝 ${word}\n\n${result.join('\n')}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
