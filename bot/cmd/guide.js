module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            await sock.sendMessage(from, {
                text: `📘 *GUIDE DE DÉMARRAGE*\n\n1️⃣ .menu — Découvre toutes les commandes\n2️⃣ .daily — Récupère ta récompense quotidienne\n3️⃣ .chatbot <message> — Discute avec l'IA\n4️⃣ .shop — Découvre la boutique\n5️⃣ .antilink on — Active la modération (admins)\n\n💡 Toutes les commandes commencent par un point (.)`
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
