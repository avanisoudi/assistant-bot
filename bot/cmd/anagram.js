module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '🔀 .anagram <mot1> <mot2> — vérifie si ce sont des anagrammes' });
            const norm = w => w.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('');
            const isAnagram = norm(args[0]) === norm(args[1]);
            await sock.sendMessage(from, { text: `🔀 "${args[0]}" vs "${args[1]}"\n\n${isAnagram ? '✅ Ce sont des anagrammes !' : '❌ Ce ne sont pas des anagrammes'}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
