module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const mins = Math.floor((uptime % 3600) / 60);
            const secs = Math.floor(uptime % 60);

            await sock.sendMessage(from, {
                text: `⏱️ *UPTIME DU BOT*\n\n📅 ${days}j ${hours}h ${mins}m ${secs}s`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
