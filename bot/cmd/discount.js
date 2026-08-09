module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length < 2) return await sock.sendMessage(from, { text: '🏷️ .discount <prix> <pourcentage>\nExemple: .discount 100 20' });
            const price = parseFloat(args[0]);
            const pct = parseFloat(args[1]);
            if (isNaN(price) || isNaN(pct)) return await sock.sendMessage(from, { text: '❌ Valeurs invalides' });

            const discountAmount = price * pct / 100;
            const finalPrice = price - discountAmount;
            await sock.sendMessage(from, { text: `🏷️ *RÉDUCTION*\n\n💰 Prix initial: ${price}\n➖ Réduction (${pct}%): -${discountAmount.toFixed(2)}\n✅ Prix final: *${finalPrice.toFixed(2)}*` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
