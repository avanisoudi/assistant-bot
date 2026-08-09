const LINES = [
    "Tu crois au coup de foudre ou je dois repasser devant toi ? ⚡",
    "Excuse-moi, tu as fait tomber quelque chose : mon cœur 💓",
    "T'es fatigué(e) ? Parce que tu as couru dans mes pensées toute la journée 💭",
    "Si être beau/belle était un crime, tu serais en prison à vie 🚔"
];
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const line = LINES[Math.floor(Math.random() * LINES.length)];
            await sock.sendMessage(from, { text: `😏 ${line}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
