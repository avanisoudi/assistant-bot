module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '❌ .choose <option1> <option2> [option3...]' });
            
            const choice = args[Math.floor(Math.random() * args.length)];
            await sock.sendMessage(from, {
                text: `🎯 *JE CHOISIR*\n\n${choice}`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
