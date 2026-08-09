module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '🧮 .calc <expression>\nExemple: .calc (5+3)*2' });
            const expr = args.join(' ');

            if (!/^[0-9+\-*/().\s%]+$/.test(expr)) {
                return await sock.sendMessage(from, { text: '❌ Expression invalide. Utilise seulement des chiffres et + - * / ( )' });
            }

            const result = Function('"use strict"; return (' + expr + ')')();
            await sock.sendMessage(from, { text: `🧮 ${expr} = *${result}*` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Expression invalide' });
        }
    }
};
