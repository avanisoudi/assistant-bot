module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .rhyme <mot>' });
            const word = args[0];
            const rhymes = { 'amour': ['jour', 'toujours', 'séjour'], 'vie': ['ami', 'pli', 'ici'], 'jour': ['amour', 'toujours', 'séjour'] };
            const result = rhymes[word.toLowerCase()] || ['aucun', 'résultat', 'trouvé'];
            await sock.sendMessage(from, { text: `🎵 *RIMES*\n\n📝 ${word}\n\n${result.join('\n')}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
