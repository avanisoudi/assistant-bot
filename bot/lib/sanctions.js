// ⚖️ SYSTÈME DE SANCTIONS PROGRESSIVES
const fs = require('fs');
const path = require('path');

const sanctionsPath = path.join(__dirname, '..', 'db', 'sanctions.json');

function loadSanctions() {
    if (!fs.existsSync(sanctionsPath)) {
        fs.mkdirSync(path.dirname(sanctionsPath), { recursive: true });
        fs.writeFileSync(sanctionsPath, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(sanctionsPath, 'utf-8'));
    } catch (e) {
        return {};
    }
}

function saveSanctions(data) {
    fs.mkdirSync(path.dirname(sanctionsPath), { recursive: true });
    fs.writeFileSync(sanctionsPath, JSON.stringify(data, null, 2));
}

/**
 * Ajoute un warning à un utilisateur
 * @returns {Object} { count: number, action: string }
 */
function addWarning(groupId, userId, reason = 'antilink') {
    const data = loadSanctions();
    
    if (!data[groupId]) data[groupId] = {};
    if (!data[groupId][userId]) {
        data[groupId][userId] = {
            warnings: [],
            muted: false,
            muteUntil: 0
        };
    }

    const user = data[groupId][userId];
    user.warnings.push({
        reason,
        timestamp: Date.now()
    });

    // Nettoie les vieux warnings (plus de 24h)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    user.warnings = user.warnings.filter(w => w.timestamp > oneDayAgo);

    saveSanctions(data);

    return {
        count: user.warnings.length,
        action: getAction(user.warnings.length)
    };
}

/**
 * Détermine l'action à prendre selon le nombre de warnings
 */
function getAction(warningCount) {
    if (warningCount >= 4) return 'kick';
    if (warningCount === 3) return 'mute_1h';
    if (warningCount === 2) return 'warn';
    return 'warn';
}

/**
 * Mute un utilisateur
 */
function muteUser(groupId, userId, durationMs = 60 * 60 * 1000) {
    const data = loadSanctions();
    
    if (!data[groupId]) data[groupId] = {};
    if (!data[groupId][userId]) {
        data[groupId][userId] = { warnings: [], muted: false, muteUntil: 0 };
    }

    data[groupId][userId].muted = true;
    data[groupId][userId].muteUntil = Date.now() + durationMs;
    
    saveSanctions(data);
}

/**
 * Vérifie si un utilisateur est muté
 */
function isMuted(groupId, userId) {
    const data = loadSanctions();
    
    if (!data[groupId] || !data[groupId][userId]) return false;
    
    const user = data[groupId][userId];
    if (!user.muted) return false;
    
    // Vérifie si le mute a expiré
    if (user.muteUntil && Date.now() > user.muteUntil) {
        user.muted = false;
        user.muteUntil = 0;
        saveSanctions(data);
        return false;
    }
    
    return true;
}

/**
 * Réinitialise les warnings d'un utilisateur
 */
function resetWarnings(groupId, userId) {
    const data = loadSanctions();
    
    if (data[groupId] && data[groupId][userId]) {
        data[groupId][userId].warnings = [];
        data[groupId][userId].muted = false;
        data[groupId][userId].muteUntil = 0;
        saveSanctions(data);
    }
}

/**
 * Récupère les stats de sanctions d'un groupe
 */
function getGroupSanctions(groupId) {
    const data = loadSanctions();
    return data[groupId] || {};
}

/**
 * Enregistre une tentative de lien dans les logs
 */
function logLinkAttempt(groupId, userId, links, types) {
    const logPath = path.join(__dirname, '..', 'db', 'antilink-logs.json');
    let logs = [];
    
    if (fs.existsSync(logPath)) {
        try {
            logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        } catch (e) {
            logs = [];
        }
    }

    logs.push({
        groupId,
        userId,
        links,
        types,
        timestamp: Date.now()
    });

    // Garde seulement les 1000 derniers logs
    if (logs.length > 1000) {
        logs = logs.slice(-1000);
    }

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

module.exports = {
    addWarning,
    muteUser,
    isMuted,
    resetWarnings,
    getGroupSanctions,
    logLinkAttempt,
    getAction
};