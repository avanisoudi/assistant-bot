module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const dares = [
                "Envoie un message embarrassant au premier contact de ton téléphone",
                "Change ta photo de profil par une photo bizarre",
                "Fais une vidéo de toi en train de danser",
                "Appelle quelqu'un et dis-lui un compliment",
                "Envoie un emoji aléatoire à 5 personnes",
                "Crie \"Je suis fou!\" par ta fenêtre",
                "Marche à reculons pendant 5 minutes",
                "Fais un dessin avec ta main non-dominante",
                "Chante une chanson à haute voix",
                "Fais 10 pompes maintenant",
                "Demande un 'high-five' à un inconnu",
                "Mets du rouge à lèvres et prends une photo",
                "Danse devant le miroir pendant 2 minutes",
                "Fais une blague pourrie à quelqu'un",
                "Imite un animal pendant 30 secondes"
            ];

            const randomDare = dares[Math.floor(Math.random() * dares.length)];

            let text = `╭──────────────────────────╮\n`;
            text += `│   🎭 VÉRITÉ OU DÉFI       │\n`;
            text += `├──────────────────────────┤\n`;
            text += `│                          │\n`;
            text += `│  💪 *DÉFI*\n`;
            text += `│                          │\n`;
            text += `│  ${randomDare}\n`;
            text += `│                          │\n`;
            text += `│  ⏰ Tu as 30 minutes!   │\n`;
            text += `│                          │\n`;
            text += `╰──────────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la génération du défi"
            });
        }
    }
};
