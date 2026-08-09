module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .define <mot>' });
            
            const word = args[0];
            const definitions = {
                'amour': '❤️ Sentiment profond d\'affection et d\'attachement envers quelqu\'un',
                'intelligence': '🧠 Capacité de comprendre, apprendre et résoudre des problèmes',
                'beauté': '✨ Qualité de ce qui plaît à l\'œil ou à l\'esprit',
                'courage': '💪 Force morale pour affronter le danger ou la difficulté',
                'bonheur': '😊 État de satisfaction et de bien-être',
                'liberté': '🕊️ État de celui qui n\'est pas prisonnier ou esclave'
            };

            const definition = definitions[word.toLowerCase()] || '🤔 Définition non trouvée';
            
            await sock.sendMessage(from, { text: `📚 *DÉFINITION*\n\n📝 ${word}\n\n${definition}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
