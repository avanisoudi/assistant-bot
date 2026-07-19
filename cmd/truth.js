module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const truths = [
                "As-tu déjà menti à tes parents?",
                "Quel est ton plus grand secret?",
                "As-tu déjà eu une relation secrète?",
                "Quel est ton rêve le plus fou?",
                "As-tu une personnalité différente en ligne?",
                "Quel mensonge as-tu dit le plus souvent?",
                "As-tu déjà pleurer seul(e)?",
                "Quel est ton pire défaut?",
                "As-tu déjà trahi la confiance de quelqu'un?",
                "Quel est ton sentiment secret?",
                "As-tu une phobie irrationnelle?",
                "Quel est ton fantasme le plus étrange?",
                "As-tu déjà jeté quelque chose au visage de quelqu'un?",
                "Quel est ton plus gros regret?",
                "As-tu déjà essayé quelque chose d'illégal?"
            ];

            const randomTruth = truths[Math.floor(Math.random() * truths.length)];

            let text = `╭──────────────────────────╮\n`;
            text += `│   🎭 VÉRITÉ OU DÉFI       │\n`;
            text += `├──────────────────────────┤\n`;
            text += `│                          │\n`;
            text += `│  🤔 *VÉRITÉ*\n`;
            text += `│                          │\n`;
            text += `│  ${randomTruth}\n`;
            text += `│                          │\n`;
            text += `╰──────────────────────────╯`;

            await sock.sendMessage(from, {
                text: text
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, {
                text: "❌ Erreur lors de la génération de la question"
            });
        }
    }
};
