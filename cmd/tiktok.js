const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .tiktok <lien tiktok>\n\n✓ Exemple: .tiktok https://www.tiktok.com/@user/video/..."
            });
        }

        try {
            const url = args[0];
            
            // Vérifier si c'est un lien TikTok
            if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien TikTok valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement TikTok en cours... Patientez"
            });

            // Vous devez utiliser une API de téléchargement TikTok
            const response = await axios.get(`https://api.example.com/tiktok?url=${encodeURIComponent(url)}`);
            
            const videoUrl = response.data.download_url;
            const author = response.data.author || "TikToker";
            const title = response.data.title || "Vidéo TikTok";

            await sock.sendMessage(from, {
                video: { url: videoUrl },
                caption: `✦ ${title}\n👤 Par: ${author}`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors du téléchargement\n• Vérifiez le lien\n• Assurez-vous que la vidéo est publique"
            });
        }
    }
};
