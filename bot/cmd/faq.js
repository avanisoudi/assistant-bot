module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `❓ *FAQ*\n\n*Le bot ne répond pas?*\nVérifie qu'il est bien en ligne et que tu utilises le bon préfixe (.)\n\n*Comment devenir admin du bot?*\nSeul le propriétaire peut définir des admins.\n\n*Comment gagner des coins?*\nUtilise .daily, .work, .mining, .hunt, .treasure régulièrement.\n\n*Le bot a un bug?*\nSignale-le avec .bug <description>`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
