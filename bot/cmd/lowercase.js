module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔡 .lowercase <texte>' });
            await sock.sendMessage(from, { text: args.join(' ').toLowerCase() });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
