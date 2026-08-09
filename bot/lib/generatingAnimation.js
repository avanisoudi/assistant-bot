// 🤖 Anime un message "en cours de génération" en l'éditant régulièrement, pour
// donner un retour visuel pendant qu'une commande IA travaille (image, texte, audio...)
//
// Important : l'édition de message (edit: sent.key) n'est pas garantie de fonctionner
// sur toutes les versions/déploiements de Baileys — si elle échoue silencieusement,
// compter dessus pour livrer le résultat final ferait rester le message bloqué sur
// l'animation pour toujours, sans jamais montrer la vraie réponse. Le résultat final
// est donc TOUJOURS envoyé comme un nouveau message fiable ; l'édition du message
// d'animation reste tentée en plus, mais seulement pour l'aspect cosmétique.
async function startGenerating(sock, from, label = 'Génération') {
    const frames = ['⏳', '🔄', '✨', '🌀'];
    let i = 0;
    let stopped = false;

    let sent;
    try {
        sent = await sock.sendMessage(from, { text: `${frames[0]} ${label} en cours...` });
    } catch (e) {
        sent = null;
    }

    const interval = setInterval(async () => {
        if (stopped || !sent) return;
        i = (i + 1) % frames.length;
        const dots = '.'.repeat((i % 3) + 1);
        try {
            await sock.sendMessage(from, { text: `${frames[i]} ${label} en cours${dots}`, edit: sent.key });
        } catch (e) {}
    }, 1500);

    return {
        stop: async (finalText) => {
            stopped = true;
            clearInterval(interval);
            if (!finalText) return; // rien à livrer (cas d'erreur déjà géré par l'appelant)

            // Priorité à l'édition du message existant (c'est le mécanisme voulu :
            // le résultat remplace l'animation dans le même message, sans encombrer
            // le chat). Un nouveau message n'est envoyé qu'en dernier recours, si
            // l'édition échoue réellement — pour ne jamais laisser l'utilisateur sans
            // réponse.
            if (sent) {
                try {
                    await sock.sendMessage(from, { text: finalText, edit: sent.key });
                    return;
                } catch (e) {
                    console.error('Édition finale échouée, envoi en nouveau message:', e.message);
                }
            }

            try {
                await sock.sendMessage(from, { text: finalText });
            } catch (e) {
                console.error('Erreur envoi résultat génération:', e.message);
            }
        }
    };
}

module.exports = { startGenerating };
