// 📖 Descriptions détaillées pour .help <commande>. Toutes les commandes ne sont pas
// listées ici — celles absentes utilisent un repli automatique (voir help.js) qui
// essaie d'extraire le message d'usage intégré à la commande elle-même.
module.exports = {
    // Modération
    ban: "Bannit un membre du groupe. Réponds à son message ou mentionne-le : .ban @user",
    unban: "Ré-ajoute un numéro précédemment banni : .unban <numéro>",
    kick: "Expulse un membre du groupe : .kick @user",
    mute: "Met le groupe en mode silencieux (seuls les admins peuvent écrire) : .mute",
    unmute: "Réouvre le groupe à tout le monde : .unmute",
    warn: "Donne un avertissement à un membre (3 = expulsion auto) : .warn @user <raison>",
    promote: "Rend un membre admin du groupe : .promote @user",
    demote: "Retire le statut admin d'un membre : .demote @user",
    antilink: "Supprime automatiquement les liens envoyés par les non-admins : .antilink on/off",
    antibot: "Expulse automatiquement les numéros blacklistés à l'arrivée : .antibot on/off",
    antidelete: "Republie les messages supprimés par leur auteur : .antidelete on/off",
    antiflood: "Expulse automatiquement les membres qui spamment (5 msg/5s) : .antiflood on/off",
    antispam: "Avertit (sans expulser) les membres qui envoient trop de messages : .antispam on/off",
    antitoxic: "Supprime les messages contenant des mots toxiques : .antitoxic on/off",
    antiviewonce: "Republie automatiquement les médias envoyés en vue unique : .antiviewonce on/off",
    votekick: "Lance un vote pour expulser un membre (3 votes en 10 min) : .votekick @user",
    rules: "Affiche ou définit le règlement du groupe : .rules ou .rules set <texte>",

    // Économie
    daily: "Récupère ta récompense quotidienne en coins : .daily",
    work: "Travaille pour gagner 1000 à 2000 coins (cooldown 3 min) : .work",
    balance: "Affiche ton solde de coins : .balance",
    shop: "Affiche la boutique d'objets achetables : .shop",
    buy: "Achète un objet de la boutique : .buy <objet>",
    sell: "Revend un objet de ton inventaire : .sell <objet>",
    inventory: "Affiche les objets que tu possèdes : .inventory",
    gift: "Offre des coins à quelqu'un : .gift @user <montant>",
    rob: "Tente de voler des coins à quelqu'un (risqué) : .rob @user",
    leaderboard: "Classement des joueurs les plus riches : .leaderboard",
    redeem: "Échange un code cadeau contre des coins : .redeem <code>",

    // Jeux
    quiz: "Lance un quiz : les joueurs rejoignent avec .quiz join (15s), puis répondent en 30s : .quiz",
    quiz_anime: "Comme .quiz mais uniquement des questions anime/manga",
    hangman: "Jeu du pendu, devine le mot lettre par lettre : .hangman puis .hangman <lettre>",
    trivia: "Question de culture générale",
    "8ball": "Pose une question, la boule magique répond : .8ball <question>",
    dice: "Lance un dé",

    // IA
    ai: "Pose une question à l'IA : .ai <question>",
    chatbot: "Discute avec le chatbot IA : .chatbot <message>",
    sora: "Génère une image à partir d'une description : .sora <description>",
    tts: "Convertit du texte en message vocal : .tts <texte>",

    // Utilitaires
    trt: "Traduit un texte vers la langue de ton choix : .trt <texte> <code langue>",
    translate: "Traduit un texte vers l'anglais : .translate <texte>",
    weather: "Affiche la météo d'une ville : .weather <ville>",
    calc: "Calculatrice : .calc <expression>",
    qrcode: "Génère un QR code : .qrcode <texte ou lien>",
    fichiers: "Envoie tous les fichiers stockés dans le dossier Fichiers du bot",
    vv: "Révèle un média envoyé en vue unique : réponds au message avec .vv",

    // Téléchargement
    yt: "Télécharge une vidéo YouTube : .yt <lien>",
    tiktok: "Télécharge une vidéo TikTok : .tiktok <lien>",
    ig: "Télécharge un contenu Instagram : .ig <lien>",
    fb: "Télécharge une vidéo Facebook : .fb <lien>",
    play: "Recherche et joue une musique : .play <titre>",
    lyrics: "Cherche les infos et un extrait d'une chanson (paroles complètes non affichées, droits d'auteur) : .lyrics <titre>",

    // Effets texte / image
    hacker: "Génère une image de texte façon hacker/néon : .hacker <texte>",
    sticker: "Transforme une image/vidéo en sticker : réponds avec .sticker",

    // Bot admin
    bug: "Signale un bug aux administrateurs du bot : .bug <description>",
    report: "Signale un membre aux administrateurs du bot : .report @user <raison>",
    feedback: "Envoie un avis aux administrateurs du bot : .feedback <message>",
    suggestion: "Envoie une suggestion aux administrateurs du bot : .suggestion <idée>"
};
