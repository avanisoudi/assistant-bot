 const axios = require('axios');

const LANG_NAMES = {

    fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand', it: 'Italien',

    pt: 'Portugais', ar: 'Arabe', zh: 'Chinois', ja: 'Japonais', ko: 'Coréen',

    ru: 'Russe', nl: 'Néerlandais', tr: 'Turc', hi: 'Hindi', sw: 'Swahili'

};

const FLAGS = {

    fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹',

    pt: '🇵🇹', ar: '🇸🇦', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷',

    ru: '🇷🇺', nl: '🇳🇱', tr: '🇹🇷', hi: '🇮🇳', sw: '🇹🇿'

};

// Stockage temporaire pour le mode discussion (par utilisateur)

const chatMode = new Map();

async function translateText(text, targetLang) {

    const response = await axios.get('https://api.mymemory.translated.net/get', {

        params: { q: text, langpair: `autodetect|${targetLang}` },

        timeout: 10000

    });

    return response.data;

}

module.exports = {

    execute: async (sock, msg, from, args) => {

        try {

            // Mode discussion : arrêter le mode

            if (args[0] === 'stop' && chatMode.has(from)) {

                chatMode.delete(from);

                return await sock.sendMessage(from, { text: '🛑 Mode traduction automatique désactivé' });

            }

            // Mode discussion : activer

            if (args[0] === 'chat' && args[1]) {

                const lang = args[1].toLowerCase();

                if (!LANG_NAMES[lang]) {

                    return await sock.sendMessage(from, { text: `❌ Code langue inconnu: "${lang}"` });

                }

                chatMode.set(from, lang);

                return await sock.sendMessage(from, { text: `🔄 Mode traduction automatique activé vers ${FLAGS[lang]} ${LANG_NAMES[lang]}\n\nTous tes messages seront traduits automatiquement.\nTape .trt stop pour désactiver.` });

            }

            // Si pas de mode discussion, traduction normale

            if (args.length < 2) {

                const buttons = [

                    { buttonId: '.trt fr ', buttonText: { displayText: '🇫🇷 Français' }, type: 1 },

                    { buttonId: '.trt en ', buttonText: { displayText: '🇬🇧 English' }, type: 1 },

                    { buttonId: '.trt es ', buttonText: { displayText: '🇪🇸 Español' }, type: 1 }

                ];

                return await sock.sendMessage(from, {

                    text: `🌐 *.trt <langue> <texte>*\n\n📌 *Modes disponibles:*\n• .trt fr Bonjour → Traduction simple\n• .trt fr,en Bonjour → Multilingue\n• .trt chat fr → Mode discussion\n• .trt stop → Arrêter le mode\n\n💡 Réponds à un message avec .trt fr pour le traduire`,

                    footer: 'Choisis une langue fréquente 👇',

                    buttons: buttons,

                    headerType: 1

                });

            }

            // Traduire un message cité

            let text;

            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

                const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

                text = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || '';

                if (!text) return await sock.sendMessage(from, { text: '❌ Le message cité ne contient pas de texte' });

            } else {

                const targetLang = args[0].toLowerCase();

                text = args.slice(1).join(' ');

            }

            // Traduction multilingue

            const targets = args[0].toLowerCase().split(',');

            

            if (targets.length > 1) {

                // Mode multilingue

                let result = `🌐 *TRADUCTION MULTILINGUE*\n\n📝 ${text}\n\n`;

                

                for (const lang of targets) {

                    if (!LANG_NAMES[lang]) continue;

                    try {

                        const data = await translateText(text, lang);

                        if (data.responseStatus === 200) {

                            result += `${FLAGS[lang]} *${LANG_NAMES[lang]}*: ${data.responseData.translatedText}\n\n`;

                        }

                    } catch (e) {

                        result += `${FLAGS[lang]} *${LANG_NAMES[lang]}*: ❌ Échec\n\n`;

                    }

                }

                

                return await sock.sendMessage(from, { text: result });

            }

            // Traduction simple

            const targetLang = targets[0];

            if (!LANG_NAMES[targetLang]) {

                return await sock.sendMessage(from, { text: `❌ Code langue inconnu: "${targetLang}"\n\nDisponibles: ${Object.keys(LANG_NAMES).join(', ')}` });

            }

            const data = await translateText(text, targetLang);

            if (data.responseStatus !== 200 || !data.responseData?.translatedText) {

                return await sock.sendMessage(from, { text: '❌ Le service de traduction n\'a pas pu traiter cette demande' });

            }

            const translated = data.responseData.translatedText;

            const detectedLang = data.responseData.match?.language || 'auto';

            const detectedName = LANG_NAMES[detectedLang] || detectedLang;

            await sock.sendMessage(from, {

                text: `🌐 *TRADUCTION*\n\n📝 ${text}\n\n${FLAGS[detectedLang] || '🌍'} *${detectedName}* → ${FLAGS[targetLang]} *${LANG_NAMES[targetLang]}*\n\n\`\`\`${translated}\`\`\``

            });

        } catch (error) {

            console.error('Erreur trt:', error.message);

            await sock.sendMessage(from, { text: '❌ Erreur lors de la traduction (service indisponible, réessaie dans un instant)' });

        }

    },

    // Gestionnaire pour le mode discussion automatique

    chatHandler: async (sock, msg, from) => {

        if (!chatMode.has(from)) return false;

        

        const targetLang = chatMode.get(from);

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        

        if (!text || text.startsWith('.')) return false; // Ignorer les commandes

        

        try {

            const data = await translateText(text, targetLang);

            if (data.responseStatus === 200 && data.responseData?.translatedText) {

                const translated = data.responseData.translatedText;

                await sock.sendMessage(from, {

                    text: `${FLAGS[targetLang]} ${translated}`

                });

            }

        } catch (e) {

            // Ignorer silencieusement les erreurs en mode chat

        }

        

        return true;

    }

};