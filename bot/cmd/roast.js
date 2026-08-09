const ROASTS = [
    "T'es tellement lent(e) que même le chargement du wifi te dépasse 🐢",
    "T'as le potentiel d'un chargeur sans câble 🔌",
    "Si la bêtise volait, tu serais en business class ✈️",
    "T'es aussi utile qu'un parapluie dans le désert ☔",
    "T'as la répartie d'une pizza froide 🍕"
];
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
            if (target) {
                await sock.sendMessage(from, { text: `🔥 @${target.split('@')[0]} ${roast}\n\n_(pour rire entre amis 😄)_`, mentions: [target] });
            } else {
                await sock.sendMessage(from, { text: '🔥 .roast @user' });
            }
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
