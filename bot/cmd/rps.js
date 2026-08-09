const CHOICES = ['pierre', 'papier', 'ciseaux'];
const EMOJIS = { pierre: '🪨', papier: '📄', ciseaux: '✂️' };
module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            const userChoice = args[0]?.toLowerCase();
            if (!CHOICES.includes(userChoice)) return await sock.sendMessage(from, { text: '🎮 .rps pierre/papier/ciseaux' });

            const botChoice = CHOICES[Math.floor(Math.random() * 3)];
            let result;
            if (userChoice === botChoice) result = '🤝 Égalité !';
            else if ((userChoice === 'pierre' && botChoice === 'ciseaux') || (userChoice === 'papier' && botChoice === 'pierre') || (userChoice === 'ciseaux' && botChoice === 'papier')) result = '🎉 Tu as gagné !';
            else result = '😢 Tu as perdu !';

            await sock.sendMessage(from, { text: `${EMOJIS[userChoice]} vs ${EMOJIS[botChoice]}\n\nToi: ${userChoice}\nBot: ${botChoice}\n\n${result}` });
        } catch (error) { await sock.sendMessage(from, { text: '❌ Erreur' }); }
    }
};
