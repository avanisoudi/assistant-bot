module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `🎰 *JEUX D'ARGENT DISPONIBLES*\n\n🎰 .slots <mise> — Machine à sous\n🎡 .spin <mise> — Roue de la fortune\n🔴 .roulette <mise> <rouge/noir/numéro>\n🎟️ .lottery — Achète un ticket (100 coins)\n🎱 .bingo — Mini bingo\n💰 .jackpot — Voir/tenter la cagnotte\n🎲 .gamble <mise> — Pile ou face 50/50\n\n⚠️ Joue de façon responsable, ce ne sont que des coins virtuels!`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
