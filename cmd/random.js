module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let min = 1;
            let max = 100;

            if (args.length >= 2) {
                min = parseInt(args[0]);
                max = parseInt(args[1]);

                if (isNaN(min) || isNaN(max)) {
                    return await sock.sendMessage(from, {
                        text: "❌ Usage: .random <min> <max>\n✓ Exemple: .random 1 100"
                    });
                }

                if (min > max) {
                    [min, max] = [max, min];
                }
            }

            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

            let text = `╭─────────────────────╮\n`;
            text += `│   🎲 NOMBRE ALÉATOIRE  │\n`;
            text += `├─────────────────────┤\n`;
            text += `│  Entre ${min} et ${max}      │\n`;
            text += `│                     │\n`;
            text += `│   🔢 *${randomNumber}*           │\n`;
            text += `│                     │\n`;
            text += `╰─────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la génération du nombre aléatoire"
            });
        }
    }
};
