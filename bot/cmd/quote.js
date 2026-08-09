const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: "⏳ Recherche d'une citation... Patientez"
            });

            // Utiliser l'API quotable.io pour obtenir une citation aléatoire
            const response = await axios.get('https://api.quotable.io/random');
            
            const quote = response.data.content;
            const author = response.data.author.replace(', type.fit', '');

            let text = `╭─────────────────────╮\n`;
            text += `│   💭 CITATION DU JOUR  │\n`;
            text += `├─────────────────────┤\n`;
            text += `│                     │\n`;
            text += `│  "${quote}"\n`;
            text += `│                     │\n`;
            text += `│  ✍️ ${author}      │\n`;
            text += `│                     │\n`;
            text += `╰─────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la récupération de la citation"
            });
        }
    }
};
