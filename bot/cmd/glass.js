const { sendOverlayEffect } = require('../lib/overlayEffects');
module.exports = {
    execute: async (sock, msg, from, args) => {
        await sendOverlayEffect(sock, msg, from, args, 'glass', '🥃 GLASS');
    }
};
