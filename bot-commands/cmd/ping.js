const https = require('https');

module.exports = {
    name: 'ping',
    description: 'Mesure la latence de connexion vers coincartel.kdns.fr',
    async execute(sock, msg, from, args) {
        const url = 'https://coincartel.kdns.fr';
        
        // Enregistrement du timestamp de départ
        const startTime = Date.now();

        // Petit message d'attente sur WhatsApp
        await sock.sendMessage(from, { text: '⚡ Connexion à coincartel.kdns.fr en cours...' }, { quoted: msg });

        // Test de connexion HTTPS
        https.get(url, (res) => {
            const endTime = Date.now();
            const latency = endTime - startTime;

            // Envoi des performances réseau
            sock.sendMessage(from, { 
                text: `✅ *Connexion établie !*\n\n🌐 *Cible :* coincartel.kdns.fr\n⏱️ *Latence :* \`${latency} ms\`\n📊 *Code HTTP :* ${res.statusCode}` 
            }, { quoted: msg });

        }).on('error', async (err) => {
            // Gestion des erreurs si le serveur est inaccessible
            await sock.sendMessage(from, { 
                text: `❌ *Échec de la connexion.*\n\nImpossible de joindre coincartel.kdns.fr.\nErreur : \`${err.message}\`` 
            }, { quoted: msg });
        });
    }
};

