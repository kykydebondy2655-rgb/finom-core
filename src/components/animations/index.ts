// Page Transition
export { default as PageTransition } from './PageTransition';

// Animated Lists
export { AnimatedList, AnimatedGrid } from './AnimatedList';

// Motion Elements
export {
  // Variants
  fadeInUp,
  fadeInUpLarge,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
  staggerMedium,
  staggerAuth,
  // Components
  FadeInUp,
  ScaleIn,
  SlideInLeft,
  SlideInRight,
  StaggerContainer,
  StaggerItem,
  // Micro-interactions
  HoverScale,
  HoverLift,
  TapBounce,
  PulseOnHover,
  RotateOnHover,
  // Loading
  Spinner,
  SkeletonPulse,
  // Counter
  AnimatedCounter,
  // Transitions
  springTransition,
  springBouncy,
  smoothTransition,
  fastTransition,
} from './MotionElements';

// Re-export framer-motion utilities for convenience
export { motion, AnimatePresence } from 'framer-motion';
export type { Variants, HTMLMotionProps } from 'framer-motion';
