const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'prefix',
    description: 'Modifie le préfixe du bot en temps réel',
    async execute(sock, msg, from, args) {
        // Sécurité : On vérifie si l'utilisateur a bien donné un nouveau préfixe
        if (!args[0]) {
            return await sock.sendMessage(from, { 
                text: `❌ *Erreur :* Tu dois spécifier un nouveau préfixe.\n💡 _Exemple : !prefix ._` 
            }, { quoted: msg });
        }

        const newPrefix = args[0].trim();
        const configPath = path.join(__dirname, '..', 'config.json');

        try {
            // 1. Lire le fichier config.json actuel
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

            // On garde en mémoire l'ancien préfixe pour le message de confirmation
            const oldPrefix = config.prefix;

            // 2. Mettre à jour le préfixe
            config.prefix = newPrefix;

            // 3. Réécrire le fichier config.json proprement
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

            // 4. Confirmer le changement sur WhatsApp
            await sock.sendMessage(from, { 
                text: `✅ *Préfixe mis à jour avec succès !*\n\n⚙️ *Ancien :* \` ${oldPrefix} \`\n🚀 *Nouveau :* \` ${newPrefix} \`\n\n_Tu dois désormais utiliser \`${newPrefix}menu\` par exemple._` 
            }, { quoted: msg });

        } catch (error) {
            console.error("Erreur lors de la modification du préfixe :", error);
            await sock.sendMessage(from, { text: `❌ Une erreur est survenue lors de la modification de la configuration.` }, { quoted: msg });
        }
    }
};

