module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const jokes = [
                '😂 Pourquoi les plongeurs plongent-ils en arrière? Parce que sinon ils tombent dans le bateau!',
                '😂 Quel est le comble pour un électricien? De ne pas être au courant!',
                '😂 Pourquoi les poissons n\'aiment pas jouer au tennis? Parce qu\'ils ont peur du filet!',
                '😂 Qu\'est-ce qu\'un crocodile qui surveille la pharmacie? Un Lacoste-pharmacien!'
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(from, { text: joke });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
