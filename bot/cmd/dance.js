const { sendAnimeReaction } = require('../lib/animeReact');

module.exports = {
    execute: async (sock, msg, from, args) => {
        await sendAnimeReaction(sock, msg, from, args, 'dance');
    }
};
