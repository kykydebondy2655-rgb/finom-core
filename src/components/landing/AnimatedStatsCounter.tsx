import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Home, Euro, TrendingDown, Award, Clock } from 'lucide-react';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: StatItem[] = [
  { icon: Users, value: 15847, suffix: '+', label: 'Clients accompagnés', color: 'text-blue-500' },
  { icon: Home, value: 2400, suffix: '+', label: 'Projets financés', color: 'text-green-500' },
  { icon: Euro, value: 850, suffix: 'M€', label: 'Montant financé', color: 'text-purple-500' },
  { icon: TrendingDown, value: 3.22, suffix: '%', label: 'Taux moyen obtenu', color: 'text-orange-500' },
];

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const rounded = useTransform(spring, (v) => {
    if (value < 10) return v.toFixed(2);
    return Math.round(v).toLocaleString('fr-FR');
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplayValue(parseFloat(v.replace(/\s/g, '').replace(',', '.'))));
  }, [rounded]);

  return (
    <span ref={ref} className="tabular-nums">
      {value < 10 ? displayValue.toFixed(2) : Math.round(displayValue).toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
};

const AnimatedStatsCounter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Nos Résultats
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Des chiffres qui parlent
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            La confiance de milliers de clients depuis plus de 10 ans
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="relative bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border/50 overflow-hidden">
                {/* Glow Effect */}
                <motion.div
                  className={`absolute -inset-px bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100`}
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Icon */}
                <motion.div
                  className={`inline-flex p-3 rounded-xl bg-muted mb-4 ${stat.color}`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-6 h-6" />
                </motion.div>

                {/* Value */}
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                {/* Decorative circle */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <Clock className="w-4 h-4 text-primary" />
            Réponse sous 24h
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <Award className="w-4 h-4 text-primary" />
            Certifié ORIAS
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <Users className="w-4 h-4 text-primary" />
            Service 5 étoiles
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedStatsCounter;
