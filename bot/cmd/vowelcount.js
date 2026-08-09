module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔤 .vowelcount <texte>' });
            const text = args.join(' ').toLowerCase();
            const count = (text.match(/[aeiouyàâäéèêëïîôöùûü]/g) || []).length;
            await sock.sendMessage(from, { text: `🔤 *${count}* voyelle(s) dans "${args.join(' ')}"` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
