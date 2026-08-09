const { checkAdmin } = require('../lib/adminCheck');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) {
                return await sock.sendMessage(from, { text: '❌ Cette commande fonctionne seulement dans les groupes' });
            }

            const { isAdmin } = await checkAdmin(sock, from, msg);
            if (!isAdmin) return await sock.sendMessage(from, { text: '❌ Tu dois être admin (ou créateur) pour utiliser cette commande' });

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const caption = args.join(' ');

            // Note : WhatsApp n'a pas de "statut de groupe" séparé — un statut est
            // toujours publié sur le compte qui l'envoie (ici, le bot), visible par
            // ses contacts. C'est la seule chose que l'API permette réellement.

            if (quoted?.imageMessage) {
                const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage('status@broadcast', { image: buffer, caption });
                return await sock.sendMessage(from, { text: '✅ Image publiée en statut !' });
            }

            if (quoted?.videoMessage) {
                const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage('status@broadcast', { video: buffer, caption });
                return await sock.sendMessage(from, { text: '✅ Vidéo publiée en statut !' });
            }

            if (!caption) {
                return await sock.sendMessage(from, {
                    text: `📢 *PUBLIER UN STATUT*\n\n.gstatus <texte> — statut texte\nRéponds à une image/vidéo avec .gstatus [légende] — statut média`
                });
            }

            await sock.sendMessage('status@broadcast', {
                text: caption,
                backgroundColor: '#25D366',
                font: 1
            });
            await sock.sendMessage(from, { text: '✅ Statut texte publié !' });

        } catch (error) {
            console.error('Erreur gstatus:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la publication (le compte du bot doit être dans les contacts des personnes pour qu\'elles voient le statut)' });
        }
    }
};
