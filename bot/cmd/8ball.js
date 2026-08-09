module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const answers = [
                '✅ Oui, absolument!',
                '❌ Non, certainement pas',
                '🤔 Peut-être, c\'est flou',
                '✨ Les signes disent oui',
                '💫 Pas maintenant',
                '😏 À toi de décider',
                '🎯 Sans doute',
                '⚠️ Évite',
                '🔮 Peut-être plus tard',
                '💪 Absolument!',
                '😅 Demande à quelqu\'un d\'autre',
                '🌟 Les étoiles l\'interdisent'
            ];

            const answer = answers[Math.floor(Math.random() * answers.length)];
            await sock.sendMessage(from, { text: `🔮 *8BALL*\n\n${answer}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
