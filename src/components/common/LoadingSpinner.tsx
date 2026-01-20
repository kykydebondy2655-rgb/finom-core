import React, { forwardRef } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(({ 
  size = 'md', 
  message,
  fullPage = false 
}, ref) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56
  };

  const spinnerSize = sizeMap[size];
  const borderWidth = size === 'sm' ? 2 : 3;

  const content = (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div 
        className="spinner" 
        style={{ 
          width: spinnerSize, 
          height: spinnerSize,
          borderWidth: borderWidth
        }}
        aria-hidden="true"
      />
      {message && <p className="spinner-message">{message}</p>}
      {!message && <span className="sr-only">Chargement en cours...</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div ref={ref} className="spinner-fullpage">
        {content}
      </div>
    );
  }

  return <div ref={ref}>{content}</div>;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;