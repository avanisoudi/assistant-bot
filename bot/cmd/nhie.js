const QUESTIONS = [
    "Je n'ai jamais menti à mes parents",
    "Je n'ai jamais séché les cours",
    "Je n'ai jamais eu le cœur brisé",
    "Je n'ai jamais chanté sous la douche",
    "Je n'ai jamais fait semblant d'être malade pour éviter quelque chose",
    "Je n'ai jamais parlé tout seul à voix haute",
    "Je n'ai jamais stalké quelqu'un sur les réseaux sociaux"
];
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, { text: `🙊 *JAMAIS JE N'AI...*\n\n${QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
