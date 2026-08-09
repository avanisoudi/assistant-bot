const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam'];
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const count = Math.min(200, Math.max(5, parseInt(args[0]) || 30));
            let text = [];
            for (let i = 0; i < count; i++) text.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
            text = text.join(' ');
            text = text.charAt(0).toUpperCase() + text.slice(1) + '.';
            await sock.sendMessage(from, { text: `📝 *TEXTE LOREM IPSUM*\n\n${text}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
