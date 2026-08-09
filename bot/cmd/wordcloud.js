const { getGroupStats } = require('../lib/stats');

module.exports = {
    execute: async (sock, msg, from, args) => {
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Groupe uniquement !" });
        }

        const stats = getGroupStats(from);
        const users = Object.entries(stats.users);

        if (users.length === 0) {
            return sock.sendMessage(from, { text: "📊 Aucune statistique enregistrée." });
        }

        // Agrège tous les mots
        const wordCount = {};
        users.forEach(([_, data]) => {
            data.words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
        });

        // Trie et prend les 30 mots les plus fréquents
        const topWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30);

        if (topWords.length === 0) {
            return sock.sendMessage(from, { text: "📊 Pas assez de données pour générer un nuage de mots." });
        }

        // Génère l'URL du nuage de mots via QuickChart (gratuit)
        const chartData = topWords.map(([word, count]) => ({
            text: word,
            size: Math.max(10, Math.min(80, count * 2))
        }));

        const chartConfig = {
            type: 'wordCloud',
            data: {
                labels: topWords.map(([word]) => word),
                datasets: [{
                    label: 'Words',
                    data: topWords.map(([_, count]) => count)
                }]
            },
            options: {
                wordCloud: {
                    rotation: 0,
                    color: '#FF6B6B,#4ECDC4,#45B7D1,#FFA07A,#98D8C8,#F7DC6F'
                }
            }
        };

        const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=800&h=600&bkg=white`;

        // Texte récapitulatif
        let text = `╭───「 ☁️ *NUAGE DE MOTS* 」\n`;
        text += `│\n`;
        text += `│ *🔝 TOP 15 DES MOTS :*\n`;
        topWords.slice(0, 15).forEach(([word, count], i) => {
            text += `│ ${i + 1}. *${word}* (${count}x)\n`;
        });
        text += `│\n`;
        text += `│ 📊 Total mots analysés : *${Object.values(wordCount).reduce((a, b) => a + b, 0)}*\n`;
        text += `╰──────────────────`;

        try {
            await sock.sendMessage(from, {
                image: { url: chartUrl },
                caption: text
            });
        } catch (e) {
            // Si l'image ne charge pas, envoie juste le texte
            await sock.sendMessage(from, { text });
        }
    }
};
