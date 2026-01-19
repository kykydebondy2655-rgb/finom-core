import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import AnimatedBackground from '../common/AnimatedBackground';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
  animate?: boolean;
  showAnimatedBackground?: boolean;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.3,
};

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({ 
  children, 
  showHeader = true,
  className = '',
  animate = true,
  showAnimatedBackground = true
}, ref) => {
  if (!animate) {
    return (
      <div ref={ref} className={`page-layout ${className}`}>
        {showAnimatedBackground && <AnimatedBackground />}
        {showHeader && <Header />}
        <main className="page-content">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div ref={ref} className={`page-layout ${className}`}>
      {showAnimatedBackground && <AnimatedBackground />}
      {showHeader && <Header />}
      <motion.main 
        className="page-content"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.main>
    </div>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
