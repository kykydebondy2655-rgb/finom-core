import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

// ============= ANIMATION VARIANTS =============

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ============= MOTION COMPONENTS =============

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children?: ReactNode;
  delay?: number;
}

// FadeInUp - Perfect for cards, sections
export const FadeInUp = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeInUp.displayName = 'FadeInUp';

// ScaleIn - Perfect for modals, popups
export const ScaleIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={scaleIn}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = 'ScaleIn';

// SlideInLeft
export const SlideInLeft = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideInLeft}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
SlideInLeft.displayName = 'SlideInLeft';

// SlideInRight
export const SlideInRight = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideInRight}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
SlideInRight.displayName = 'SlideInRight';

// StaggerContainer - For lists and grids
export const StaggerContainer = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = 'StaggerContainer';

// StaggerItem - Children of StaggerContainer
export const StaggerItem = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = 'StaggerItem';

// ============= MICRO-INTERACTIONS =============

interface HoverScaleProps extends HTMLMotionProps<'div'> {
  children?: ReactNode;
  scale?: number;
}

// HoverScale - For buttons, cards
export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.02, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
HoverScale.displayName = 'HoverScale';

// HoverLift - For cards with shadow effect
export const HoverLift = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ 
        y: -4, 
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)' 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
HoverLift.displayName = 'HoverLift';

// TapBounce - For buttons
export const TapBounce = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
TapBounce.displayName = 'TapBounce';

// PulseOnHover - For notification badges, CTAs
export const PulseOnHover = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, repeat: Infinity },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
PulseOnHover.displayName = 'PulseOnHover';

// RotateOnHover - For icons
export const RotateOnHover = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ rotate: 15 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
RotateOnHover.displayName = 'RotateOnHover';

// ============= LOADING ANIMATIONS =============

interface SpinnerProps extends HTMLMotionProps<'div'> {
  size?: number;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 24, ...props }, ref) => (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
        border: '2px solid hsl(var(--muted))',
        borderTopColor: 'hsl(var(--primary))',
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      {...props}
    />
  )
);
Spinner.displayName = 'Spinner';

// Skeleton pulse animation
export const SkeletonPulse = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={`bg-muted rounded ${className || ''}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    />
  )
);
SkeletonPulse.displayName = 'SkeletonPulse';

// ============= COUNTER ANIMATION =============

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({
  from = 0,
  to,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}: CounterProps) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration }}
        >
          <CounterValue from={from} to={to} duration={duration} decimals={decimals} />
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
};

const CounterValue = ({ 
  from, 
  to, 
  duration,
  decimals 
}: { 
  from: number; 
  to: number; 
  duration: number;
  decimals: number;
}) => {
  const { current } = useCounterAnimation(from, to, duration);
  return <>{current.toFixed(decimals)}</>;
};

function useCounterAnimation(from: number, to: number, duration: number) {
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = easeOutExpo(progress);
      const value = from + (to - from) * eased;
      
      setCurrent(value);

      if (now < endTime) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [from, to, duration]);

  return { current };
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

import { useState, useEffect } from 'react';
