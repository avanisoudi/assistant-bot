module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const questions = [
                '🔥 C\'est quoi ton pire défaut?',
                '🔥 Tu as déjà menti?',
                '🔥 Qui est la personne la plus attirante du groupe?',
                '🔥 Tu as un secret embarrassant?',
                '🔥 Qui dans le groupe t\'agace?'
            ];
            const q = questions[Math.floor(Math.random() * questions.length)];
            await sock.sendMessage(from, { text: `🔥 *QUESTION INDISCRÈTE*\n\n${q}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
