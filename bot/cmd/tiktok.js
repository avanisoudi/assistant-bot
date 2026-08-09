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

            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);

            if (!response.data || response.data.code !== 0 || !response.data.data) {
                return await sock.sendMessage(from, { text: "❌ Vidéo introuvable ou lien invalide" });
            }

            const data = response.data.data;
            const videoUrl = data.play;
            const author = data.author?.nickname || "TikToker";
            const title = data.title || "Vidéo TikTok";

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
