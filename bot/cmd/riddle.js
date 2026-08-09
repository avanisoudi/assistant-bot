const RIDDLES = [
    { q: 'Je n\'ai pas de corps mais je grandis, pas de bouche mais l\'eau me tue. Qui suis-je?', a: 'le feu' },
    { q: 'Plus j\'en enlève, plus je grandis. Que suis-je?', a: 'un trou' },
    { q: 'Je vole sans ailes, je pleure sans yeux. Qui suis-je?', a: 'un nuage' },
    { q: 'Qu\'est-ce qui a des clés mais n\'ouvre aucune porte?', a: 'un piano' },
    { q: 'Plus il y en a, moins on y voit. Qu\'est-ce que c\'est?', a: 'le brouillard' },
    { q: 'On me lance en l\'air blanche, je descends jaune, et on me mange verte. Que suis-je?', a: 'une olive' }
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args[0] === 'reveal' && global.lastRiddle && global.lastRiddle[from]) {
                const answer = global.lastRiddle[from];
                delete global.lastRiddle[from];
                return await sock.sendMessage(from, { text: `💡 Réponse: *${answer}*` });
            }

            const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
            if (!global.lastRiddle) global.lastRiddle = {};
            global.lastRiddle[from] = riddle.a;

            await sock.sendMessage(from, { text: `🧩 *DEVINETTE*\n\n${riddle.q}\n\n💡 Tape .riddle reveal pour voir la réponse` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
