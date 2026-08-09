module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const timestamp = parseInt(args[0]);
            if (!args[0] || isNaN(timestamp)) return await sock.sendMessage(from, { text: '⏰ .timeago <timestamp unix>' });
            const diffMs = Date.now() - (timestamp * 1000);
            const diffMin = Math.floor(diffMs / 60000);
            const diffH = Math.floor(diffMin / 60);
            const diffD = Math.floor(diffH / 24);
            let result = diffD > 0 ? `${diffD} jour(s)` : diffH > 0 ? `${diffH} heure(s)` : `${diffMin} minute(s)`;
            await sock.sendMessage(from, { text: `⏰ Il y a ${result}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
