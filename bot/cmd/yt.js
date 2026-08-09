const ytdl = require('@distube/ytdl-core');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .yt <lien youtube>\n\n✓ Exemple: .yt https://www.youtube.com/watch?v=..."
            });
        }

        try {
            const url = args[0];

            if (!ytdl.validateURL(url)) {
                return await sock.sendMessage(from, {
                    text: "❌ Veuillez fournir un lien YouTube valide"
                });
            }

            await sock.sendMessage(from, {
                text: "⏳ Téléchargement YouTube en cours... Patientez (peut prendre du temps)"
            });

            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const channel = info.videoDetails.author?.name || "Chaîne";
            const durationSec = parseInt(info.videoDetails.lengthSeconds || '0');

            if (durationSec > 600) {
                return await sock.sendMessage(from, { text: '❌ Vidéo trop longue (max 10 minutes pour éviter les envois trop lourds)' });
            }

            // Format le plus léger avec audio+vidéo combinés
            const format = ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'audioandvideo' });
            if (!format) {
                return await sock.sendMessage(from, { text: '❌ Aucun format téléchargeable trouvé pour cette vidéo' });
            }

            await sock.sendMessage(from, {
                video: { url: format.url },
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
