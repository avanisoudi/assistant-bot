const { isBotAdmin } = require('../lib/botAdmins');

module.exports = {
    execute: async (sock, msg, from, args) => {
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!(await isBotAdmin(sender, sock))) return await sock.sendMessage(from, { text: '❌ Réservé aux administrateurs du bot' });

        await sock.sendMessage(from, {
            text: '🔄 Redémarrage du bot...\n⏳ Patientez quelques secondes'
        });

        setTimeout(() => {
            process.exit(0);
        }, 2000);
    }
};
