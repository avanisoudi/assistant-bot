module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '🔤 .base64 encode/decode <texte>' });
            const action = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            if (action === 'encode') {
                await sock.sendMessage(from, { text: `🔤 *ENCODÉ*\n\n${Buffer.from(text).toString('base64')}` });
            } else if (action === 'decode') {
                try {
                    await sock.sendMessage(from, { text: `🔤 *DÉCODÉ*\n\n${Buffer.from(text, 'base64').toString('utf-8')}` });
                } catch { await sock.sendMessage(from, { text: '❌ Texte base64 invalide' }); }
            } else {
                await sock.sendMessage(from, { text: '❌ Utilise: encode ou decode' });
            }
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
