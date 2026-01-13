import React from 'react';

interface StatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  // Loan statuses
  pending: { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  in_review: { label: 'En analyse', color: '#1E40AF', bg: '#DBEAFE' },
  under_review: { label: 'En analyse', color: '#1E40AF', bg: '#DBEAFE' }, // Alias
  documents_required: { label: 'Documents requis', color: '#7C3AED', bg: '#EDE9FE' },
  processing: { label: 'En traitement', color: '#0891B2', bg: '#CFFAFE' },
  approved: { label: 'Approuvé', color: '#065F46', bg: '#D1FAE5' },
  rejected: { label: 'Refusé', color: '#991B1B', bg: '#FEE2E2' },
  funded: { label: 'Financé', color: '#065F46', bg: '#D1FAE5' },
  completed: { label: 'Terminé', color: '#065F46', bg: '#D1FAE5' },
  draft: { label: 'Brouillon', color: '#475569', bg: '#F1F5F9' },
  // Document statuses
  received: { label: 'Reçu', color: '#1E40AF', bg: '#DBEAFE' },
  validated: { label: 'Validé', color: '#065F46', bg: '#D1FAE5' },
  // General statuses
  active: { label: 'Actif', color: '#065F46', bg: '#D1FAE5' },
  inactive: { label: 'Inactif', color: '#475569', bg: '#F1F5F9' },
  planned: { label: 'Planifié', color: '#1E40AF', bg: '#DBEAFE' },
  cancelled: { label: 'Annulé', color: '#991B1B', bg: '#FEE2E2' },
  // KYC statuses
  new: { label: 'Nouveau', color: '#1E40AF', bg: '#DBEAFE' },
  verified: { label: 'Vérifié', color: '#065F46', bg: '#D1FAE5' },
  // Lead statuses
  contacted: { label: 'Contacté', color: '#0891B2', bg: '#CFFAFE' },
  qualified: { label: 'Qualifié', color: '#7C3AED', bg: '#EDE9FE' },
  converted: { label: 'Converti', color: '#065F46', bg: '#D1FAE5' },
  lost: { label: 'Perdu', color: '#991B1B', bg: '#FEE2E2' },
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
    </span>
  );
};

export default StatusBadge;