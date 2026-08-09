module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📊 .wordcount <texte>' });
            const text = args.join(' ');
            const words = text.trim().split(/\s+/).length;
            await sock.sendMessage(from, { text: `📊 *${words}* mot(s)` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
