module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `✨ *CRÉDITS*\n\n🤖 AssistantBot\n👨‍💻 Créé par: AVANI SOUDI\n⚙️ Basé sur: Baileys (WhatsApp Web API)\n\n🙏 Merci d'utiliser ce bot!`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
