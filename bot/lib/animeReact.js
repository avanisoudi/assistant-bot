const axios = require('axios');

// Verbes affichés pour chaque type de réaction (texte en français, image en anglais/anime)
const VERBS = {
    hug: 'fait un câlin à', kiss: 'embrasse', pat: 'tapote la tête de', cry: 'pleure',
    poke: 'chatouille', nom: 'mordille', wink: 'fait un clin d\'œil à', slap: 'gifle',
    cuddle: 'câline', highfive: 'tape dans la main de', wave: 'salue', dance: 'danse avec',
    smile: 'sourit à', bite: 'mord', blush: 'rougit devant', bully: 'embête'
};

async function sendAnimeReaction(sock, msg, from, args, type) {
    try {
        const res = await axios.get(`https://api.waifu.pics/sfw/${type}`, { timeout: 10000 });
        const imageUrl = res.data?.url;
        if (!imageUrl) return await sock.sendMessage(from, { text: '❌ Erreur de récupération de l\'image' });

        const sender = msg.key.participant || msg.key.remoteJid;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const target = mentioned && mentioned[0];
        const verb = VERBS[type] || type;

        let caption = `${verb} !`;
        let mentions = [sender];
        if (target) {
            caption = `@${sender.split('@')[0]} ${verb} @${target.split('@')[0]} !`;
            mentions = [sender, target];
        }

        await sock.sendMessage(from, { image: { url: imageUrl }, caption, mentions });
    } catch (error) {
        console.error(`Erreur animeReact ${type}:`, error.message);
        await sock.sendMessage(from, { text: '❌ Erreur lors de la récupération de l\'image' });
    }
}

module.exports = { sendAnimeReaction };
