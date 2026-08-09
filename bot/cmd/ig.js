const { igdl } = require("ruhend-scraper");

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .ig <lien instagram>\n\n✓ Exemple: .ig https://www.instagram.com/p/..."
            });
        }

        try {
            const url = args[0];

            if (!url.includes('instagram.com')) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien Instagram valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement en cours... Patientez"
            });

            const result = await igdl(url);
            const media = result?.data || result?.result || [];

            if (!media.length) {
                return await sock.sendMessage(from, { text: "❌ Aucun média trouvé (contenu privé ou supprimé ?)" });
            }

            const first = media[0];
            const mediaUrl = first.url || first.download_url;

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
