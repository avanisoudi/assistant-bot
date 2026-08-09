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

            if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien Facebook valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement en cours... Patientez"
            });

            const response = await axios.get(`https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(url)}`, {
                timeout: 20000,
                headers: { 'accept': '*/*', 'User-Agent': 'Mozilla/5.0' }
            });

            const data = response.data?.result || response.data?.data || response.data;
            const videoUrl = data?.hd || data?.sd || data?.url;

            if (!videoUrl) {
                return await sock.sendMessage(from, { text: "❌ Vidéo introuvable (lien privé ou service indisponible)" });
            }

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
