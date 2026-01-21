import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import heroVideo from '@/assets/hero-mortgage-video.mp4';
import heroImage from '@/assets/hero-mortgage.png';

interface AnimatedHeroBackgroundProps {
  children: React.ReactNode;
}

const AnimatedHeroBackground = ({ children }: AnimatedHeroBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, isMobile ? 50 : 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 500], [1, isMobile ? 1.05 : 1.1]);

  // Disable mouse tracking on mobile
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 20);
        mouseY.set(y * 20);
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);

  // Reduce particle count on mobile
  const particleCount = isMobile ? 8 : 20;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${isMobile ? 'min-h-[70vh]' : 'min-h-[90vh]'}`}>
      {/* Video Background with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: parallaxY, scale }}
      >
        {/* Video Layer - Use image on mobile for performance */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity }}
        >
          {!isMobile ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          ) : null}
          
          {/* Fallback Image - Always show on mobile */}
          <img
            src={heroImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              !isMobile && videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </motion.div>

        {/* Dynamic Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-primary/20"
          style={isMobile ? {} : {
            x: smoothX,
            y: smoothY,
          }}
        />

        {/* Animated Mesh Gradient - Simplified on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-primary/10 ${isMobile ? 'blur-2xl' : 'blur-3xl'}`}
            animate={{
              x: isMobile ? [0, 50, 0] : [0, 100, 0],
              y: isMobile ? [0, 25, 0] : [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: isMobile ? 30 : 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {!isMobile && (
            <motion.div
              className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-accent/10 blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, -50, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Floating Particles - Reduced on mobile */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary/20 rounded-full`}
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              y: [null, '-100vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + (isMobile ? 15 : 10),
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default AnimatedHeroBackground;
