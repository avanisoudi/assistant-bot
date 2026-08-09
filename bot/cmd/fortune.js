const FORTUNES = [
    "🥠 Une bonne nouvelle arrivera bientôt vers toi",
    "🥠 La patience que tu montres aujourd'hui portera ses fruits",
    "🥠 Un ami proche a besoin de ton soutien",
    "🥠 Une opportunité inattendue va se présenter",
    "🥠 Ton travail acharné sera bientôt récompensé",
    "🥠 Un voyage se profile à l'horizon"
];
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, { text: FORTUNES[Math.floor(Math.random() * FORTUNES.length)] });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
