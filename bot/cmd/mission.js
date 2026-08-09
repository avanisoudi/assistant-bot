module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `🎯 *MISSION : PARRAINAGE*\n\nAjoute un nouveau membre au groupe (via "Ajouter des membres") pour recevoir automatiquement *600 coins* !\n\n⚠️ Ne fonctionne que si tu ajoutes activement quelqu'un — rejoindre soi-même via un lien d'invitation ne compte pas.`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
