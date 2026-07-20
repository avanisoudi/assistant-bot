import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Shield, Bot, Zap, BarChart3, Users, Clock, Lock, Settings,
  MessageSquare, Volume2, Trash2, AlertTriangle, UserPlus,
  Crown, ChevronDown, Check, ArrowRight, Menu, X
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const features = [
  { icon: Shield, title: "Antilink", desc: "Blocage automatique des liens et liens WhatsApp" },
  { icon: AlertTriangle, title: "Antitoxic", desc: "Détection et suppression des mots toxiques" },
  { icon: Bot, title: "Antibot", desc: "Protection contre les autres bots" },
  { icon: Trash2, title: "Antidelete", desc: "Sauvegarde des messages supprimés" },
  { icon: Volume2, title: "Antispam", desc: "Protection contre les messages de masse" },
  { icon: UserPlus, title: "Welcome/Goodbye", desc: "Messages d'accueil et de départ automatiques" },
  { icon: BarChart3, title: "Statistiques", desc: "Suivi complet des activités du groupe" },
  { icon: MessageSquare, title: "Stickers", desc: "Sauvegarde et gestion des stickers" },
  { icon: Crown, title: "Gestion Admins", desc: "Kick, promote, demote, warn, tag" },
  { icon: Zap, title: "Médias", desc: "Téléchargement FB, IG, TikTok, YouTube" },
  { icon: Users, title: "Fun", desc: "Jeu, dare, truth, jokes, quotes" },
  { icon: Settings, title: "Configuration", desc: "Personnalisation complète du bot" },
];

const steps = [
  { num: "1", title: "Connecter WhatsApp", desc: "Entrez votre numéro et cliquez Déployer. Le code AVANCODE est généré instantanément." },
  { num: "2", title: "Entrer le code", desc: "Ouvrez WhatsApp > Appareils connectés > Connecter avec numéro. Collez le code." },
  { num: "3", title: "C'est en ligne !", desc: "Votre bot est actif 24/7 avec 58 commandes et toutes les protections." },
];

const pricingPlans = [
  {
    name: "Gratuit",
    price: "0 FCFA",
    period: "pour toujours",
    features: ["Antilink & Antitoxic", "Protection 24/7", "Réponses rapides", "Stats de base"],
    notIncluded: ["Nom de bot custom", "Image de bot custom", "Support prioritaire"],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Premium",
    price: "1 500 FCFA",
    period: "par semaine",
    features: ["Tout du Gratuit", "Nom de bot custom", "Image de bot custom", "Support prioritaire", "Canal personnalisé"],
    notIncluded: [],
    cta: "Passer au Premium",
    popular: true,
  },
  {
    name: "Pro",
    price: "5 000 FCFA",
    period: "par mois",
    features: ["Tout du Premium", "Multi-groupes illimités", "API personnalisée", "Dashboard avancé", "Support VIP"],
    notIncluded: [],
    cta: "Passer au Pro",
    popular: false,
  },
];

const faqs = [
  { q: "Est-ce sûr ?", a: "Nous suivons les bonnes pratiques de sécurité et respectons les conditions d'utilisation de WhatsApp. L'automatisation est responsable et sécurisée." },
  { q: "Mon WhatsApp sera-t-il banni ?", a: "Non. Le bot utilise l'API Baileys officielle et suit les bonnes pratiques. Les risques sont minimisés avec une utilisation raisonnable." },
  { q: "Dois-je savoir coder ?", a: "Absolument pas. L'interface est conçue pour être simple et intuitive. Il suffit de cliquer sur Déployer et entrer le code." },
  { q: "Le bot fonctionne-t-il 24/7 ?", a: "Oui. Une fois déployé, votre bot reste connecté et actif en permanence, même quand votre téléphone est éteint." },
  { q: "Comment fonctionne le code AVANCODE ?", a: "Le code AVANCODE est un code de jumelage généré par WhatsApp. Il est valide 3 minutes et est envoyé automatiquement par message WhatsApp." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AV</span>
            </div>
            <span className="font-bold text-lg">AVANCODE</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="default" onClick={() => startLogin()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Commencer
              </Button>
            )}
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl p-4">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm py-2" onClick={() => setMobileMenu(false)}>Features</a>
              <a href="#how-it-works" className="text-sm py-2" onClick={() => setMobileMenu(false)}>Comment ça marche</a>
              <a href="#pricing" className="text-sm py-2" onClick={() => setMobileMenu(false)}>Tarifs</a>
              <a href="#faq" className="text-sm py-2" onClick={() => setMobileMenu(false)}>FAQ</a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="container relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6 fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Automation WhatsApp fiable par les créateurs et équipes
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 fade-in">
            Automatisez votre WhatsApp{" "}
            <span className="text-primary">comme un pro</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto fade-in">
            Déployez votre bot WhatsApp en 3 étapes. 58 commandes, protections avancées, 
            statistiques et automatisation 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-12">
                  Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => startLogin()} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-12">
                Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <a href="#features">
              <Button variant="outline" size="lg" className="border-border hover:bg-secondary text-lg px-8 h-12">
                Voir les features
              </Button>
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground fade-in">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" /> 5000+ Utilisateurs
            </span>
            <span className="hidden sm:block">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" /> Bots 24/7
            </span>
            <span className="hidden sm:block">|</span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" /> Sécurisé
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce qu'il faut pour <span className="text-primary">votre WhatsApp</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              58 commandes intégrées, protections avancées et automatisation intelligente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça <span className="text-primary">marche</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              3 étapes simples. La plupart des gens sont en ligne en moins de 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-primary">{s.num}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tarifs <span className="text-primary">simples</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Choisissez le plan qui correspond à votre croissance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary/5 border-primary/30 glow-whatsapp"
                    : "bg-card border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Populaire
                  </div>
                )}
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.period}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                      <X className="h-4 w-4 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => startLogin()}
                  className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "border-border"}`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions <span className="text-primary">fréquentes</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à automatiser votre <span className="text-primary">WhatsApp</span> ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Rejoignez des milliers d'utilisateurs qui gagnent du temps chaque jour.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
                Aller au Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => startLogin()} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
              Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AV</span>
              </div>
              <span className="font-semibold">AVANCODE</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 AVANI_SOUDI &middot; AVANI Tech
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
