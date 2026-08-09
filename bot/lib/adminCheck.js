// 🛡️ lib/adminCheck.js
// Vérification admin robuste, tolérante au système LID de WhatsApp.
//
// POURQUOI CE FICHIER EXISTE :
// WhatsApp identifie parfois l'expéditeur d'un message (msg.key.participant) avec un
// identifiant "@lid" (Linked ID, privacy), alors que la liste des membres du groupe
// (groupMetadata.participants[].id) utilise le format "@s.whatsapp.net" — ou l'inverse.
// Une comparaison directe "p.id === sender" échoue alors silencieusement, y compris pour
// le créateur du groupe. Cette fonction teste plusieurs champs et plusieurs formats avant
// de conclure que quelqu'un n'est pas admin.

function normalizeJid(jid) {
    if (!jid || typeof jid !== 'string') return null;
    // Enlève le domaine (@lid, @s.whatsapp.net...) ET le suffixe ":session" (":4"),
    // dans cet ordre, pour ne garder QUE la partie numérique/identifiant pure.
    // Important : il faut toujours retirer les deux, peu importe l'ordre dans lequel
    // ils apparaissent, sinon un participant listé sans ":session" (cas courant dans
    // groupMetadata) ne matche jamais avec un sender qui en a un (cas courant dans
    // msg.key.participant) — c'est ce qui causait le "tu dois être admin" à tort.
    return jid.split('@')[0].split(':')[0];
}

function candidatesFor(obj, keys) {
    const out = [];
    for (const k of keys) {
        const v = obj?.[k];
        if (v && typeof v === 'string') out.push(normalizeJid(v));
    }
    return out.filter(Boolean);
}

/**
 * Détermine si l'expéditeur du message est admin (ou le créateur) du groupe.
 * @returns {Promise<{isAdmin: boolean, isCreator: boolean, senderJid: string, metadata: object|null, debug: object}>}
 */
async function checkAdmin(sock, from, msg) {
    const senderJid = normalizeJid(msg.key.participant) || normalizeJid(from);
    const debug = { senderJid, matchedBy: null };

    if (!from || !from.endsWith('@g.us')) {
        return { isAdmin: false, isCreator: false, senderJid, metadata: null, debug };
    }

    let metadata;
    try {
        metadata = await sock.groupMetadata(from);
    } catch (e) {
        debug.error = 'groupMetadata a échoué: ' + e.message;
        return { isAdmin: false, isCreator: false, senderJid, metadata: null, debug };
    }

    // Tous les identifiants possibles du sender (message key + variantes LID/PN de Baileys récents)
    const senderCandidates = candidatesFor(msg.key, ['participant', 'participantAlt', 'participantPn']);
    if (senderCandidates.length === 0 && senderJid) senderCandidates.push(senderJid);

    // 1) Vérifie le créateur du groupe (metadata.owner), le plus fiable quand disponible
    const ownerCandidates = candidatesFor(metadata, ['owner', 'subjectOwner']);
    const isCreator = ownerCandidates.length > 0 && senderCandidates.some(s => ownerCandidates.includes(s));
    if (isCreator) debug.matchedBy = 'owner';

    // 2) Cherche le participant correspondant en testant tous les champs d'identité possibles
    let senderInfo = null;
    for (const p of metadata.participants || []) {
        const pCandidates = candidatesFor(p, ['id', 'jid', 'lid', 'phoneNumber']);
        if (pCandidates.some(c => senderCandidates.includes(c))) {
            senderInfo = p;
            debug.matchedBy = debug.matchedBy || 'participants-list';
            break;
        }
    }

    let isAdminFlag = false;
    if (senderInfo) {
        isAdminFlag = senderInfo.admin === 'admin' || senderInfo.admin === 'superadmin'
            || senderInfo.isAdmin === true || senderInfo.isSuperAdmin === true;
    }

    debug.senderCandidates = senderCandidates;
    debug.foundParticipant = !!senderInfo;

    return {
        isAdmin: isCreator || isAdminFlag,
        isCreator,
        senderJid,
        metadata,
        debug
    };
}

/**
 * Détermine si le BOT lui-même est admin du groupe (nécessaire pour kick/ban/promote/etc.)
 */
async function checkBotAdmin(sock, from, metadata = null) {
    if (!metadata) {
        try { metadata = await sock.groupMetadata(from); } catch (e) { return false; }
    }
    const botNumberCandidates = candidatesFor({ a: sock.user?.id, b: sock.user?.lid }, ['a', 'b']);
    for (const p of metadata.participants || []) {
        const pCandidates = candidatesFor(p, ['id', 'jid', 'lid', 'phoneNumber']);
        if (pCandidates.some(c => botNumberCandidates.includes(c))) {
            return p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true || p.isSuperAdmin === true;
        }
    }
    return false;
}

module.exports = { checkAdmin, checkBotAdmin, normalizeJid };
