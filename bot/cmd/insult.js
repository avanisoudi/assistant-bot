const INSULTS = [
    "a le charisme d'une porte de placard 🚪", "réfléchit à la vitesse d'Internet en 1998 🐌",
    "a autant de talent qu'un caillou pour danser 🪨", "est aussi discret(e) qu'une alarme incendie 🚨",
    "a un plan aussi solide qu'un château de sable 🏖️", "brille par son absence de logique 💡❌",
    "a le sens de l'orientation d'un GPS cassé 🧭"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];

            if (!target) return await sock.sendMessage(from, { text: '😏 .insult @user (pour rire entre amis uniquement!)' });
            await sock.sendMessage(from, { text: `😏 @${target.split('@')[0]} ${insult}\n\n_(juste pour rire 😄)_`, mentions: [target] });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
