const { getUser, loadEconomy, saveEconomy } = require('../lib/economy');

const JOIN_WINDOW_MS = 15000;   // 15s pour rejoindre
const MAX_ROUND_MS = 25000;     // Durée max d'une manche (garde le jeu dynamique)
const GROWTH_RATE = 0.13;       // Vitesse de croissance du multiplicateur
const TICK_MS = 1300;           // Fréquence de mise à jour de l'animation
const HOUSE_EDGE = 0.04;

if (!global.crashGames) global.crashGames = {};

function currentMultiplier(startTime) {
    const elapsedSec = (Date.now() - startTime) / 1000;
    return Math.exp(GROWTH_RATE * elapsedSec);
}

function generateCrashPoint() {
    const r = Math.random();
    if (r < HOUSE_EDGE) return 1.00; // reflète la marge de la maison
    const point = (1 - HOUSE_EDGE) / (1 - r);
    return Math.min(Math.max(1.00, point), 50); // plafonné à 50x
}

function progressBar(mult) {
    const filled = Math.min(20, Math.floor(mult * 2));
    return '🚀' + '━'.repeat(filled) + '┈'.repeat(Math.max(0, 20 - filled));
}

// L'émoji évolue avec le multiplicateur pour renforcer visuellement la tension
// (zone sûre → zone à risque), et le texte est encapsulé en bloc monospace
// (```) pour que la barre reste parfaitement alignée dans WhatsApp.
function riskEmoji(mult) {
    if (mult < 1.5) return '🟢';
    if (mult < 3) return '🟡';
    if (mult < 6) return '🟠';
    return '🔴';
}

function flightDisplay(mult, label) {
    return `🚀 *${label}*\n\n` +
        '```\n' + progressBar(mult) + '\n```\n' +
        `${riskEmoji(mult)} *${mult.toFixed(2)}x*\n\n` +
        `💰 Tape *.encais* pour encaisser !`;
}

async function runRound(sock, from) {
    const game = global.crashGames[from];
    if (!game) return;

    game.phase = 'flying';
    game.startTime = Date.now();
    game.crashPoint = generateCrashPoint();

    let sent;
    try {
        sent = await sock.sendMessage(from, { text: flightDisplay(1, 'DÉCOLLAGE !') });
    } catch (e) { sent = null; }

    game.interval = setInterval(async () => {
        const g = global.crashGames[from];
        if (!g || g.phase !== 'flying') return;

        const mult = currentMultiplier(g.startTime);
        const elapsed = Date.now() - g.startTime;

        if (mult >= g.crashPoint || elapsed >= MAX_ROUND_MS) {
            clearInterval(g.interval);
            g.phase = 'ended';

            const db = loadEconomy();
            const results = [];
            for (const [jid, p] of g.players) {
                if (p.cashedOutAt) {
                    results.push(`✅ @${jid.split('@')[0]} a encaissé à ${p.cashedOutAt.toFixed(2)}x (+${Math.floor(p.bet * p.cashedOutAt)} coins)`);
                } else {
                    results.push(`💥 @${jid.split('@')[0]} n'a pas encaissé à temps (-${p.bet} coins)`);
                }
            }
            saveEconomy(db);

            const finalText = `💥 *CRASH à ${g.crashPoint.toFixed(2)}x !*\n\n${results.join('\n') || 'Personne n\'a joué'}\n\n💡 .aviator <mise> pour relancer une manche`;
            try {
                if (sent) await sock.sendMessage(from, { text: finalText, edit: sent.key });
                else await sock.sendMessage(from, { text: finalText, mentions: [...g.players.keys()] });
            } catch (e) {
                try { await sock.sendMessage(from, { text: finalText, mentions: [...g.players.keys()] }); } catch (e2) {}
            }

            delete global.crashGames[from];
            return;
        }

        if (sent) {
            try {
                await sock.sendMessage(from, { text: flightDisplay(mult, 'EN VOL...'), edit: sent.key });
            } catch (e) {}
        }
    }, TICK_MS);
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const bet = parseInt(args[0]);

            let game = global.crashGames[from];

            // Rejoindre une manche en attente
            if (game && game.phase === 'joining') {
                if (!bet || bet <= 0) return await sock.sendMessage(from, { text: '🚀 .crash <mise> pour rejoindre la manche en préparation' });
                if (game.players.has(sender)) return await sock.sendMessage(from, { text: '⚠️ Tu as déjà rejoint cette manche' });

                const user = getUser(sender);
                if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

                const db = loadEconomy();
                db[sender].coins -= bet;
                saveEconomy(db);

                game.players.set(sender, { bet, cashedOutAt: null });
                return await sock.sendMessage(from, { text: `✅ @${sender.split('@')[0]} a misé ${bet} coins ! (${game.players.size} joueur(s))`, mentions: [sender] });
            }

            if (game && game.phase === 'flying') {
                return await sock.sendMessage(from, { text: '❌ La fusée a déjà décollé ! Attends la prochaine manche pour miser' });
            }

            // Démarrer une nouvelle manche
            if (!bet || bet <= 0) return await sock.sendMessage(from, { text: '🚀 .aviator <mise>\n\nLe multiplicateur grimpe, encaisse avec .cashout avant le crash !' });

            const user = getUser(sender);
            if (user.coins < bet) return await sock.sendMessage(from, { text: `❌ Solde insuffisant (tu as ${user.coins} coins)` });

            const db = loadEconomy();
            db[sender].coins -= bet;
            saveEconomy(db);

            global.crashGames[from] = { phase: 'joining', players: new Map([[sender, { bet, cashedOutAt: null }]]) };

            await sock.sendMessage(from, {
                text: `🚀 *NOUVELLE MANCHE*\n\n✅ @${sender.split('@')[0]} a misé ${bet} coins\n\n⏳ Décollage dans 15s — tape .aviator <mise> pour rejoindre !`,
                mentions: [sender]
            });

            setTimeout(() => runRound(sock, from), JOIN_WINDOW_MS);

        } catch (error) {
            console.error('Erreur crash:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
