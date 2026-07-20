// 🛡️ LIBRAIRIE ANTILINK ULTRA
// Détecte TOUT type de lien, même déguisé

// 📋 Liste des domaines de raccourcissement connus
const SHORTENER_DOMAINS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd',
    'buff.ly', 'rebrand.ly', 'bl.ink', 'short.io', 'cutt.ly',
    'v.gd', 'lnkd.in', 'surl.li', 'shorturl.at', 'rb.shorturl.at'
];

// 📋 Domaines WhatsApp
const WHATSAPP_DOMAINS = [
    'chat.whatsapp.com', 'wa.me', 'whatsapp.com', 'api.whatsapp.com',
    'web.whatsapp.com', 'faq.whatsapp.com', 'blog.whatsapp.com'
];

// 📋 Réseaux sociaux et plateformes
const SOCIAL_DOMAINS = [
    'facebook.com', 'fb.com', 'instagram.com', 'tiktok.com',
    'twitter.com', 'x.com', 'youtube.com', 'youtu.be',
    'telegram.org', 't.me', 'discord.gg', 'discord.com',
    'snapchat.com', 'pinterest.com', 'reddit.com', 'twitch.tv',
    'linkedin.com', 'threads.net', 'vk.com'
];

// 🔗 Regex principale (détection basique)
const LINK_REGEX = /(?:https?:\/\/|www\.)[^\s]+/gi;

// 🔗 Regex WhatsApp
const WHATSAPP_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:chat\.whatsapp\.com|wa\.me|whatsapp\.com)\/[^\s]+/gi;

// 🔗 Regex pour liens sans http (exemple.com)
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|me|xyz|app|dev|info|biz|tv|cc|co|fr|be|ca|uk|de|es|it|ru|cn|jp|br|in|au|gov|edu)\b/gi;

// 🔗 Regex pour liens obfusqués (exemple[.]com, exemple(.)com)
const OBFUSCATED_REGEX = /\b[a-z0-9]+[\s]*[\[\(]\s*[\.]\s*[\]\)][\s]*[a-z]{2,}\b/gi;

// 🔗 Regex pour liens avec espaces (w w w . e x a m p l e . c o m)
const SPACED_REGEX = /w\s*w\s*w\s*\.\s*[a-z0-9\s]+\s*\.\s*[a-z]{2,}/gi;

// 🔗 Regex pour invitations WhatsApp (codes de 25 caractères)
const WA_INVITE_REGEX = /\b[A-Za-z0-9]{20,25}\b/g;

// 🔗 Regex pour numéros de téléphone (peuvent être utilisés pour WhatsApp)
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

/**
 * Nettoie un texte pour détecter les liens déguisés
 */
function normalizeText(text) {
    if (!text) return '';
    
    return text
        // Remplace les caractères Unicode similaires
        .replace(/[а-яА-Я]/g, c => {
            const map = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
            return map[c.toLowerCase()] || c;
        })
        // Supprime les caractères invisibles
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Normalise les espaces
        .replace(/\s+/g, ' ');
}

/**
 * Détecte TOUS types de liens dans un texte
 * @returns {Object} { hasLink: boolean, links: Array, types: Array }
 */
function detectLinks(text) {
    if (!text || typeof text !== 'string') {
        return { hasLink: false, links: [], types: [] };
    }

    const normalizedText = normalizeText(text);
    const links = [];
    const types = new Set();

    // 1. Liens classiques (http/https)
    const httpLinks = text.match(LINK_REGEX) || [];
    if (httpLinks.length > 0) {
        links.push(...httpLinks);
        types.add('http');
    }

    // 2. Liens WhatsApp spécifiques
    const waLinks = text.match(WHATSAPP_REGEX) || [];
    if (waLinks.length > 0) {
        links.push(...waLinks);
        types.add('whatsapp');
    }

    // 3. Domaines sans http
    const domains = text.match(DOMAIN_REGEX) || [];
    if (domains.length > 0) {
        links.push(...domains);
        types.add('domain');
    }

    // 4. Liens obfusqués
    const obfuscated = text.match(OBFUSCATED_REGEX) || [];
    if (obfuscated.length > 0) {
        links.push(...obfuscated);
        types.add('obfuscated');
    }

    // 5. Liens avec espaces
    const spaced = text.match(SPACED_REGEX) || [];
    if (spaced.length > 0) {
        links.push(...spaced);
        types.add('spaced');
    }

    // 6. Liens dans le texte normalisé (anti-contournement)
    const normalizedLinks = normalizedText.match(LINK_REGEX) || [];
    if (normalizedLinks.length > 0) {
        links.push(...normalizedLinks);
        types.add('normalized');
    }

    // 7. Codes d'invitation WhatsApp (25 caractères)
    const inviteCodes = text.match(WA_INVITE_REGEX) || [];
    for (const code of inviteCodes) {
        if (code.length >= 20 && code.length <= 25 && /[A-Za-z0-9]/.test(code)) {
            // Vérifie si c'est vraiment un code d'invitation (pas un mot normal)
            const hasMixedCase = /[A-Z]/.test(code) && /[a-z]/.test(code);
            const hasNumbers = /[0-9]/.test(code);
            if (hasMixedCase || hasNumbers) {
                links.push(code);
                types.add('invite_code');
            }
        }
    }

    // 8. Raccourcisseurs d'URL
    for (const shortener of SHORTENER_DOMAINS) {
        if (text.toLowerCase().includes(shortener)) {
            types.add('shortener');
            break;
        }
    }

    // 9. Réseaux sociaux
    for (const social of SOCIAL_DOMAINS) {
        if (text.toLowerCase().includes(social)) {
            types.add('social');
            break;
        }
    }

    // Déduplication
    const uniqueLinks = [...new Set(links)];

    return {
        hasLink: uniqueLinks.length > 0,
        links: uniqueLinks,
        types: [...types]
    };
}

/**
 * Vérifie si un lien est dans la whitelist
 */
function isWhitelisted(link, whitelist = []) {
    if (!link || !whitelist || whitelist.length === 0) return false;
    
    const lowerLink = link.toLowerCase();
    
    return whitelist.some(domain => {
        const lowerDomain = domain.toLowerCase();
        return lowerLink.includes(lowerDomain);
    });
}

/**
 * Vérifie si TOUS les liens détectés sont whitelistés
 */
function allLinksWhitelisted(links, whitelist = []) {
    if (!links || links.length === 0) return true;
    if (!whitelist || whitelist.length === 0) return false;
    
    return links.every(link => isWhitelisted(link, whitelist));
}

/**
 * Catégorise les liens détectés
 */
function categorizeLinks(links) {
    const categories = {
        whatsapp: [],
        shortener: [],
        social: [],
        other: []
    };

    for (const link of links) {
        const lower = link.toLowerCase();
        
        if (WHATSAPP_DOMAINS.some(d => lower.includes(d))) {
            categories.whatsapp.push(link);
        } else if (SHORTENER_DOMAINS.some(d => lower.includes(d))) {
            categories.shortener.push(link);
        } else if (SOCIAL_DOMAINS.some(d => lower.includes(d))) {
            categories.social.push(link);
        } else {
            categories.other.push(link);
        }
    }

    return categories;
}

module.exports = {
    detectLinks,
    isWhitelisted,
    allLinksWhitelisted,
    categorizeLinks,
    normalizeText,
    SHORTENER_DOMAINS,
    WHATSAPP_DOMAINS,
    SOCIAL_DOMAINS
};