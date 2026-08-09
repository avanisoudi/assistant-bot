const MESSAGES = [
    "🌹 Une rose pour toi, pour illuminer ta journée !", "🌹 Que ta journée soit aussi belle qu'une rose épanouie",
    "🌹 Roseday : voici une fleur virtuelle pour te faire sourire", "🌹 Une rose, un sourire, une belle journée à toi !"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

            if (target) {
                await sock.sendMessage(from, { text: `${message}\n\nPour toi @${target.split('@')[0]} 🌹`, mentions: [target] });
            } else {
                await sock.sendMessage(from, { text: message });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
