module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: `🔀 .shuffle <mot1> <mot2> <mot3>...\nMélange une liste d'éléments` });
            const shuffled = [...args];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            await sock.sendMessage(from, { text: `🔀 *MÉLANGÉ*\n\n${shuffled.join(' → ')}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
