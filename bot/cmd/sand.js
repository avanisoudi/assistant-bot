const { generateTextEffect } = require('../lib/textEffects');

module.exports = {
    execute: async (sock, msg, from, args) => {
        await generateTextEffect(sock, from, args, 'sand');
    }
};
