module.exports = {
    execute: async (sock, msg, from, args) => {
        if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .broadcast <message>' });
        
        const message = args.join(' ');
        await sock.sendMessage(from, {
            text: `📢 *ANNONCE*\n\n${message}\n\n━━━━━━━━━━━━━━━━`
        });
    }
};
