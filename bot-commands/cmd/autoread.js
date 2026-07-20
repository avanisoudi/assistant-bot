const { getGroupSettings, setGroupSetting } = require('../lib/db');

module.exports = {
    execute: async (sock, msg, from, args) => {
        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            setGroupSetting(from, 'autoread', true);
            return sock.sendMessage(from, { text: "👁️ *Autoread activé !*" });
        } else if (option === 'off') {
            setGroupSetting(from, 'autoread', false);
            return sock.sendMessage(from, { text: "👁️ *Autoread désactivé.*" });
        } else {
            const settings = getGroupSettings(from);
            const status = settings.autoread ? "✅ Activé" : "❌ Désactivé";
            return sock.sendMessage(from, { text: `👁️ *Autoread :* ${status}\n\nUsage : .autoread on/off` });
        }
    }
};
