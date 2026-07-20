module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let text = `╭─────────────────────╮\n`;
            text += `│   🎮 TIC TAC TOE   │\n`;
            text += `╰─────────────────────╯\n\n`;
            text += `│ 1 │ 2 │ 3 │\n`;
            text += `├───┼───┼───┤\n`;
            text += `│ 4 │ 5 │ 6 │\n`;
            text += `├───┼───┼───┤\n`;
            text += `│ 7 │ 8 │ 9 │\n`;
            text += `└───┴───┴───┘\n\n`;
            text += `✓ Tapez le numéro de la case (1-9)\n`;
            text += `✓ Vous êtes X, Le bot est O\n`;
            text += `✓ Utilisez: .tictac <numéro>`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du lancement du jeu"
            });
        }
    }
};
