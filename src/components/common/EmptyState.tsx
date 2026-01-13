import React, { forwardRef } from 'react';
import Button from '@/components/finom/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({
  icon = '📁',
  title,
  description,
  actionLabel,
  onAction
}, ref) => {
  return (
    <div ref={ref} className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
