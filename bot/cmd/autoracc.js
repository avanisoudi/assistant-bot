module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `ℹ️ *À PROPOS DE .autoracc*\n\nUn seul compte WhatsApp ne peut réagir qu'*une seule fois* à une publication — ce n'est pas une limite du bot, c'est comme ça que WhatsApp fonctionne pour tout le monde. Il n'est donc pas possible qu'un seul bot génère 1000 réactions sur un post (ça nécessiterait 1000 comptes différents, ce que je ne peux pas et ne dois pas faire).\n\n✅ Ce que le bot fait déjà pour toi : à chaque nouvelle publication sur ta chaîne, il réagit automatiquement une fois avec un emoji aléatoire (🥳⭐❤️💙✅🤍💖🎉🎊) — cette fonctionnalité est active en permanence, aucune commande n'est nécessaire.`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
