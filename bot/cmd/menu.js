const fs = require('fs');
const path = require('path');

// 📂 Catégorisation des commandes — chaque commande du dossier cmd/ doit apparaître
// dans une seule de ces catégories. Toute commande non listée ici tombe automatiquement
// dans "✦ Autres" (voir plus bas), donc le menu ne casse jamais si une commande est ajoutée.
const CATEGORIES = {
    '🛡️ Modération & Protections': [
        'antiaudio', 'antibot', 'antidelete', 'antidemote', 'antiflood', 'antiforbidden',
        'antiimage', 'antilink', 'antilock', 'antipromote', 'antipurge', 'antispam',
        'antistatut', 'antisticker', 'antitag', 'antitoxic', 'antitransfer', 'antivideo',
        'blacklistbot', 'ban', 'unban', 'kick', 'mute', 'unmute', 'muteglobal', 'warn',
        'block', 'unblock', 'promote', 'demote', 'add', 'remove', 'clean', 'clear',
        'clearall', 'del', 'delete', 'pin', 'slowmode', 'modnote', 'filter', 'mode',
        'lock', 'unlock', 'tag', 'admincheck', 'admins', 'rules', 'votekick', 'announce',
        'antiviewonce'
    ],
    '💰 Économie': [
        'balance', 'daily', 'work', 'gamble', 'gambling', 'shop', 'buy', 'sell',
        'inventory', 'gift', 'transfer', 'transfercoin', 'rob', 'economy', 'networth',
        'payslip', 'crypto', 'stock', 'invest', 'startup', 'business', 'mining', 'hunt',
        'treasure', 'quest', 'bounty', 'leaderboard', 'slots', 'spin', 'roulette',
        'lottery', 'jackpot', 'bingo', 'redeem'
    ],
    '🎮 Jeux': [
        '8ball', 'dice', 'choose', 'flip', 'tictac', 'truth', 'dare', 'hangman',
        'riddle', 'quickmath', 'wyr', 'shuffle', 'memory', 'trivia', 'random',
        'couples', 'nasty', 'poll', 'quiz', 'quiz_anime'
    ],
    '🤖 Intelligence Artificielle': ['ia', 'gemini', 'gpt4',  'chatbot', 'sora'],
    '🌍 Géographie & Voyage': [
        'airport', 'capital', 'continent', 'country', 'currency', 'distance',
        'exchange', 'hotels', 'landmark', 'map', 'randomcountry', 'timezone'
    ],
    '📚 Éducation & Culture': [
        'antonym', 'define', 'historyfact', 'rhyme', 'scientifact', 'synonym',
        'wiki', 'calculator', 'calc', 'translate', 'animals', 'weather', 'fact'
    ],
    '🎵 Multimédia & Divertissement': [
        'artistinfo', 'cat', 'dog', 'joke', 'jokes', 'lyrics', 'movie', 'play',
        'quote', 'recommend', 'song', 'sports', 'tiktok', 'vv', 'yt', 'ig', 'fb', 'rsticker'
    ],
    '💬 Social & Fun': [
        'hug', 'kiss', 'slap', 'app', 'fakecall', 'anonhidemsg', 'broadcast', 'invite',
        'compliment', 'insult', 'flirt', 'goodnight', 'shayari', 'roseday', 'oogway',
        'comrade', 'ship', 'wasted', 'triggered', 'jail', 'glass', 'simp'
    ],
    '🎭 Anime & Réactions': [
        'pat', 'cry', 'poke', 'nom', 'wink', 'cuddle', 'highfive', 'wave', 'dance',
        'smile', 'bite', 'blush', 'bully', 'character'
    ],
    '🎨 Effets Textuels': [
        'metallic', 'ice', 'snow', 'impressive', 'matrix', 'light', 'neon', 'devil',
        'purple', 'thunder', 'leaves', '1917', 'arena', 'hacker', 'sand', 'blackpink',
        'glitch', 'fire'
    ],
    '📊 Groupe & Statistiques': [
        'chatstats', 'groupanalysts', 'mostactive', 'msgcount', 'wordcloud', 'ginfo',
        'list', 'linkgroup', 'revoke', 'setname', 'setdesc', 'setpp', 'ephemeral',
        'welcome', 'goodbye', 'status', 'gstatus', 'getid', 'getinfo', 'owner',
        'groupname', 'memberscount', 'kickall', 'mission', 'groupbot'
    ],
    '🔒 Privé (PV)': [
        'dailyreminder', 'mysummary', 'privacy', 'anonyme'
    ],
    '🔧 Utilitaires': [
        'hex2rgb', 'json', 'qrcode', 'screenshot', 'shorten', 'timer', 'remind', 'pdf', 'bug',
        'trt', 'tts', 'fichiers', 'apk', 'autoracc'
    ],
    '🔡 Texte & Encodage': [
        'password', 'base64', 'binary', 'morse', 'palindrome', 'anagram', 'reverse',
        'uppercase', 'lowercase', 'titlecase', 'wordcount', 'charcount', 'capitalize',
        'slugify', 'acronym', 'acronymreveal', 'leetspeak', 'vowelcount', 'emojify',
        'lorem', 'textstats'
    ],
    '🧮 Calculs & Conversions': [
        'percentage', 'bmi', 'age', 'tip', 'discount', 'countdown', 'unixtime', 'isprime',
        'factorial', 'fibonacci', 'celsius', 'kmmiles', 'kglbs', 'daysbetween', 'timeago',
        'nextbirthday', 'randomnumber', 'phonelookup', 'uuid', 'color'
    ],
    '🎮 Jeux Additionnels': [
        'rps', 'roast', 'pickup', 'fortune', 'nhie', 'wordscramble', 'numberguess', 'aviator', 'cashout'
    ],
    '⚙️ Système & Infos': [
        'achievement', 'badge', 'medals', 'trophies', 'ranking', 'profile', 'history',
        'backup', 'export', 'import', 'reset', 'restore', 'update', 'version', 'botinfo',
        'infodev', 'command', 'credits', 'donation', 'faq', 'feedback', 'feature', 'guide',
        'help', 'support', 'suggestion', 'thanks', 'tutorial', 'report', 'request',
        'uptime', 'ping', 'menu', 'menuadv', 'settings', 'preferences', 'notifications',
        'prefix', 'set', 'autoread', 'autotype', 'stats', 'stlak', 'restart', 'schedule'
    ]
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const configPath = path.join(__dirname, '..', 'config.json');
            const config = require(configPath);
            const prefix = config.prefix;

            const cmdFolder = path.join(__dirname);
            // Commandes volontairement invisibles dans .menu (existent et fonctionnent,
            // juste pas listées) — typiquement des commandes sensibles réservées aux
            // administrateurs du bot.
            const HIDDEN_COMMANDS = new Set(['importf', 'supp']);
            const allCommands = fs.readdirSync(cmdFolder)
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''))
                .filter(cmd => !HIDDEN_COMMANDS.has(cmd));

            const sender = msg.key.participant || msg.key.remoteJid;
            const pushname = msg.pushName || "Utilisateur";

            let groupName = null;
            if (from.endsWith('@g.us')) {
                try {
                    const groupMetadata = await sock.groupMetadata(from);
                    groupName = groupMetadata.subject;
                } catch (e) {}
            }

            const now = new Date();
            const date = now.toLocaleDateString('fr-FR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            // Regroupe chaque commande existante dans sa catégorie ; ce qui n'est dans
            // aucune catégorie ci-dessus atterrit automatiquement dans "✦ Autres"
            const categorized = new Set();
            Object.values(CATEGORIES).forEach(list => list.forEach(c => categorized.add(c)));
            const uncategorized = allCommands.filter(c => !categorized.has(c));

            let text = `╔═══════════════════╗\n`;
            text += `   *🤖 𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭𝐁𝐨𝐭*\n`;
            text += `   𝐕𝐞𝐫𝐬𝐢𝐨𝐧: *V1.1.9*\n`;
            text += `   𝐌𝐫 𝐀𝐕𝐀𝐍𝐈 𝐒𝐎𝐔𝐃𝐈\n`;
            text += `╚═══════════════════╝\n\n`;
            text += `👋 𝐒𝐚𝐥𝐮𝐭 *${pushname}*\n`;
            text += groupName ? `👥 𝐆𝐫𝐨𝐮𝐩𝐞 : *${groupName}*\n` : `💬 Message privé\n`;
            text += `📅 ${date}\n`;
            text += `🕐 ${time}\n`;
            text += `📂 *${allCommands.length}* commandes disponibles\n`;
            text += `⚙️ Préfixe : *${prefix}*\n`;

            text += `\n*Commandes disponibles :*\n`;

            for (const [category, cmds] of Object.entries(CATEGORIES)) {
                const existing = cmds.filter(c => allCommands.includes(c));
                if (existing.length === 0) continue;
                text += `\n╔═══════════════════╗\n`;
                text += `${category} :\n`;
                existing.forEach(cmd => { text += `║ ➤ ${prefix}${cmd}\n`; });
                text += `╚═══════════════════╝\n`;
            }

            if (uncategorized.length > 0) {
                text += `\n╔═══════════════════╗\n`;
                text += `✦ Autres :\n`;
                uncategorized.forEach(cmd => { text += `║ ➤ ${prefix}${cmd}\n`; });
                text += `╚═══════════════════╝\n`;
            }

            text += `\n╔═══════════════════╗\n`;
            text += `💡 *ASTUCES* :\n`;
            text += `║ ➤ Utilise ${prefix}<commande>\n`;
            text += `║ ➤ Exemple : ${prefix}ping\n`;
            text += `║ ➤ 🔒 PV : à utiliser en privé au bot\n`;
            text += `╚═══════════════════╝\n\n`;

            text += `> 🚀 *𝐀𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭𝐁𝐨𝐭 V1.1.9*`;

            await sock.sendMessage(from, { text: text, mentions: [sender] });
        } catch (error) {
            console.error('Erreur menu:', error);
            await sock.sendMessage(from, { text: '❌ Erreur lors du chargement du menu' });
        }
    }
};
