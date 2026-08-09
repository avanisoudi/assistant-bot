const QUOTES = [
    "\"Il n'y a pas de hasard.\" — Maître Oogway 🐢",
    "\"Hier est de l'histoire, demain est un mystère, mais aujourd'hui est un cadeau. C'est pourquoi on l'appelle le présent.\" — Maître Oogway 🐢",
    "\"Ton esprit est comme cette eau, mon ami. Quand il est agité, il est difficile de voir. Mais si tu le laisses se calmer, la réponse devient claire.\" — Maître Oogway 🐢",
    "\"On ne peut pas toujours contrôler ce qui va fleurir, mais on peut contrôler quelles graines on plante.\" — Maître Oogway 🐢",
    "\"Parfois, il suffit de croire.\" — Maître Oogway 🐢"
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            await sock.sendMessage(from, { text: quote });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
