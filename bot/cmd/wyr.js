const QUESTIONS = [
    ['avoir la téléportation', 'avoir l\'invisibilité'],
    ['être riche mais seul', 'être pauvre mais entouré d\'amis'],
    ['vivre sans musique', 'vivre sans films'],
    ['parler toutes les langues', 'jouer de tous les instruments'],
    ['pouvoir voler', 'respirer sous l\'eau'],
    ['perdre tes souvenirs', 'ne plus pouvoir en créer de nouveaux'],
    ['être toujours en retard', 'être toujours trop en avance'],
    ['vivre 1 an dans le passé', 'vivre 1 an dans le futur']
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const [a, b] = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
            await sock.sendMessage(from, { text: `🤔 *TU PRÉFÈRES...*\n\n1️⃣ ${a}\n\n🆚\n\n2️⃣ ${b}` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
