module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                const now = Math.floor(Date.now() / 1000);
                return await sock.sendMessage(from, { text: `⏱️ Timestamp Unix actuel: *${now}*` });
            }
            const timestamp = parseInt(args[0]);
            if (isNaN(timestamp)) return await sock.sendMessage(from, { text: '❌ Timestamp invalide' });
            const date = new Date(timestamp * 1000);
            await sock.sendMessage(from, { text: `⏱️ ${timestamp} correspond à:\n📅 ${date.toLocaleString('fr-FR')}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
