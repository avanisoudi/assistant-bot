module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📱 .apk <nom de l\'application>\nExemple: .apk whatsapp' });

            const query = args.join(' ');
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;

            await sock.sendMessage(from, {
                text: `📱 *RECHERCHE APK: ${query}*\n\n🔗 ${searchUrl}\n\n⚠️ Je ne peux pas garantir la fiabilité d'un service de téléchargement direct d'APK sans risquer de t'envoyer un fichier corrompu ou non autorisé. Ce lien pointe vers une source de confiance où télécharger toi-même en sécurité.`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
