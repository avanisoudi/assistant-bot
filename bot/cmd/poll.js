module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '❌ .poll <question> <option1> <option2> [option3...]' });
            
            const question = args[0];
            const options = args.slice(1);
            
            let text = `📊 *SONDAGE*\n\n❓ ${question}\n\n`;
            options.forEach((opt, i) => {
                text += `${i + 1}. ${opt}\n`;
            });
            
            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
