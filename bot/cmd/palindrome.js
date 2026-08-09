module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔄 .palindrome <mot ou phrase>' });
            const text = args.join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
            const isPalindrome = text === text.split('').reverse().join('');
            await sock.sendMessage(from, { text: `🔄 "${args.join(' ')}"\n\n${isPalindrome ? '✅ C\'est un palindrome !' : '❌ Ce n\'est pas un palindrome'}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
