const { getGroupSettings, setGroupSetting } = require('../lib/db');

const FEATURES = [
    'antilink', 'antibot', 'antiflood', 'antitoxic', 
    'antidelete', 'welcome', 'goodbye', 'autoread', 'autotype'
];

module.exports = {
    execute: async (sock, msg, from, args) => {
        const feature = args[0]?.toLowerCase();
        const option = args[1]?.toLowerCase();

        if (!feature || !FEATURES.includes(feature)) {
            let text = `⚙️ *COMMANDES DE PROTECTION*\n\n`;
            text += `Usage : .set <feature> on/off\n\n`;
            text += `*Features disponibles :*\n`;
            FEATURES.forEach(f => {
                const settings = getGroupSettings(from);
                const status = settings[f] ? "✅" : "❌";
                text += `${status} ${f}\n`;
            });
            return sock.sendMessage(from, { text });
        }

        if (!['on', 'off'].includes(option)) {
            return sock.sendMessage(from, { text: `❌ Usage : .set ${feature} on/off` });
        }

        setGroupSetting(from, feature, option === 'on');
        const emoji = option === 'on' ? '✅' : '❌';
        const status = option === 'on' ? 'activé' : 'désactivé';
        
        return sock.sendMessage(from, { 
            text: `${emoji} *${feature}* ${status} !` 
        });
    }
};
