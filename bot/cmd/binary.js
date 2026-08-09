module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🔢 .binary <texte> — convertit en binaire\n.binary decode <binaire> — reconvertit en texte' });
            if (args[0] === 'decode') {
                const binary = args.slice(1).join('');
                const text = binary.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
                return await sock.sendMessage(from, { text: `🔢 *TEXTE*\n\n${text}` });
            }
            const text = args.join(' ');
            const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            await sock.sendMessage(from, { text: `🔢 *BINAIRE*\n\n${binary}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
