const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: "⏳ Recherche d'une blague... Patientez"
            });

            // Utiliser l'API JokeAPI pour obtenir une blague aléatoire
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=fr');
            
            let text = `╭──────────────────────────╮\n`;
            text += `│   😂 BLAGUE DU MOMENT     │\n`;
            text += `├──────────────────────────┤\n`;
            text += `│                          │\n`;

            if (response.data.type === 'single') {
                text += `│  ${response.data.joke}\n`;
            } else {
                text += `│  ${response.data.setup}\n`;
                text += `│  ...\n`;
                text += `│  ${response.data.delivery}\n`;
            }

            text += `│                          │\n`;
            text += `╰──────────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la récupération de la blague"
            });
        }
    }
};
