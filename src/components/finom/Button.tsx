import React from 'react';
import { Link } from 'react-router-dom';
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
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(({
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
}, ref) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const outlineClass = outline ? 'btn-outline' : '';
    const loadingClass = isLoading ? 'btn-loading' : '';
    const fullClass = `${baseClass} ${variantClass} ${sizeClass} ${outlineClass} ${loadingClass} ${className}`;

    if (to) {
        return (
            <Link to={to} className={fullClass} onClick={onClick as any} ref={ref as any}>
                {isLoading && <span className="spinner"></span>}
                <span className="content">{children}</span>
            </Link>
        );
    }

    return (
        <button
            ref={ref as any}
            type={type}
            className={fullClass}
            disabled={disabled || isLoading}
            onClick={onClick as any}
        >
            {isLoading && <span className="spinner"></span>}
            <span className="content">{children}</span>
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
