module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .fakecall <nom de la personne>\n\n✓ Exemple: .fakecall Sara"
            });
        }

        try {
            const name = args.join(' ');

            // Créer un faux appel
            let text = `╭──────────────────────╮\n`;
            text += `│                      │\n`;
            text += `│     ☎️ APPEL ENTRANT   │\n`;
            text += `│                      │\n`;
            text += `│    📱 ${name}\n`;
            text += `│                      │\n`;
            text += `│  🔴 Dur    🟢 Répon   │\n`;
            text += `│                      │\n`;
            text += `╰──────────────────────╯\n\n`;
            text += `⏰ En appel depuis: 0:05`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la création du faux appel"
            });
        }
    }
};
