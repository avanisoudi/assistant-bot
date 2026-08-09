module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Cette commande ne fonctionne que dans les groupes !" });
        }

        try {
            // ✅ La bonne méthode : groupMetadata (pas groupParticipants)
            const metadata = await sock.groupMetadata(from);
            
            const admins = metadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);
            
            const totalMembers = metadata.participants.length;
            
            const creationDate = new Date(metadata.creation * 1000).toLocaleString('fr-FR', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
            });

            const restrict = metadata.restrict ? "Oui (Admins uniquement)" : "Non (Tous les membres)";
            const announce = metadata.announce ? "Oui (Admins uniquement)" : "Non (Tous les membres)";
            const ephemeral = metadata.ephemeralDuration ? `${metadata.ephemeralDuration / 86400} jours` : "Désactivé";

            const desc = metadata.desc || "Aucune description";
            const owner = metadata.owner ? `@${metadata.owner.split('@')[0]}` : "Inconnu / Communauté";

            let text = `╭───「 *INFO GROUPE* 」\n`;
            text += `│ *Nom :* ${metadata.subject}\n`;
            text += `│ *ID :* ${metadata.id}\n`;
            text += `│ *Créateur :* ${owner}\n`;
            text += `│ *Créé le :* ${creationDate}\n`;
            text += `│ *Membres :* ${totalMembers}\n`;
            text += `│ *Admins :* ${admins.length}\n`;
            text += `│ *Description :* ${desc}\n`;
            text += `│ *Modif info :* ${restrict}\n`;
            text += `│ *Envoi msg :* ${announce}\n`;
            text += `│ *Msg éphémères :* ${ephemeral}\n`;
            text += `╰──────────────\n\n`;
            
            text += `*Liste des Admins :*\n`;
            admins.forEach((admin, i) => {
                text += `${i + 1}. @${admin.split('@')[0]}\n`;
            });

            const mentions = [...admins];
            if (metadata.owner) mentions.push(metadata.owner);

            let pfp = null;
            try {
                pfp = await sock.profilePictureUrl(from, 'image');
            } catch (e) {}

            if (pfp) {
                await sock.sendMessage(from, { 
                    image: { url: pfp }, 
                    caption: text, 
                    mentions: mentions 
                });
            } else {
                await sock.sendMessage(from, { 
                    text: text, 
                    mentions: mentions 
                });
            }

        } catch (error) {
            console.error("Erreur ginfo:", error);
            sock.sendMessage(from, { text: "❌ Impossible de récupérer les infos du groupe." });
        }
    }
};
