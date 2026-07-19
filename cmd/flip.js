module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const flip = Math.random() < 0.5 ? 'PILE' : 'FACE';
            const emoji = flip === 'PILE' ? '🪙' : '🎪';

            let text = `╭─────────────────────╮\n`;
            text += `│   ${emoji} PILE OU FACE    │\n`;
            text += `├─────────────────────┤\n`;
            text += `│                     │\n`;
            text += `│      ${flip}        │\n`;
            text += `│                     │\n`;
            text += `╰─────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du lancer de la pièce"
            });
        }
    }
};
