import React, { forwardRef } from 'react';
import '../../styles/Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    borderColor?: string;
    onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
    children,
    className = '',
    padding = 'lg',
    hover = true,
    borderColor,
    onClick,
}, ref) => {
    const paddingClass = `p-${padding}`;
    const hoverClass = hover ? 'hoverable' : '';
    const clickableClass = onClick ? 'clickable' : '';

    const style = borderColor ? { borderLeft: `4px solid ${borderColor}` } : {};

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
