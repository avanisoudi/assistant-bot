const fs = require('fs');
const path = require('path');
const { notifyBotAdmins } = require('../lib/botAdmins');

const logPath = path.join(__dirname, '..', 'db', 'anonymeLog.json');
const RATE_LIMIT_MS = 5 * 60 * 1000; // 1 message anonyme max toutes les 5 minutes par personne

function loadLog() { try { return fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) : {}; } catch { return {}; } }
function saveLog(d) { fs.writeFileSync(logPath, JSON.stringify(d, null, 2)); }

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (!from.endsWith('@g.us')) {
                return await sock.sendMessage(from, { text: '❌ Cette commande fonctionne seulement dans un groupe (le destinataire doit être un membre du même groupe que toi)' });
            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned[0];
            const text = args.filter(a => !a.startsWith('@')).join(' ');
            const sender = msg.key.participant || msg.key.remoteJid;

            if (!target || !text) {
                return await sock.sendMessage(from, {
                    text: `🎭 *MESSAGE ANONYME*\n\n.anonyme @user <message>\n\nLe destinataire ne verra pas ton nom. Utilisable seulement entre membres du même groupe (pas vers un numéro externe).\n\n⚠️ Les administrateurs du bot peuvent voir l'expéditeur réel en cas d'abus (harcèlement, menaces...).`
                });
            }

            if (target === sender) return await sock.sendMessage(from, { text: '❌ Tu ne peux pas t\'envoyer un message anonyme à toi-même' });

            // Le destinataire doit être membre du MÊME groupe — empêche d'utiliser
            // cette commande pour contacter froidement un numéro inconnu.
            const metadata = await sock.groupMetadata(from);
            if (!metadata.participants.some(p => p.id === target)) {
                return await sock.sendMessage(from, { text: '❌ Cette personne doit être membre de ce groupe' });
            }

            const log = loadLog();
            const now = Date.now();
            if (log[sender] && (now - log[sender]) < RATE_LIMIT_MS) {
                const wait = Math.ceil((RATE_LIMIT_MS - (now - log[sender])) / 1000);
                return await sock.sendMessage(from, { text: `⏳ Attends encore ${wait}s avant d'envoyer un autre message anonyme` });
            }

            try {
                await sock.sendMessage(target, { text: `🎭 *MESSAGE ANONYME*\n\nQuelqu'un du groupe "${metadata.subject}" t'a envoyé :\n\n"${text}"` });
            } catch (e) {
                return await sock.sendMessage(from, { text: '❌ Impossible d\'envoyer (cette personne n\'a peut-être jamais écrit au bot en privé)' });
            }

            log[sender] = now;
            saveLog(log);

            // Traçabilité interne : l'expéditeur réel n'est jamais montré au destinataire,
            // mais reste consultable par les administrateurs du bot en cas d'abus signalé —
            // comme pour .bug/.report, l'anonymat n'est pas synonyme d'absence totale de recours.
            await notifyBotAdmins(sock, {
                text: `🎭 [Log anonyme] @${sender.split('@')[0]} → @${target.split('@')[0]} dans "${metadata.subject}"\n📝 "${text}"`,
                mentions: [sender, target]
            });

            await sock.sendMessage(from, { text: '✅ Message anonyme envoyé !' });
        } catch (error) {
            console.error('Erreur anonyme:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
