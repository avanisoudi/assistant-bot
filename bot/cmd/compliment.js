const COMPLIMENTS = [
    "a un sourire qui illumine la pièce ✨", "est quelqu'un de vraiment inspirant 🌟",
    "a un goût impeccable 👌", "rend cette conversation bien meilleure 💬",
    "a une énergie positive contagieuse ⚡", "est plus intelligent(e) qu'il/elle ne le pense 🧠",
    "mérite tout le bonheur du monde 🍀", "a un sens de l'humour excellent 😄",
    "est quelqu'un sur qui on peut compter 🤝", "illumine la journée de tout le monde ☀️"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const compliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

            if (target) {
                await sock.sendMessage(from, { text: `💝 @${target.split('@')[0]} ${compliment}`, mentions: [target] });
            } else {
                await sock.sendMessage(from, { text: `💝 Tu ${compliment.replace(/^a /, 'as ').replace(/^est /, 'es ')}` });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
