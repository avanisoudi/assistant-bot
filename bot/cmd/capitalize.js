module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔠 .capitalize <texte>' });
            const text = args.join(' ');
            await sock.sendMessage(from, { text: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
