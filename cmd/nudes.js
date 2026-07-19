module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let text = `╭──────────────────╮\n`;
            text += `│  📸 *NUDES*       │\n`;
            text += `╰──────────────────╯\n\n`;
            text += `[*Image indisponible*]\n\n`;
            text += `Désolé! Le serveur Discord où je stocke mes photos s'est crashé... 😅\n\n`;
            text += `Réessayez plus tard! 💋`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur"
            });
        }
    }
};
