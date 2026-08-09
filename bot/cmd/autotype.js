const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'autotype', true);
            return sock.sendMessage(from, { text: "⌨️ *Autotype activé !*" });
        } else if (option === 'off') {
            setGroupSetting(from, 'autotype', false);
            return sock.sendMessage(from, { text: "⌨️ *Autotype désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.autotype ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `⌨️ *Autotype :* ${status}\n\nUsage : .autotype on/off` });
        }
    }
};
