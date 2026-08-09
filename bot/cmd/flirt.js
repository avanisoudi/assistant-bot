const FLIRT_LINES = [
    "Si t'étais un fruit, tu serais une fine-apple 🍍", "Es-tu un aimant ? Parce que je suis attiré(e) vers toi 🧲",
    "T'as un pansement ? Je me suis blessé(e) en tombant sous ton charme 🩹",
    "Est-ce qu'il fait chaud ici ou c'est juste toi ? 🔥", "Mon wifi a des barres... comme mon cœur pour toi 📶❤️",
    "Tu dois être fatigué(e), t'as couru dans mes pensées toute la journée 💭"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const line = FLIRT_LINES[Math.floor(Math.random() * FLIRT_LINES.length)];
            await sock.sendMessage(from, { text: `😘 ${line}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
