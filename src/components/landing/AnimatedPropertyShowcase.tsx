import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Home, MapPin, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import parisProperty from '@/assets/paris-property.jpg';
import loftModerne from '@/assets/loft-moderne-lyon.jpg';
import maisonFamiliale from '@/assets/maison-familiale-bordeaux.jpg';

interface PropertyCard {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  size: string;
}

const properties: PropertyCard[] = [
  {
    id: 1,
    image: parisProperty,
    title: "Appartement Haussmannien",
    location: "Paris 8ème",
    price: 850000,
    size: "120m²",
  },
  {
    id: 2,
    image: loftModerne,
    title: "Loft Moderne",
    location: "Lyon 6ème",
    price: 420000,
    size: "95m²",
  },
  {
    id: 3,
    image: maisonFamiliale,
    title: "Maison Familiale",
    location: "Bordeaux",
    price: 580000,
    size: "180m²",
  },
];

const AnimatedPropertyShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  // Auto-rotate carousel (slower on mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % properties.length);
    }, isMobile ? 5000 : 4000);
    return () => clearInterval(timer);
  }, [isMobile]);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

  const goToNext = () => setActiveIndex((prev) => (prev + 1) % properties.length);
  const goToPrev = () => setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);

  return (
    <section ref={containerRef} className="py-12 md:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
            <Home className="w-3 h-3 md:w-4 md:h-4" />
            Projets Financés
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Ils ont réalisé leur rêve
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto px-4">
            Découvrez quelques-uns des projets que nous avons accompagnés
          </p>
        </motion.div>

        {/* Mobile: Swipeable Cards / Desktop: 3D Carousel */}
        {isMobile ? (
          /* Mobile Simple Carousel */
          <div className="relative">
            <div className="overflow-hidden rounded-2xl mx-2">
              <motion.div
                className="flex"
                animate={{ x: `-${activeIndex * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="w-full flex-shrink-0 px-1"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-card">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {formatPrice(property.price)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {property.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5" />
                            {property.size}
                          </span>
                        </div>
                        {/* Approval Badge */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Financement approuvé</span>
                            <span className="text-primary font-medium">100%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-primary/60"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Mobile Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Desktop 3D Carousel */
          <div className="relative h-[500px] max-w-5xl mx-auto perspective-1000">
            {properties.map((property, index) => {
              const offset = (index - activeIndex + properties.length) % properties.length;
              const isActive = offset === 0;
              const isNext = offset === 1;
              const isPrev = offset === properties.length - 1;
              
              let x = 0;
              let z = 0;
              let opacity = 0;
              let rotateY = 0;
              
              if (isActive) {
                x = 0;
                z = 0;
                opacity = 1;
                rotateY = 0;
              } else if (isNext) {
                x = 300;
                z = -200;
                opacity = 0.6;
                rotateY = -25;
              } else if (isPrev) {
                x = -300;
                z = -200;
                opacity = 0.6;
                rotateY = 25;
              } else {
                opacity = 0;
                z = -400;
              }

              return (
                <motion.div
                  key={property.id}
                  className="absolute left-1/2 top-0 w-[400px] cursor-pointer"
                  initial={false}
                  animate={{
                    x: x - 200,
                    z,
                    opacity,
                    rotateY,
                    scale: isActive ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => setActiveIndex(index)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-card">
                    <div className="relative h-[280px] overflow-hidden">
                      <motion.img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <motion.div
                        className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {formatPrice(property.price)}
                      </motion.div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize className="w-4 h-4" />
                          {property.size}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-muted-foreground">Financement approuvé</span>
                            <span className="text-primary font-medium">100%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-primary/60"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary w-6 md:w-8' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2 md:w-3'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedPropertyShowcase;
