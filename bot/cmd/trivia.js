module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const questions = [
                { q: 'Quel est le plus grand océan?', a: 'L\'océan Pacifique' },
                { q: 'En quelle année l\'homme a marché sur la Lune?', a: '1969' },
                { q: 'Quel est le plus haut montagne du monde?', a: 'L\'Everest' },
                { q: 'Qui a peint la Joconde?', a: 'Léonard de Vinci' },
                { q: 'Quel est le pays le plus peuplé?', a: 'L\'Inde' }
            ];

            const question = questions[Math.floor(Math.random() * questions.length)];
            
            await sock.sendMessage(from, { text: `🧠 *TRIVIA*\n\n❓ ${question.q}\n\n📝 Réponse: ||${question.a}||` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
