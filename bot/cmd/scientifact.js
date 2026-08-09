module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const facts = [
                '🔬 Le miel ne pourrit jamais! On en a trouvé en Égypte 3000 ans plus tard',
                '🧠 Les abeilles ont une meilleure mémoire que les humains',
                '⚡ Un éclair est 5 fois plus chaud que la surface du soleil',
                '🌊 Les océans contiennent 99% de l\'espace de vie de la Terre',
                '🦑 Les pieuvres ont 3 cœurs et du sang bleu'
            ];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            await sock.sendMessage(from, { text: `🔬 *FAIT SCIENTIFIQUE*\n\n${fact}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
