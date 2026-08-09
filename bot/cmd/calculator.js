module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .calculator <expression>\n\n✓ Exemple: .calculator 2+2*5' });
            
            const expression = args.join('');
            try {
                const result = eval(expression);
                await sock.sendMessage(from, { text: `🧮 *CALCUL*\n\n📝 ${expression}\n\n✅ Résultat: ${result}` });
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Expression invalide' });
            }
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
