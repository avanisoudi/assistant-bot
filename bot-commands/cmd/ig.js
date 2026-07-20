const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .ig <lien instagram>\n\n✓ Exemple: .ig https://www.instagram.com/p/..."
            });
        }

        try {
            const url = args[0];
            
            // Vérifier si c'est un lien Instagram
            if (!url.includes('instagram.com')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien Instagram valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement en cours... Patientez"
            });

            // Vous devez utiliser une API de téléchargement Instagram
            const response = await axios.get(`https://api.example.com/instagram?url=${encodeURIComponent(url)}`);
            
            const mediaUrl = response.data.download_url;

            await sock.sendMessage(from, {
                video: { url: mediaUrl },
                caption: "✦ Contenu Instagram téléchargé!"
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du téléchargement\n• Vérifiez le lien\n• Le contenu est peut-être supprimé"
            });
        }
    }
};
