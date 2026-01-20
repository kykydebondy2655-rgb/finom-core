import React from 'react';

interface StatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  // Loan statuses
  pending: { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  in_review: { label: 'En analyse', color: '#1E40AF', bg: '#DBEAFE' },
  under_review: { label: 'En analyse', color: '#1E40AF', bg: '#DBEAFE' },
  documents_required: { label: 'Documents requis', color: '#7C3AED', bg: '#EDE9FE' },
  processing: { label: 'En traitement', color: '#0891B2', bg: '#CFFAFE' },
  offer_issued: { label: 'Offre émise', color: '#C2410C', bg: '#FFEDD5' },
  approved: { label: 'Approuvé', color: '#065F46', bg: '#D1FAE5' },
  rejected: { label: 'Refusé', color: '#991B1B', bg: '#FEE2E2' },
  funded: { label: 'Financé', color: '#065F46', bg: '#D1FAE5' },
  completed: { label: 'Terminé', color: '#065F46', bg: '#D1FAE5' },
  draft: { label: 'Brouillon', color: '#475569', bg: '#F1F5F9' },
  // Document statuses
  received: { label: 'Reçu', color: '#1E40AF', bg: '#DBEAFE' },
  validated: { label: 'Validé', color: '#065F46', bg: '#D1FAE5' },
  expired: { label: 'Expiré', color: '#991B1B', bg: '#FEE2E2' },
  // General statuses
  active: { label: 'Actif', color: '#065F46', bg: '#D1FAE5' },
  inactive: { label: 'Inactif', color: '#475569', bg: '#F1F5F9' },
  planned: { label: 'Planifié', color: '#1E40AF', bg: '#DBEAFE' },
  done: { label: 'Terminé', color: '#065F46', bg: '#D1FAE5' },
  missed: { label: 'Manqué', color: '#991B1B', bg: '#FEE2E2' },
  cancelled: { label: 'Annulé', color: '#991B1B', bg: '#FEE2E2' },
  // KYC statuses
  new: { label: 'Nouveau', color: '#1E40AF', bg: '#DBEAFE' },
  verified: { label: 'Vérifié', color: '#065F46', bg: '#D1FAE5' },
  // Lead statuses
  assigned: { label: 'Assigné', color: '#0891B2', bg: '#CFFAFE' },
  contacted: { label: 'Contacté', color: '#0891B2', bg: '#CFFAFE' },
  qualified: { label: 'Qualifié', color: '#7C3AED', bg: '#EDE9FE' },
  converted: { label: 'Converti', color: '#065F46', bg: '#D1FAE5' },
  lost: { label: 'Perdu', color: '#991B1B', bg: '#FEE2E2' },
  // Pipeline stages (agent client statuses)
  nouveau: { label: 'Nouveau', color: '#3B82F6', bg: '#DBEAFE' },
  nrp: { label: 'NRP', color: '#EF4444', bg: '#FEE2E2' },
  faux_numero: { label: 'Faux numéro', color: '#DC2626', bg: '#FEE2E2' },
  pas_interesse: { label: 'Pas intéressé', color: '#6B7280', bg: '#F3F4F6' },
  a_rappeler: { label: 'À rappeler', color: '#8B5CF6', bg: '#EDE9FE' },
  interesse: { label: 'Intéressé', color: '#10B981', bg: '#D1FAE5' },
  qualifie: { label: 'Qualifié', color: '#059669', bg: '#D1FAE5' },
  converti: { label: 'Converti', color: '#22C55E', bg: '#D1FAE5' },
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