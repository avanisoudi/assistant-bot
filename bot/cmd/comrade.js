const MESSAGES = [
    "☭ Salutations, camarade ! La solidarité avant tout ✊",
    "☭ Ensemble nous sommes plus forts, camarade !",
    "☭ Pour le collectif, camarade !",
    "☭ En avant, camarade, la victoire nous attend !"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            await sock.sendMessage(from, { text: message });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
