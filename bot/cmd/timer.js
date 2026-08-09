module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '⏱️ .timer <secondes> [message]\nExemple: .timer 60 Pause café terminée!' });
            const seconds = parseInt(args[0]);
            if (!seconds || seconds <= 0 || seconds > 3600) {
                return await sock.sendMessage(from, { text: '❌ Indique une durée entre 1 et 3600 secondes' });
            }
            const label = args.slice(1).join(' ') || 'Temps écoulé!';

            await sock.sendMessage(from, { text: `⏱️ Minuteur lancé: ${seconds}s\n📝 ${label}` });

            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { text: `🔔 *MINUTEUR TERMINÉ*\n\n${label}` });
                } catch (e) { console.error('Erreur envoi timer:', e); }
            }, seconds * 1000);
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
