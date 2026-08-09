module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📏 .charcount <texte>' });
            const text = args.join(' ');
            await sock.sendMessage(from, { text: `📏 *${text.length}* caractères (${text.replace(/\s/g, '').length} sans espaces)` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
