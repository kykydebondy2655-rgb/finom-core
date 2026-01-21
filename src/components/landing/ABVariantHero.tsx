import { motion, useScroll, useTransform } from 'framer-motion';
import { Calculator, Star, Users, TrendingUp, CheckCircle2, Sparkles, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ABVariantHeroProps {
  variant: string;
}

// Animated counter for stats
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString('fr-FR')}{suffix}</span>;
};

/**
 * A/B Test Variants for the Hero Section - Enhanced with animations
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

// Control: Enhanced original design with floating elements
const ControlHero = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Animated badge */}
      <motion.span 
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        animate={{ 
          boxShadow: ['0 0 0 0 rgba(var(--primary-rgb), 0.4)', '0 0 0 10px rgba(var(--primary-rgb), 0)', '0 0 0 0 rgba(var(--primary-rgb), 0.4)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4" />
        Simulateur de crédit immobilier
      </motion.span>
      
      <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Votre projet immobilier
        </motion.span>
        <br />
        <motion.span 
          className="text-primary relative inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          commence ici
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />
        </motion.span>
      </h1>
      
      <motion.p 
        className="text-lg text-muted-foreground max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Simulez votre crédit en quelques clics et obtenez une estimation personnalisée. 
        Un conseiller dédié vous accompagne dans toutes les étapes.
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        className="mt-8"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="w-6 h-6 mx-auto text-muted-foreground" />
      </motion.div>
    </motion.div>
  );
};

// Variant A: Minimal, trust-focused with animated stars
const MinimalHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-center gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        </motion.div>
      ))}
      <motion.span 
        className="ml-2 text-sm text-muted-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        4.9/5 sur 2,847 avis
      </motion.span>
    </div>
    
    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Obtenez le meilleur taux
      </motion.span>
      <br />
      <motion.span 
        className="text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        en 2 minutes
      </motion.span>
    </h1>
    
    <motion.p 
      className="text-lg text-muted-foreground max-w-xl mx-auto mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      Simulation gratuite et sans engagement. Plus de 15,000 clients nous font confiance.
    </motion.p>
    
    <motion.div 
      className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      {['100% gratuit', 'Sans engagement', 'Réponse 24h'].map((text, i) => (
        <motion.span 
          key={text}
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 + i * 0.1 }}
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {text}
        </motion.span>
      ))}
    </motion.div>
  </motion.div>
);

// Variant B: Bold, action-focused with animated stats
const BoldHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6"
      animate={{ 
        scale: [1, 1.02, 1],
        boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0.4)']
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <TrendingUp className="w-4 h-4" />
      Taux historiquement bas - Profitez-en !
    </motion.div>
    
    <h1 className="text-3xl md:text-6xl font-extrabold text-foreground mb-4">
      <motion.span
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        Économisez jusqu'à
      </motion.span>
      <br />
      <motion.span 
        className="text-primary relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
      >
        <AnimatedCounter value={15000} suffix="€" />
        <motion.span
          className="absolute -right-8 -top-2"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.span>
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {' '}sur votre prêt
      </motion.span>
    </h1>
    
    <motion.p 
      className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      Nos conseillers négocient les meilleurs taux auprès de +100 banques partenaires.
    </motion.p>
    
    <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
      {[
        { value: 3.22, suffix: '%', label: 'Taux moyen' },
        { value: 24, suffix: 'h', label: 'Temps réponse' },
        { value: 15, suffix: 'k+', label: 'Clients', hasIcon: true }
      ].map((stat, i) => (
        <motion.div 
          key={stat.label}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + i * 0.15 }}
          whileHover={{ scale: 1.1 }}
        >
          <div className="text-2xl md:text-3xl font-bold text-primary">
            {stat.hasIcon && <Users className="w-5 h-5 inline mr-1" />}
            {stat.value}{stat.suffix}
          </div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default ABVariantHero;
