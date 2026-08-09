module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔠 .acronym <phrase>' });
            const acronym = args.map(w => w[0]?.toUpperCase() || '').join('');
            await sock.sendMessage(from, { text: `🔠 ${acronym}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
