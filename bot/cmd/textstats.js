module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '📊 .textstats <texte>' });
            const text = args.join(' ');
            const words = text.trim().split(/\s+/).length;
            const chars = text.length;
            const charsNoSpace = text.replace(/\s/g, '').length;
            const sentences = (text.match(/[.!?]+/g) || []).length || 1;
            await sock.sendMessage(from, {
                text: `📊 *STATISTIQUES DU TEXTE*\n\n📝 Mots: ${words}\n🔤 Caractères: ${chars} (${charsNoSpace} sans espaces)\n📄 Phrases: ${sentences}\n📏 Moyenne mots/phrase: ${(words/sentences).toFixed(1)}`
            });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
