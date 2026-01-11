import React from 'react';
import '../styles/Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    borderColor?: string;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'lg',
    hover = true,
    borderColor,
}) => {
    const paddingClass = `p-${padding}`;
    const hoverClass = hover ? 'hoverable' : '';

    const style = borderColor ? { borderLeft: `4px solid ${borderColor}` } : {};

    return (
        <div
            className={`card ${paddingClass} ${hoverClass} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export default Card;
