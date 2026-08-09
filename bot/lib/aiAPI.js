const axios = require('axios');

// Liste des APIs AI gratuites, testées côté structure (voir note fiabilité dans le changelog)
const AI_ENDPOINTS = {
    pollinations: "https://gen.pollinations.ai/text/",
    gpt4: "https://ultimetron.guruapi.tech/gpt4?prompt=",
    gemini: "https://ultimetron.guruapi.tech/gemini?prompt=",
    perplexity: "https://api.bk9.dev/ai/Perplexity?q=",
    jeeves: "https://api.bk9.dev/ai/jeeves-chat?q=",
    blackbox: "https://api.bk9.dev/ai/BK93?BK9=default&q=",
    zell: "https://zellapi.autos/ai/chatbot?text="
};

// Ordre d'essai automatique si une API échoue ou timeout — pollinations.ai en premier
// (service actif et à jour, largement utilisé, contrairement aux petites APIs suivantes
// dont la disponibilité à long terme est incertaine)
const FALLBACK_ORDER = ['pollinations', 'gpt4', 'zell', 'gemini', 'jeeves', 'perplexity', 'blackbox'];

async function callEndpoint(apiName, prompt) {
    const endpoint = AI_ENDPOINTS[apiName];
    const url = endpoint + encodeURIComponent(prompt);

    const response = await axios.get(url, {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*'
        }
    });

    const data = response.data;
    if (typeof data === 'string' && data.trim().length > 0) return data.trim();
    if (data?.BK9) return data.BK9;
    if (data?.result) return data.result;
    if (data?.response) return data.response;
    if (data?.message) return data.message;
    if (data?.answer) return data.answer;
    if (data?.text) return data.text;
    if (data?.content) return data.content;
    throw new Error('Format de réponse inconnu ou vide');
}

// Récupère une réponse IA. Si apiName est fourni, l'essaie en premier puis bascule sur
// les autres APIs disponibles en cas d'échec (timeout, panne, format inattendu) — plutôt
// que d'abandonner dès la première erreur.
async function fetchAIResponse(prompt, apiName = 'gpt4') {
    const order = [apiName, ...FALLBACK_ORDER.filter(a => a !== apiName)];

    for (const name of order) {
        try {
            return await callEndpoint(name, prompt);
        } catch (error) {
            console.error(`AI Error (${name}):`, error.message);
            // essaie la suivante automatiquement
        }
    }

    return "Erreur : toutes les APIs IA sont indisponibles pour le moment. Réessaie dans quelques minutes.";
}

module.exports = { fetchAIResponse, AI_ENDPOINTS };
