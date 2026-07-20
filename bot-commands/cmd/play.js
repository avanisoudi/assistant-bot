const axios = require('axios');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) {
            return await sock.sendMessage(from, {
                text: "❌ Usage: .play <nom de la chanson>\n\n✓ Exemple: .play Blinding Lights The Weeknd"
            });
        }

        try {
            const query = args.join(' ');

            await sock.sendMessage(from, {
                text: "⏳ Recherche de la musique... Patientez"
            });

            // Vous devez utiliser une API de téléchargement musical
            const response = await axios.get(`https://api.example.com/play?q=${encodeURIComponent(query)}`);
            
            const audioUrl = response.data.download_url;
            const title = response.data.title || query;
            const artist = response.data.artist || "Artiste";

            await sock.sendMessage(from, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg'
            });

            await sock.sendMessage(from, {
                text: `✦ ${title}\n🎵 ${artist}\n\n✅ Téléchargé avec succès!`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la recherche\n• Vérifiez le nom de la chanson\n• Réessayez avec un artiste plus connu"
            });
        }
    }
};
