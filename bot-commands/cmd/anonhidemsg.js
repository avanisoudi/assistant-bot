module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .anonhidemsg <texte>\n\n✓ Exemple: .anonhidemsg C'est un secret!"
            });
        }

        try {
            const message = args.join(' ');

            // Créer un message stylisé
            let text = `╭─────────────────\n`;
            text += `│  📬 *MESSAGE ANONYME*\n`;
            text += `│─────────────────\n`;
            text += `│\n`;
            text += `│  ${message}\n`;
            text += `│\n`;
            text += `│  ⚠️ Cet appel provient d'un numéro privé\n`;
            text += `╰─────────────────`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de l'envoi du message"
            });
        }
    }
};
