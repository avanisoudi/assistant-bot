module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const startTime = Date.now();
            
            // Envoi d'un message et calcul de la latence
            const sentMsg = await sock.sendMessage(from, { 
                text: '⚡ Mesure en cours...',
                quoted: msg 
            });
            
            const endTime = Date.now();
            const latency = endTime - startTime;

            // Réponse avec la latence
            await sock.sendMessage(from, { 
                text: `✅ *𝐏𝐎𝐍𝐆!*

⏱️ *Latence :* ${latency} ms
🌐 *Serveur :* En ligne ✓
📊 *Status :* Connecté
🤖 *Bot :* Actif ✓`,
                quoted: msg 
            });
        } catch (error) {
            console.error('Erreur ping:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du ping' });
        }
    }
};

