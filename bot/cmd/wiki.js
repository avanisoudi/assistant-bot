module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .wiki <sujet>' });
            const topic = args.join(' ');
            await sock.sendMessage(from, { text: `📖 *WIKIPEDIA: ${topic}*\n\n${topic} est un terme qui...\n\n📝 Article complet sur Wikipedia` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
