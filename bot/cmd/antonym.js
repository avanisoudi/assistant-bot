module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .antonym <mot>' });
            const word = args[0];
            const antonyms = { 'noir': 'blanc', 'grand': 'petit', 'heureux': 'triste', 'chaud': 'froid' };
            const result = antonyms[word.toLowerCase()] || 'non trouvé';
            await sock.sendMessage(from, { text: `📚 *ANTONYME*\n\n📝 ${word}\n\n❌ ${result}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
