const SHOP_ITEMS = {
    // 🛠️ Outils (effet réel connecté au gameplay)
    'canne': { price: 200, emoji: '🎣', desc: 'Pour pêcher des coins bonus', category: 'Outils' },
    'pelle': { price: 350, emoji: '⛏️', desc: 'Bonus +50% sur .mining', category: 'Outils' },
    'carte': { price: 500, emoji: '🗺️', desc: 'Augmente tes chances sur .treasure', category: 'Outils' },
    'lunettes': { price: 450, emoji: '👓', desc: 'Bonus +20% de réussite sur .hunt', category: 'Outils' },
    'bouclier': { price: 800, emoji: '🛡️', desc: 'Protège contre .rob (30 min par unité, cumulable)', category: 'Outils' },
    'assurance': { price: 600, emoji: '📋', desc: 'Réduit de moitié TON amende si un .rob que tu tentes échoue', category: 'Outils' },

    // 🎁 Consommables (effet à usage unique)
    'potion_xp': { price: 700, emoji: '🧪', desc: 'Double les gains de ton prochain .work', category: 'Consommables' },
    'multiplicateur': { price: 1200, emoji: '✨', desc: 'Double les gains de ton prochain .daily', category: 'Consommables' },
    'coffre_mystere': { price: 300, emoji: '🎁', desc: 'S\'ouvre immédiatement : 50 à 800 coins au hasard', category: 'Consommables' },
    'ticket_loterie': { price: 90, emoji: '🎟️', desc: 'Équivalent à un ticket .lottery gratuit', category: 'Consommables' },

    // 👑 Cosmétiques (aucun effet gameplay, juste pour le statut/flex)
    'couronne': { price: 5000, emoji: '👑', desc: 'Statut VIP, juste pour flex', category: 'Cosmétiques' },
    'diamant': { price: 10000, emoji: '💎', desc: 'Objet de collection rare, juste pour flex', category: 'Cosmétiques' },
    'baguette': { price: 1500, emoji: '🪄', desc: 'Accessoire cosmétique', category: 'Cosmétiques' },
    'cape': { price: 2000, emoji: '🧥', desc: 'Accessoire cosmétique', category: 'Cosmétiques' },
    'medaille_or': { price: 3000, emoji: '🥇', desc: 'Trophée cosmétique à afficher fièrement', category: 'Cosmétiques' },
    'etoile': { price: 800, emoji: '⭐', desc: 'Petit accessoire cosmétique', category: 'Cosmétiques' }
};

module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const categories = {};
            for (const [key, item] of Object.entries(SHOP_ITEMS)) {
                if (!categories[item.category]) categories[item.category] = [];
                categories[item.category].push({ key, ...item });
            }

            let text = `🛒 *BOUTIQUE*\n\n`;
            for (const [cat, items] of Object.entries(categories)) {
                text += `*${cat}*\n`;
                items.forEach(item => { text += `${item.emoji} *${item.key}* — ${item.price} coins\n   ${item.desc}\n`; });
                text += `\n`;
            }
            text += `💡 Achète avec: .buy <objet> [quantité]`;
            await sock.sendMessage(from, { text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    },
    SHOP_ITEMS
};
