const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '..', 'db', 'stats.json');

function loadStats() {
    if (!fs.existsSync(statsPath)) {
        fs.mkdirSync(path.dirname(statsPath), { recursive: true });
        fs.writeFileSync(statsPath, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    } catch (e) {
        return {};
    }
}

function saveStats(stats) {
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

// 📊 Enregistre un message dans les stats
function trackMessage(groupId, sender, messageData) {
    const stats = loadStats();
    
    if (!stats[groupId]) {
        stats[groupId] = {
            totalMessages: 0,
            users: {},
            createdAt: Date.now()
        };
    }
    
    if (!stats[groupId].users[sender]) {
        stats[groupId].users[sender] = {
            count: 0,
            types: {},
            hours: {},
            words: [],
            lastMessages: [],
            firstSeen: Date.now(),
            lastSeen: Date.now()
        };
    }
    
    const user = stats[groupId].users[sender];
    user.count++;
    user.lastSeen = Date.now();
    
    // Type de message
    const type = messageData.type || 'text';
    user.types[type] = (user.types[type] || 0) + 1;
    
    // Heure du message (0-23)
    const hour = new Date().getHours();
    user.hours[hour] = (user.hours[hour] || 0) + 1;
    
    // Mots du message (pour wordcloud et analyse)
    if (messageData.text && messageData.text.length > 0) {
        const words = messageData.text.toLowerCase()
            .replace(/[^\w\sàâäéèêëïîôùûüÿç]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3); // Mots de plus de 3 lettres
        
        // Garde les 50 derniers mots
        user.words = [...user.words, ...words].slice(-50);
        
        // Garde les 20 derniers messages pour le stalk
        user.lastMessages.push({
            text: messageData.text.substring(0, 100),
            time: Date.now()
        });
        if (user.lastMessages.length > 20) {
            user.lastMessages.shift();
        }
    }
    
    stats[groupId].totalMessages++;
    
    // Limite la taille : garde seulement 100 users les plus actifs
    const usersArray = Object.entries(stats[groupId].users);
    if (usersArray.length > 100) {
        usersArray.sort((a, b) => b[1].count - a[1].count);
        const topUsers = usersArray.slice(0, 100);
        stats[groupId].users = Object.fromEntries(topUsers);
    }
    
    saveStats(stats);
}

// Récupère les stats d'un groupe
function getGroupStats(groupId) {
    const stats = loadStats();
    return stats[groupId] || { totalMessages: 0, users: {} };
}

// Réinitialise les stats d'un groupe
function resetGroupStats(groupId) {
    const stats = loadStats();
    delete stats[groupId];
    saveStats(stats);
}

module.exports = { trackMessage, getGroupStats, resetGroupStats, loadStats, saveStats };
