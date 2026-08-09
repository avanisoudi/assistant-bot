// 👑 Numéros des administrateurs du Bot (pas les admins de groupe WhatsApp — ce sont
// les personnes qui gèrent le bot lui-même : commandes owner, réception des rapports
// de bug, message de connexion, titre de travail spécial pour .work, etc.)
//
// Format attendu : numéro complet avec indicatif pays, SANS + ni espaces (ex: 237651543248)
const BOT_ADMIN_NUMBERS = [
    '237651543248',
    '237679246436',
    '237692386361',
    '237621943212'
];

// JIDs complets prêts à être utilisés avec sock.sendMessage
const BOT_ADMIN_JIDS = BOT_ADMIN_NUMBERS.map(n => `${n}@s.whatsapp.net`);

// Normalise un JID (retire domaine + suffixe ":session") pour comparaison fiable,
// même logique que lib/adminCheck.js — nécessaire pour les mêmes raisons (formats
// @lid vs @s.whatsapp.net qui peuvent différer selon le contexte du message).
function normalize(jid) {
    if (!jid || typeof jid !== 'string') return null;
    return jid.split('@')[0].split(':')[0];
}

const NORMALIZED_ADMIN_NUMBERS = new Set(BOT_ADMIN_NUMBERS.map(normalize));

// 🔄 Cache des identifiants réels (numéro + jid + lid) résolus via WhatsApp.
// Nécessaire car un compte peut être identifié par un LID sans aucun rapport
// visible avec son numéro de téléphone — comparer seulement le numéro brut ne
// suffit pas toujours (c'est ce qui causait "je suis admin du bot mais refusé").
let resolvedCache = null;

async function resolveBotAdmins(sock) {
    if (resolvedCache) return resolvedCache;
    const all = new Set(NORMALIZED_ADMIN_NUMBERS);
    if (sock && typeof sock.onWhatsApp === 'function') {
        for (const number of BOT_ADMIN_NUMBERS) {
            try {
                const results = await sock.onWhatsApp(number);
                for (const r of results || []) {
                    if (r.jid) all.add(normalize(r.jid));
                    if (r.lid) all.add(normalize(r.lid));
                }
            } catch (e) {
                console.error(`Erreur résolution admin bot ${number}:`, e.message);
            }
        }
    }
    resolvedCache = all;
    return resolvedCache;
}

// Vérifie si un JID (sender) correspond à un administrateur du Bot.
// - Sans sock : compare uniquement le numéro brut (rapide, marche si le sender
//   arrive au format @s.whatsapp.net classique).
// - Avec sock : résout aussi le LID réel de chaque numéro admin la première fois
//   (mis en cache ensuite) pour couvrir le cas où WhatsApp identifie le compte
//   par LID plutôt que par numéro.
async function isBotAdmin(jid, sock) {
    const n = normalize(jid);
    if (!n) return false;
    if (NORMALIZED_ADMIN_NUMBERS.has(n)) return true;
    if (sock) {
        const resolved = await resolveBotAdmins(sock);
        return resolved.has(n);
    }
    return false;
}

// Envoie un message privé à TOUS les administrateurs du Bot. N'échoue pas en bloc :
// si un envoi rate (numéro qui n'a jamais eu de conversation avec le bot par ex.),
// les autres sont quand même tentés.
async function notifyBotAdmins(sock, content) {
    const results = [];
    for (const jid of BOT_ADMIN_JIDS) {
        try {
            await sock.sendMessage(jid, content);
            results.push({ jid, ok: true });
        } catch (e) {
            console.error(`Erreur notification admin ${jid}:`, e.message);
            results.push({ jid, ok: false, error: e.message });
        }
    }
    return results;
}

module.exports = { BOT_ADMIN_NUMBERS, BOT_ADMIN_JIDS, isBotAdmin, notifyBotAdmins };
