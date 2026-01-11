import React from 'react';
import Button from '@/components/finom/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📁',
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      <style>{`
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.25rem;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
