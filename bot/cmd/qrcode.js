module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📱 .qrcode <texte ou url>' });
            const text = args.join(' ');
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

            await sock.sendMessage(from, {
                image: { url },
                caption: `📱 *QR CODE*\n\n📝 Contenu: ${text}`
            });
        } catch (error) {
            console.error('Erreur qrcode:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la génération du QR code' });
        }
    }
};
