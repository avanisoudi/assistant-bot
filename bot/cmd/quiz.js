const axios = require('axios');
const { addCoins } = require('../lib/economy');

const JOIN_WINDOW_MS = 15000; // 15s pour rejoindre
const ANSWER_WINDOW_MS = 30000; // 30s pour répondre
const REWARD_COINS = 150;

function decodeHTML(text) {
    const entities = { '&quot;': '"', '&#039;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à', '&ccedil;': 'ç', '&ocirc;': 'ô', '&ecirc;': 'ê' };
    return text.replace(/&quot;|&#039;|&amp;|&lt;|&gt;|&eacute;|&egrave;|&agrave;|&ccedil;|&ocirc;|&ecirc;/g, m => entities[m]);
}

// OpenTDB n'existe qu'en anglais — on traduit à la volée (en parallèle pour limiter
// la latence). Si la traduction échoue, on retombe sur le texte anglais original
// plutôt que de faire planter le quiz.
async function translateFR(text) {
    try {
        const res = await axios.get('https://api.mymemory.translated.net/get', {
            params: { q: text, langpair: 'en|fr' },
            timeout: 8000
        });
        return res.data?.responseData?.translatedText || text;
    } catch (e) {
        return text;
    }
}

async function translateAll(question, answers, category) {
    const [qFr, catFr, ...answersFr] = await Promise.all([
        translateFR(question),
        translateFR(category),
        ...answers.map(a => translateFR(a))
    ]);
    return { question: qFr, category: catFr, answers: answersFr };
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

if (!global.quizSessions) global.quizSessions = {};

async function startQuestion(sock, from, isAnime) {
    const session = global.quizSessions[from];
    if (!session) return;

    try {
        const categoryParam = isAnime ? '&category=31' : '';
        const res = await axios.get(`https://opentdb.com/api.php?amount=1&type=multiple${categoryParam}`, { timeout: 10000 });
        const q = res.data?.results?.[0];

        if (!q) {
            await sock.sendMessage(from, { text: '❌ Impossible de charger la question, quiz annulé' });
            delete global.quizSessions[from];
            return;
        }

        const question = decodeHTML(q.question);
        const correctAnswerEN = decodeHTML(q.correct_answer);
        const allAnswersEN = [...q.incorrect_answers.map(decodeHTML), correctAnswerEN];

        const translated = await translateAll(question, allAnswersEN, q.category);
        const correctAnswer = translated.answers[translated.answers.length - 1]; // dernière position = la bonne réponse (avant mélange)
        const allAnswers = shuffle(translated.answers);
        const letters = ['A', 'B', 'C', 'D'];
        const correctLetter = letters[allAnswers.indexOf(correctAnswer)];

        session.phase = 'answering';
        session.correctAnswer = correctAnswer;
        session.correctLetter = correctLetter;
        session.answered = new Set();

        let text = `🧠 *QUIZ${isAnime ? ' ANIME' : ''}* (${translated.category})\n\n${translated.question}\n\n`;
        allAnswers.forEach((a, i) => { text += `${letters[i]}) ${a}\n`; });
        text += `\n⏱️ Vous avez 30 secondes ! Réponds avec: .quiz <lettre>`;

        await sock.sendMessage(from, { text });

        session.timeout = setTimeout(async () => {
            const s = global.quizSessions[from];
            if (!s || s.phase !== 'answering') return;
            delete global.quizSessions[from];
            await sock.sendMessage(from, { text: `⏰ Temps écoulé ! La bonne réponse était "${correctAnswer}" (${correctLetter})` });
        }, ANSWER_WINDOW_MS);

    } catch (error) {
        console.error('Erreur quiz startQuestion:', error);
        await sock.sendMessage(from, { text: '❌ Erreur lors du chargement du quiz' });
        delete global.quizSessions[from];
    }
}

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const sender = msg.key.participant || msg.key.remoteJid;
            const action = args[0]?.toLowerCase();
            const isAnime = action === 'anime' || (global.quizSessions[from]?.isAnime && action !== 'join');

            // Répondre à une question en cours
            if (global.quizSessions[from]?.phase === 'answering' && /^[abcd]$/i.test(args[0] || '')) {
                const session = global.quizSessions[from];
                if (!session.players.has(sender)) {
                    return await sock.sendMessage(from, { text: '❌ Tu dois rejoindre la partie avec .quiz join avant de répondre' });
                }
                if (session.answered.has(sender)) {
                    return await sock.sendMessage(from, { text: '⚠️ Tu as déjà répondu' });
                }
                session.answered.add(sender);

                const guess = args[0].toUpperCase();
                if (guess === session.correctLetter) {
                    clearTimeout(session.timeout);
                    delete global.quizSessions[from];
                    addCoins(sender, REWARD_COINS);
                    return await sock.sendMessage(from, {
                        text: `✅ @${sender.split('@')[0]} a trouvé la bonne réponse: "${session.correctAnswer}" !\n💰 +${REWARD_COINS} coins`,
                        mentions: [sender]
                    });
                }
                return await sock.sendMessage(from, { text: `❌ Mauvaise réponse, réessaie !` });
            }

            // Rejoindre une partie en attente
            if (action === 'join') {
                const session = global.quizSessions[from];
                if (!session || session.phase !== 'joining') {
                    return await sock.sendMessage(from, { text: '❌ Aucune partie en attente. Tape .quiz pour en lancer une' });
                }
                if (session.players.has(sender)) {
                    return await sock.sendMessage(from, { text: '⚠️ Tu as déjà rejoint !' });
                }
                session.players.add(sender);
                return await sock.sendMessage(from, { text: `✅ @${sender.split('@')[0]} a rejoint le quiz ! (${session.players.size} joueur(s))`, mentions: [sender] });
            }

            // Lancer une nouvelle partie
            if (global.quizSessions[from]) {
                return await sock.sendMessage(from, { text: '❌ Une partie est déjà en cours dans ce groupe' });
            }

            global.quizSessions[from] = { phase: 'joining', players: new Set(), isAnime };

            await sock.sendMessage(from, {
                text: `🎮 *QUIZ${isAnime ? ' ANIME' : ''} — Rejoins la partie !*\n\nTape *.quiz join* pour participer\n⏳ Début dans 15 secondes...`
            });

            setTimeout(async () => {
                const session = global.quizSessions[from];
                if (!session || session.phase !== 'joining') return;
                if (session.players.size === 0) {
                    delete global.quizSessions[from];
                    return await sock.sendMessage(from, { text: '😢 Personne n\'a rejoint, quiz annulé' });
                }
                await startQuestion(sock, from, isAnime);
            }, JOIN_WINDOW_MS);

        } catch (error) {
            console.error('Erreur quiz:', error);
            await sock.sendMessage(from, { text: '❌ Erreur' });
            delete global.quizSessions[from];
        }
    }
};
