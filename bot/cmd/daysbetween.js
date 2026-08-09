module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '📅 .daysbetween <JJ/MM/AAAA> <JJ/MM/AAAA>' });
            const parse = s => { const [d,m,y] = s.split('/').map(Number); return new Date(y, m-1, d); };
            const d1 = parse(args[0]);
            const d2 = parse(args[1]);
            const days = Math.abs(Math.round((d2 - d1) / 86400000));
            await sock.sendMessage(from, { text: `📅 Il y a *${days} jours* entre ces deux dates` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur (format JJ/MM/AAAA attendu)' }); }
    }
};
