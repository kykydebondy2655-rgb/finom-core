import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'auth';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'default' }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Mouse position with spring physics for smooth parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring values for subtle movement
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize to -1 to 1 range, then scale for subtle effect
      const x = ((clientX / innerWidth) - 0.5) * 20;
      const y = ((clientY / innerHeight) - 0.5) * 20;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion, mouseX, mouseY]);

  const containerClass = variant === 'auth' 
    ? 'animated-background-container animated-background-auth' 
    : 'animated-background-container';

  // Different parallax intensities for depth effect
  const getParallaxStyle = (intensity: number) => ({
    x: prefersReducedMotion ? 0 : smoothX.get() * intensity,
    y: prefersReducedMotion ? 0 : smoothY.get() * intensity,
  });

  return (
    <div className={containerClass}>
      {/* Gradient orbs with parallax */}
      <motion.div
        className="bg-orb bg-orb-1"
        style={{ x: smoothX, y: smoothY }}
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="bg-orb bg-orb-2"
        style={{ 
          x: useSpring(mouseX, { damping: 60, stiffness: 80 }),
          y: useSpring(mouseY, { damping: 60, stiffness: 80 })
        }}
        animate={{
          scale: [1, 0.9, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="bg-orb bg-orb-3"
        style={{ 
          x: useSpring(mouseX, { damping: 70, stiffness: 60 }),
          y: useSpring(mouseY, { damping: 70, stiffness: 60 })
        }}
        animate={{
          scale: [1, 1.1, 0.85, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Additional orb for auth variant */}
      {variant === 'auth' && (
        <motion.div
          className="bg-orb bg-orb-4"
          style={{ 
            x: useSpring(mouseX, { damping: 55, stiffness: 70 }),
            y: useSpring(mouseY, { damping: 55, stiffness: 70 })
          }}
          animate={{
            scale: [1, 1.15, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Subtle grid pattern overlay */}
      <div className="bg-grid-pattern" />
      
      {/* Noise texture */}
      <div className="bg-noise" />
    </div>
  );
};

export default AnimatedBackground;