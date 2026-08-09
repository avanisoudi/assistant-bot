module.exports = {
    execute: async (sock, msg, from, args) => {
        const quiz = require('./quiz.js');
        // Seulement au lancement (aucune sous-commande) on force la catégorie anime ;
        // pour .quiz_anime join / .quiz_anime <lettre>, on laisse passer tel quel
        // pour ne pas casser la logique de session déjà en cours.
        const finalArgs = args.length === 0 ? ['anime'] : args;
        return quiz.execute(sock, msg, from, finalArgs);
    }
};
