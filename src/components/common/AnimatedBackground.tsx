import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background-container">
      {/* Gradient orbs */}
      <motion.div
        className="bg-orb bg-orb-1"
        animate={{
          x: [0, 100, 50, -50, 0],
          y: [0, -50, 100, 50, 0],
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
        animate={{
          x: [0, -80, 60, -40, 0],
          y: [0, 80, -40, 60, 0],
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
        animate={{
          x: [0, 60, -80, 40, 0],
          y: [0, -60, 40, -80, 0],
          scale: [1, 1.1, 0.85, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div className="bg-grid-pattern" />
      
      {/* Noise texture */}
      <div className="bg-noise" />
    </div>
  );
};

export default AnimatedBackground;