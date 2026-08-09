module.exports = {
    execute: async (sock, msg, from, args) => {
        try {
            if (args.length === 0) return await sock.sendMessage(from, { text: '❌ .animals <animal>' });
            const animal = args.join(' ');
            await sock.sendMessage(from, { text: `🦁 *ANIMAL: ${animal}*\n\n🌍 Habitat: Afrique\n👥 Population: Diminue\n🍖 Régime: Carnivore\n📏 Taille: Grande\n⚡ Vitesse: 60 km/h` });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ Erreur' });
        }
    }
};
