const mumaker = require('mumaker');

// URLs ephoto360 identifiées dans Knight Bot (textmaker.js) — un seul point de vérité,
// chaque commande cmd/<style>.js est un mince wrapper autour de generateTextEffect().
const EFFECTS = {
    metallic: "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
    ice: "https://en.ephoto360.com/ice-text-effect-online-101.html",
    snow: "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
    impressive: "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
    matrix: "https://en.ephoto360.com/matrix-text-effect-154.html",
    light: "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
    neon: "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
    devil: "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
    purple: "https://en.ephoto360.com/purple-text-effect-online-100.html",
    thunder: "https://en.ephoto360.com/thunder-text-effect-online-97.html",
    leaves: "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html",
    "1917": "https://en.ephoto360.com/1917-style-text-effect-523.html",
    arena: "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html",
    hacker: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html",
    sand: "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html",
    blackpink: "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html",
    glitch: "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
    fire: "https://en.ephoto360.com/flame-lettering-effect-372.html"
};

async function generateTextEffect(sock, from, args, styleName) {
    if (!args || args.length === 0) {
        return await sock.sendMessage(from, { text: `❌ Fournis un texte\nExemple: .${styleName} Bonjour` });
    }
    const text = args.join(' ');
    try {
        await sock.sendMessage(from, { text: '🎨 Génération en cours...' });
        const result = await mumaker.ephoto(EFFECTS[styleName], text);
        const imageUrl = result?.image || result?.url || result;
        await sock.sendMessage(from, { image: { url: imageUrl }, caption: `✦ Effet: ${styleName}` });
    } catch (error) {
        console.error(`Erreur textEffect ${styleName}:`, error.message);
        await sock.sendMessage(from, { text: `❌ Erreur lors de la génération de l'effet "${styleName}" (service temporairement indisponible)` });
    }
}

module.exports = { generateTextEffect, EFFECTS };
