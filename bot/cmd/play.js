module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) {
                return await sock.sendMessage(from, {
                    text: "🎵 *PLAY* - Télécharger une musique\n\n*Usage:*\n.play <nom de la chanson>\n\n*Exemple:*\n.play Blinding Lights\n.play Shape of You Ed Sheeran\n\n⚠️ *Note:* Cette commande nécessite une API de téléchargement de musique configurée.\n\nPour utiliser:\n• Configurez une API musicale\n• Remplacez l'URL dans play.js\n• Redémarrez le bot"
                });
            }

            const query = args.join(' ');

            // Message d'attente
            const waitMsg = await sock.sendMessage(from, {
                text: `⏳ Recherche de *"${query}"*...\n\n🎵 Patientez...`
            });

            // Pour le moment, affichage d'un message informatif
            // Une fois l'API configurée, remplacez le code ci-dessous
            
            await sock.sendMessage(from, {
                text: `⚠️ *Configuration requise*\n\n🎵 Chanson recherchée: *${query}*\n\n📋 Pour activer le téléchargement de musique:\n\n1. Allez sur: https://rapidapi.com\n2. Cherchez "YouTube Music Downloader"\n3. Obtenez votre clé API\n4. Modifiez le fichier cmd/play.js\n5. Remplacez l'URL de l'API\n6. Redémarrez le bot\n\n🔧 Guide: Consultez GUIDE_CONFIGURATION_API.txt`
            });

            // Code à décommenter une fois l'API configurée:
            /*
            const axios = require('axios');
            const response = await axios.get(`YOUR_API_URL?q=${encodeURIComponent(query)}`);
            const audioUrl = response.data.download_url;
            const title = response.data.title || query;
            const artist = response.data.artist || "Artiste inconnu";

            await sock.sendMessage(from, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: false
            });

            await sock.sendMessage(from, {
                text: `✅ *${title}*\n🎤 ${artist}`
            });
            */

        } catch (error) {
            console.error('Erreur play:', error);
            await sock.sendMessage(from, {
                text: `❌ Erreur: ${error.message}\n\nVérifiez la configuration de l'API de musique`
            });
        }
    }
};
