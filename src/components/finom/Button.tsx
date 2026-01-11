import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Button.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    to?: string;
    outline?: boolean;
}

const Button: React.FC<ButtonProps> = ({
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
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const outlineClass = outline ? 'btn-outline' : '';
    const loadingClass = isLoading ? 'btn-loading' : '';
    const fullClass = `${baseClass} ${variantClass} ${sizeClass} ${outlineClass} ${loadingClass} ${className}`;

    if (to) {
        return (
            <Link to={to} className={fullClass} onClick={onClick}>
                {isLoading && <span className="spinner"></span>}
                <span className="content">{children}</span>
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={fullClass}
            disabled={disabled || isLoading}
            onClick={onClick}
        >
            {isLoading && <span className="spinner"></span>}
            <span className="content">{children}</span>
        </button>
    );
};

export default Button;
