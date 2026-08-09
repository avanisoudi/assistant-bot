module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '💵 .tip <montant> <pourcentage> [nb personnes]\nExemple: .tip 50 15 4' });
            const amount = parseFloat(args[0]);
            const pct = parseFloat(args[1]);
            const people = parseInt(args[2]) || 1;
            if (isNaN(amount) || isNaN(pct)) return await sock.sendMessage(from, { text: '❌ Valeurs invalides' });

            const tipAmount = amount * pct / 100;
            const total = amount + tipAmount;
            await sock.sendMessage(from, {
                text: `💵 *CALCUL POURBOIRE*\n\n💰 Montant: ${amount}\n💸 Pourboire (${pct}%): ${tipAmount.toFixed(2)}\n💳 Total: ${total.toFixed(2)}\n👥 Par personne (${people}): ${(total / people).toFixed(2)}`
            });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
