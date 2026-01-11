import React from 'react';

interface StatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  in_review: { label: 'En analyse', color: '#1E40AF', bg: '#DBEAFE' },
  approved: { label: 'Approuvé', color: '#065F46', bg: '#D1FAE5' },
  rejected: { label: 'Refusé', color: '#991B1B', bg: '#FEE2E2' },
  funded: { label: 'Financé', color: '#065F46', bg: '#D1FAE5' },
  completed: { label: 'Terminé', color: '#065F46', bg: '#D1FAE5' },
  draft: { label: 'Brouillon', color: '#475569', bg: '#F1F5F9' },
  active: { label: 'Actif', color: '#065F46', bg: '#D1FAE5' },
  inactive: { label: 'Inactif', color: '#475569', bg: '#F1F5F9' },
  planned: { label: 'Planifié', color: '#1E40AF', bg: '#DBEAFE' },
  cancelled: { label: 'Annulé', color: '#991B1B', bg: '#FEE2E2' },
  validated: { label: 'Validé', color: '#065F46', bg: '#D1FAE5' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status || ''] || { 
    label: status || 'Inconnu', 
    color: '#475569', 
    bg: '#F1F5F9' 
  };

  return (
    <span 
      className={`status-badge status-badge-${size}`}
      style={{ 
        color: config.color, 
        backgroundColor: config.bg 
      }}
    >
      {config.label}

      <style>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          font-weight: 600;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .status-badge-sm {
          padding: 0.25rem 0.625rem;
          font-size: 0.7rem;
        }

        .status-badge-md {
          padding: 0.375rem 0.875rem;
          font-size: 0.8rem;
        }
      `}</style>
    </span>
  );
};

export default StatusBadge;
