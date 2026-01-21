import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Home, MapPin, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import parisProperty from '@/assets/paris-property.jpg';
import loftModerne from '@/assets/loft-moderne-lyon.jpg';
import maisonFamiliale from '@/assets/maison-familiale-bordeaux.jpg';
import studioParis from '@/assets/studio-paris.jpg';
import penthouseNice from '@/assets/penthouse-nice.jpg';
import villaProvence from '@/assets/villa-provence.jpg';

interface PropertyCard {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  size: string;
  type: string;
}

const properties: PropertyCard[] = [
  {
    id: 1,
    image: parisProperty,
    title: "Appartement Haussmannien",
    location: "Paris 8ème",
    price: 850000,
    size: "120m²",
    type: "Appartement",
  },
  {
    id: 2,
    image: loftModerne,
    title: "Loft Moderne",
    location: "Lyon 6ème",
    price: 420000,
    size: "95m²",
    type: "Loft",
  },
  {
    id: 3,
    image: maisonFamiliale,
    title: "Maison Familiale",
    location: "Bordeaux",
    price: 580000,
    size: "180m²",
    type: "Maison",
  },
  {
    id: 4,
    image: studioParis,
    title: "Studio Cosy",
    location: "Paris 11ème",
    price: 285000,
    size: "32m²",
    type: "Studio",
  },
  {
    id: 5,
    image: penthouseNice,
    title: "Penthouse Vue Mer",
    location: "Nice",
    price: 1250000,
    size: "200m²",
    type: "Penthouse",
  },
  {
    id: 6,
    image: villaProvence,
    title: "Villa Provençale",
    location: "Aix-en-Provence",
    price: 920000,
    size: "280m²",
    type: "Villa",
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

  // Get visible properties for desktop (3 at a time)
  const getVisibleIndices = () => {
    const prev = (activeIndex - 1 + properties.length) % properties.length;
    const next = (activeIndex + 1) % properties.length;
    return [prev, activeIndex, next];
  };

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

        {/* Mobile: Swipeable Cards with Fade */}
        {isMobile ? (
          <div className="relative">
            <div className="overflow-hidden rounded-2xl mx-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="rounded-2xl overflow-hidden shadow-lg bg-card">
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={properties[activeIndex].image}
                        alt={properties[activeIndex].title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
                        {properties[activeIndex].type}
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {formatPrice(properties[activeIndex].price)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {properties[activeIndex].title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {properties[activeIndex].location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize className="w-3.5 h-3.5" />
                          {properties[activeIndex].size}
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
                </motion.div>
              </AnimatePresence>
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
          /* Desktop 3D Carousel with Fade */
          <div className="relative h-[500px] max-w-5xl mx-auto perspective-1000">
            <AnimatePresence mode="sync">
              {properties.map((property, index) => {
                const visibleIndices = getVisibleIndices();
                const isActive = index === activeIndex;
                const isVisible = visibleIndices.includes(index);
                
                if (!isVisible) return null;

                const position = visibleIndices.indexOf(index);
                let x = 0;
                let z = 0;
                let rotateY = 0;
                let scale = 0.85;
                
                if (position === 0) { // Left
                  x = -300;
                  z = -200;
                  rotateY = 25;
                } else if (position === 1) { // Center (active)
                  x = 0;
                  z = 0;
                  rotateY = 0;
                  scale = 1;
                } else if (position === 2) { // Right
                  x = 300;
                  z = -200;
                  rotateY = -25;
                }

                return (
                  <motion.div
                    key={property.id}
                    className="absolute left-1/2 top-0 w-[400px] cursor-pointer"
                    initial={{ opacity: 0, x: x - 200, scale: 0.8 }}
                    animate={{
                      x: x - 200,
                      z,
                      opacity: isActive ? 1 : 0.6,
                      rotateY,
                      scale,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.32, 0.72, 0, 1],
                      opacity: { duration: 0.4 }
                    }}
                    onClick={() => setActiveIndex(index)}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-card">
                      <div className="relative h-[280px] overflow-hidden">
                        <motion.img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          whileHover={{ scale: 1.1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <motion.div
                          className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium"
                          initial={{ opacity: 0, y: -10 }}
                          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                          transition={{ delay: 0.2 }}
                        >
                          {property.type}
                        </motion.div>
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
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t overflow-hidden"
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
                                  transition={{ duration: 1.5, delay: 0.3 }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Desktop Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-background transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
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
