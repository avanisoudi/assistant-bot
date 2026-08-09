const axios = require('axios');

async function getAvatarUrl(sock, msg, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const target = (mentioned && mentioned[0]) || msg.key.participant || msg.key.remoteJid;
    try {
        return await sock.profilePictureUrl(target, 'image');
    } catch {
        // Pas de photo de profil ou confidentialité activée : image par défaut
        return 'https://i.imgur.com/2wzGhpF.jpeg';
    }
}

async function sendOverlayEffect(sock, msg, from, args, endpoint, caption) {
    try {
        const avatar = await getAvatarUrl(sock, msg, args);
        const url = `https://some-random-api.com/canvas/overlay/${endpoint}?avatar=${encodeURIComponent(avatar)}`;

        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
        const buffer = Buffer.from(response.data);

        const isGif = response.headers['content-type']?.includes('gif');
        await sock.sendMessage(from, isGif ? { video: buffer, gifPlayback: true, caption } : { image: buffer, caption });
    } catch (error) {
        console.error(`Erreur overlay ${endpoint}:`, error.message);
        await sock.sendMessage(from, { text: `❌ Erreur lors de la génération (service temporairement indisponible)` });
    }
}

module.exports = { sendOverlayEffect, getAvatarUrl };
