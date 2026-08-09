const axios = require('axios');
const { startGenerating } = require('../lib/generatingAnimation');

// Pollinations.ai en source principale (gratuit, sans clé, activement maintenu),
// shizoapi en repli si jamais indisponible.
async function tryGenerate(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 45000 });
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
        // L'API a répondu mais avec autre chose qu'une image (souvent une erreur JSON) —
        // sans cette vérification, on enverrait un "buffer" invalide à WhatsApp qui
        // échoue silencieusement, exactement le symptôme "fichier non disponible".
        throw new Error(`Réponse non-image reçue (${contentType})`);
    }
    return Buffer.from(response.data);
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        let animation = { stop: async () => {} };
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .sora <description>' });
            const prompt = args.join(' ');

            animation = await startGenerating(sock, from, '🎨 Génération de ton image');
            await sock.sendPresenceUpdate('composing', from).catch(() => {});

            let imageBuffer;
            try {
                imageBuffer = await tryGenerate(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
            } catch (e1) {
                console.error('Pollinations échoué, tentative shizoapi:', e1.message);
                imageBuffer = await tryGenerate(`https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(prompt)}`);
            }

            await animation.stop('✅ Image générée !');
            await sock.sendMessage(from, { image: imageBuffer, caption: `🎨 "${prompt}"` });
        } catch (error) {
            console.error('Erreur sora:', error.message);
            await animation.stop();
            await sock.sendMessage(from, { text: '❌ Erreur lors de la génération (les deux services IA image sont indisponibles pour le moment, réessaie plus tard)' });
        }
    }
};
