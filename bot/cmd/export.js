const { getUser } = require('../lib/economy');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const user = getUser(sender);
            const data = JSON.stringify(user, null, 2);

            await sock.sendMessage(from, {
                document: Buffer.from(data, 'utf-8'),
                mimetype: 'application/json',
                fileName: 'mes_donnees.json'
            });
        } catch (error) {
            console.error('Erreur export:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de l\'export' });
        }
    }
};
