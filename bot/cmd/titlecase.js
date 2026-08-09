module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔤 .titlecase <texte>' });
            const result = args.join(' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            await sock.sendMessage(from, { text: result });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
