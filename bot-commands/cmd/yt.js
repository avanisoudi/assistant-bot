const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .yt <lien youtube>\n\n✓ Exemple: .yt https://www.youtube.com/watch?v=..."
            });
        }

        try {
            const url = args[0];
            
            // Vérifier si c'est un lien YouTube
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien YouTube valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement YouTube en cours... Patientez (peut prendre du temps)"
            });

            // Vous devez utiliser une API de téléchargement YouTube
            const response = await axios.get(`https://api.example.com/youtube?url=${encodeURIComponent(url)}`);
            
            const videoUrl = response.data.download_url;
            const title = response.data.title || "Vidéo YouTube";
            const channel = response.data.channel || "Chaîne";

            await sock.sendMessage(from, {
                video: { url: videoUrl },
                caption: `✦ ${title}\n🎬 ${channel}`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du téléchargement\n• Lien invalide\n• Vidéo trop longue\n• Vidéo protégée par droits d'auteur"
            });
        }
    }
};
