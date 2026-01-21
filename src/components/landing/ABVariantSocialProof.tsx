import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Shield, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ABVariantSocialProofProps {
  variant: string;
}

/**
 * A/B Test Variants for Social Proof Section
 */
export const ABVariantSocialProof = ({ variant }: ABVariantSocialProofProps) => {
  switch (variant) {
    case 'variant_a':
      return <StatsOnlySocialProof />;
    default:
      return <TestimonialsSocialProof />;
  }
};

// Control: Testimonials with quotes
const TestimonialsSocialProof = () => {
  const testimonials = [
    {
      name: 'Marie L.',
      role: 'Primo-accédante',
      text: 'Grâce à FINOM, j\'ai obtenu un taux bien inférieur à ce que ma banque proposait. Le processus était simple et rapide.',
      rating: 5,
    },
    {
      name: 'Thomas D.',
      role: 'Investisseur',
      text: 'Service excellent, réponse en moins de 24h. Je recommande vivement pour tout projet immobilier.',
      rating: 5,
    },
    {
      name: 'Sophie M.',
      role: 'Achat résidence principale',
      text: 'L\'accompagnement personnalisé m\'a permis de comprendre toutes les étapes et d\'obtenir les meilleures conditions.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ce que disent nos clients
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-muted-foreground">4.9/5 basé sur 2,847 avis vérifiés</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Variant A: Stats only (no testimonials)
const StatsOnlySocialProof = () => {
  const stats = [
    {
      icon: Users,
      value: '15,000+',
      label: 'Clients accompagnés',
      color: 'text-blue-500',
    },
    {
      icon: TrendingUp,
      value: '350M€',
      label: 'De prêts négociés',
      color: 'text-green-500',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Gratuit et sans engagement',
      color: 'text-purple-500',
    },
    {
      icon: Award,
      value: '10 ans',
      label: 'D\'expertise',
      color: 'text-orange-500',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pourquoi nous faire confiance ?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Des résultats concrets qui parlent d'eux-mêmes
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-lg mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ABVariantSocialProof;
