module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const movies = ['Inception', 'Avatar', 'Interstellar', 'Pulp Fiction', 'Parasite', 'The Matrix', 'Titanic', 'Gladiator'];
            const movie = movies[Math.floor(Math.random() * movies.length)];
            await sock.sendMessage(from, { text: `🎬 *FILM RECOMMANDÉ*\n\n${movie}\n\n⭐⭐⭐⭐⭐\n\nVous devriez regarder ce film!` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
