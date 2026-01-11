import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  fullPage = false 
}) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56
  };

  const spinnerSize = sizeMap[size];

  const content = (
    <div className="spinner-wrapper">
      <div 
        className="spinner" 
        style={{ 
          width: spinnerSize, 
          height: spinnerSize,
          borderWidth: size === 'sm' ? 2 : 3
        }} 
      />
      {message && <p className="spinner-message">{message}</p>}

      <style>{`
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          border: 3px solid var(--color-border, #e2e8f0);
          border-top-color: var(--color-primary, #FE42B4);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-message {
          color: var(--color-text-secondary, #64748b);
          font-size: 0.9rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {content}
        <style>{`
          .spinner-fullpage {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.9);
            z-index: 9999;
          }
        `}</style>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
