module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `🔄 *MISES À JOUR*\n\nPour mettre à jour le bot, le propriétaire doit remplacer les fichiers et relancer avec:\n\nnpm install\nnode index.js\n\n💡 Utilise .version pour voir la version actuelle`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
