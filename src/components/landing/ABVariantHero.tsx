import { motion } from 'framer-motion';
import { Calculator, Star, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ABVariantHeroProps {
  variant: string;
}

/**
 * A/B Test Variants for the Hero Section
 */
export const ABVariantHero = ({ variant }: ABVariantHeroProps) => {
  switch (variant) {
    case 'variant_a':
      return <MinimalHero />;
    case 'variant_b':
      return <BoldHero />;
    default:
      return <ControlHero />;
  }
};

// Control: Original design
const ControlHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
      <Calculator className="w-4 h-4" />
      Simulateur de crédit immobilier
    </span>
    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
      Votre projet immobilier<br />
      <span className="text-primary">commence ici</span>
    </h1>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      Simulez votre crédit en quelques clics et obtenez une estimation personnalisée. 
      Un conseiller dédié vous accompagne dans toutes les étapes.
    </p>
  </motion.div>
);

// Variant A: Minimal, trust-focused
const MinimalHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-center gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">4.9/5 sur 2,847 avis</span>
    </div>
    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
      Obtenez le meilleur taux<br />
      <span className="text-primary">en 2 minutes</span>
    </h1>
    <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
      Simulation gratuite et sans engagement. Plus de 15,000 clients nous font confiance.
    </p>
    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        100% gratuit
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        Sans engagement
      </span>
      <span className="flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        Réponse 24h
      </span>
    </div>
  </motion.div>
);

// Variant B: Bold, action-focused with stats
const BoldHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
      <TrendingUp className="w-4 h-4" />
      Taux historiquement bas - Profitez-en !
    </div>
    <h1 className="text-3xl md:text-6xl font-extrabold text-foreground mb-4">
      Économisez jusqu'à<br />
      <span className="text-primary">15,000€</span> sur votre prêt
    </h1>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
      Nos conseillers négocient les meilleurs taux auprès de +100 banques partenaires.
    </p>
    <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-primary">3.22%</div>
        <div className="text-xs text-muted-foreground">Taux moyen</div>
      </div>
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
        <div className="text-xs text-muted-foreground">Temps réponse</div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-2xl md:text-3xl font-bold text-primary">15k+</span>
        </div>
        <div className="text-xs text-muted-foreground">Clients</div>
      </div>
    </div>
  </motion.div>
);

export default ABVariantHero;
