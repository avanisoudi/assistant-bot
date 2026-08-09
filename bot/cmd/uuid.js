const crypto = require('crypto');
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, { text: `🆔 ${crypto.randomUUID()}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
