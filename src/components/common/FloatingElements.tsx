import React from 'react';
import { motion } from 'framer-motion';
import floatingShapes from '@/assets/floating-shapes.png';

interface FloatingElementsProps {
  variant?: 'default' | 'minimal' | 'hero';
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ variant = 'default' }) => {
  const elements = [
    { id: 1, size: 60, x: '10%', y: '20%', delay: 0, duration: 8 },
    { id: 2, size: 40, x: '85%', y: '15%', delay: 1, duration: 10 },
    { id: 3, size: 80, x: '70%', y: '60%', delay: 2, duration: 12 },
    { id: 4, size: 50, x: '20%', y: '70%', delay: 0.5, duration: 9 },
    { id: 5, size: 35, x: '50%', y: '40%', delay: 1.5, duration: 11 },
  ];

  const minimalElements = elements.slice(0, 3);
  const activeElements = variant === 'minimal' ? minimalElements : elements;

  return (
    <div className="floating-elements-container">
      {activeElements.map((el) => (
        <motion.div
          key={el.id}
          className="floating-element"
          style={{
            width: el.size,
            height: el.size,
            left: el.x,
            top: el.y,
          }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, 0, -10, 0],
            rotate: [0, 5, -5, 3, 0],
            scale: [1, 1.05, 0.98, 1.02, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating image element for hero variant */}
      {variant === 'hero' && (
        <motion.img
          src={floatingShapes}
          alt=""
          className="floating-shapes-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 0.15, 
            scale: 1,
            y: [0, -15, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      )}

      {/* Gradient lines */}
      <motion.div
        className="gradient-line gradient-line-1"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scaleX: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="gradient-line gradient-line-2"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleX: [1, 0.8, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
};

export default FloatingElements;
