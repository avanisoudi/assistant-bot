module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            let text = `╭──────────────────────────╮\n`;
            text += `│   ⚠️ ATTENTION ⚠️        │\n`;
            text += `├──────────────────────────┤\n`;
            text += `│                          │\n`;
            text += `│  🚫 CONTENU ADULTE      │\n`;
            text += `│                          │\n`;
            text += `│  ❌ Cette commande      │\n`;
            text += `│  n'est pas disponible   │\n`;
            text += `│  dans ce bot!           │\n`;
            text += `│                          │\n`;
            text += `│  📌 Merci d'utiliser   │\n`;
            text += `│  d'autres commandes    │\n`;
            text += `│                          │\n`;
            text += `╰──────────────────────────╯`;

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
