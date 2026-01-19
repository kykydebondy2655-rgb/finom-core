import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import '../../styles/Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    borderColor?: string;
    onClick?: () => void;
    animate?: boolean;
}

const cardHoverVariants = {
    rest: { 
        y: 0, 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' 
    },
    hover: { 
        y: -4, 
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)' 
    },
};

const Card = forwardRef<HTMLDivElement, CardProps>(({
    children,
    className = '',
    padding = 'lg',
    hover = true,
    borderColor,
    onClick,
    animate = true,
}, ref) => {
    const paddingClass = `p-${padding}`;
    const hoverClass = hover ? 'hoverable' : '';
    const clickableClass = onClick ? 'clickable' : '';

    const style = borderColor ? { borderLeft: `4px solid ${borderColor}` } : {};

    // Use motion.div only when animations are enabled
    if (animate && hover) {
        return (
            <motion.div
                ref={ref}
                className={`card ${paddingClass} ${hoverClass} ${clickableClass} ${className}`}
                style={style}
                onClick={onClick}
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={cardHoverVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div
            ref={ref}
            className={`card ${paddingClass} ${hoverClass} ${clickableClass} ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export default Card;
