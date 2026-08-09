const MESSAGES = [
    "🌙 Bonne nuit ! Que tes rêves soient doux ✨", "😴 Dodo bien mérité, à demain !",
    "🌟 Que la nuit t'apporte du repos et de belles étoiles", "🛏️ Bonne nuit et fais de beaux rêves !",
    "🌛 Il est temps de se reposer, bonne nuit à toi !"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const msg_text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            await sock.sendMessage(from, { text: msg_text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
