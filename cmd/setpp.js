const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const senderInfo = metadata.participants.find(p => p.id === sender);

        if (!senderInfo || !senderInfo.admin) {
            return sock.sendMessage(from, { text: "❌ Tu dois être admin !" });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;

        if (!imageMessage) {
            return sock.sendMessage(from, { text: "❌ Envoie ou réponds à une image avec `.setpp`" });
        }

        try {
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // ✅ Essaie d'utiliser sharp ou jimp si disponible
            let processedBuffer = buffer;
            
            try {
                // Tente avec sharp
                const sharp = require('sharp');
                processedBuffer = await sharp(buffer)
                    .resize(640, 640, { fit: 'cover' })
                    .jpeg()
                    .toBuffer();
            } catch (e) {
                try {
                    // Tente avec jimp
                    const Jimp = require('jimp');
                    const image = await Jimp.read(buffer);
                    image.cover(640, 640);
                    processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
                } catch (e2) {
                    // Aucune bibliothèque dispo, on envoie l'image brute
                    console.log("⚠️ Aucune bibliothèque d'image trouvée, envoi brut");
                }
            }

            await sock.updateProfilePicture(from, processedBuffer);
            sock.sendMessage(from, { text: "✅ Photo du groupe mise à jour !" });
        } catch (error) {
            console.error("Erreur setpp:", error);
            sock.sendMessage(from, { text: "❌ Impossible de changer la photo du groupe." });
        }
    }
};
