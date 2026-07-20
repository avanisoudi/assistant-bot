const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .fb <lien facebook>\n\n✓ Exemple: .fb https://www.facebook.com/video/..."
            });
        }

        try {
            const url = args[0];
            
            // Vérifier si c'est un lien Facebook
            if (!url.includes('facebook.com')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien Facebook valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement en cours... Patientez"
            });

            // Vous devez utiliser une API de téléchargement Facebook
            // Exemple avec une API gratuite (à configurer selon vos besoins)
            const response = await axios.get(`https://api.example.com/facebook?url=${encodeURIComponent(url)}`);
            
            const videoUrl = response.data.download_url;

            await sock.sendMessage(from, {
                video: { url: videoUrl },
                caption: "✦ Vidéo Facebook téléchargée avec succès!"
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du téléchargement\n• Vérifiez le lien\n• La vidéo est peut-être privée"
            });
        }
    }
};
