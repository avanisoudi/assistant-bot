function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
}
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const n = parseInt(args[0]);
            if (!args[0] || isNaN(n)) return await sock.sendMessage(from, { text: '🔢 .isprime <nombre>' });
            await sock.sendMessage(from, { text: `🔢 ${n} ${isPrime(n) ? 'est un nombre premier ✅' : 'n\'est pas un nombre premier ❌'}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
