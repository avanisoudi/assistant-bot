const { isBotAdmin } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!(await isBotAdmin(sender, sock))) return await sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du bot' });

            await sock.sendMessage(from, {
                text: `♻️ *RESTAURATION*\n\nPour restaurer un backup:\n1. Envoie le fichier backup .json en réponse à ce message\n2. (Fonctionnalité de lecture de fichier à activer manuellement par le développeur)\n\n💡 Utilise .backup pour créer une sauvegarde d'abord`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
