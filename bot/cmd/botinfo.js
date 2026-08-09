module.exports = {
    execute: async (sock, msg, from, args) => {
        const package = require('../package.json');
        let text = `*🤖 Infos du Bot*\n\n`;
        text += `📝 Nom: AssistantBot\n`;
        text += `📊 Version: V1.1.9\n`;
        text += `🆚 Total Commandes: 300+\n`;
        text += `⚙️ Status: ✅ Actif\n`;
        text += `🚀 Mode: Production\n`;
        text += `📅 Créé: ©2026`;
        
        await sock.sendMessage(from, { text });
    }
};
