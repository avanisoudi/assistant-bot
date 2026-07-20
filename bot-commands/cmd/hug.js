module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const hugs = [
                "*(っ˘̩╭╮˘̩)っ* - Gros câlin!",
                "*┏(・o･)・ﾟ・。* - Câlin réconfortant!",
                "*(´｀༎ຶ╭╮༎ຶ´`)* - Câlin doux!",
                "*༼ っ ˕ ͟ʖ˕ ༽つ* - Câlin chaleureux!",
                "*(´▽`*)っ* - Câlin joyeux!",
                "*(・´∀｀・)و* - Câlin énergique!"
            ];

            const randomHug = hugs[Math.floor(Math.random() * hugs.length)];

            await sock.sendMessage(from, {
                text: `✦ *CÂLIN* ✦\n\n${randomHug}`
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de l'envoi du câlin"
            });
        }
    }
};
