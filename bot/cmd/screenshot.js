module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📸 .screenshot <url>\nExemple: .screenshot google.com' });
            let url = args[0];
            if (!/^https?:\/\//.test(url)) url = 'https://' + url;

            const shotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=800`;

            await sock.sendMessage(from, { text: '📸 Capture en cours (peut prendre 5-10s la première fois)...' });
            await sock.sendMessage(from, {
                image: { url: shotUrl },
                caption: `📸 Capture: ${url}`
            });
        } catch (error) {
            console.error('Erreur screenshot:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors de la capture' });
        }
    }
};
