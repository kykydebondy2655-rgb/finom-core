import React from 'react';
import { Link } from 'react-router-dom';
import { motion, HTMLMotionProps } from 'framer-motion';
import '../../styles/Button.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
    type?: 'button' | 'submit' | 'reset';
    to?: string;
    outline?: boolean;
    animate?: boolean;
}

const buttonVariants = {
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
};

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    onClick,
    type = 'button',
    to,
    outline = false,
    animate = true,
}, ref) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const outlineClass = outline ? 'btn-outline' : '';
    const loadingClass = isLoading ? 'btn-loading' : '';
    const fullClass = `${baseClass} ${variantClass} ${sizeClass} ${outlineClass} ${loadingClass} ${className}`;

    const motionProps: Partial<HTMLMotionProps<'button'>> = animate ? {
        whileHover: 'hover',
        whileTap: 'tap',
        variants: buttonVariants,
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    } : {};

    if (to) {
        return (
            <Link 
                to={to} 
                className={fullClass} 
                onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} 
                ref={ref as React.Ref<HTMLAnchorElement>}
                aria-disabled={disabled || isLoading}
            >
                {isLoading && <span className="spinner" aria-hidden="true"></span>}
                <span className="content">{children}</span>
            </Link>
        );
    }

    return (
        <motion.button
            ref={ref as React.Ref<HTMLButtonElement>}
            type={type}
            className={fullClass}
            disabled={disabled || isLoading}
            onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
            aria-disabled={disabled || isLoading}
            aria-busy={isLoading}
            {...motionProps}
        >
            {isLoading && <span className="spinner" aria-hidden="true"></span>}
            <span className="content">{children}</span>
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
