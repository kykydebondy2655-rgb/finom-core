/**
 * Badge showing document expiration status
 */

import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentExpirationBadgeProps {
  expiresAt: string | null;
  category: string | null;
}

// Documents with expiration rules
const EXPIRING_DOCUMENTS: Record<string, number> = {
  'id_card': 365 * 10, // 10 years for ID
  'payslips': 90, // 3 months for payslips
  'bank_statements': 90, // 3 months for bank statements
  'proof_of_address': 90, // 3 months for address proof
  'tax_notice': 365, // 1 year for tax notice
};

const DocumentExpirationBadge: React.FC<DocumentExpirationBadgeProps> = ({
  expiresAt,
  category,
}) => {
  // If no expiration date set, check if this category should have one
  if (!expiresAt) {
    const docKey = Object.keys(EXPIRING_DOCUMENTS).find(key => 
      category?.toLowerCase().includes(key.toLowerCase())
    );
    
    if (docKey) {
      return (
        <span className="expiration-badge warning" title="Date d'expiration non définie">
          <Clock size={12} />
          <span>Expiration non définie</span>
        </span>
      );
    }
    return null;
  }

  const expirationDate = parseISO(expiresAt);
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expirationDate, today);

  if (daysUntilExpiry < 0) {
    // Expired
    return (
      <span className="expiration-badge expired" title={`Expiré le ${format(expirationDate, 'dd/MM/yyyy', { locale: fr })}`}>
        <AlertTriangle size={12} />
        <span>Expiré</span>
      </span>
    );
  }

  if (daysUntilExpiry <= 30) {
    // Expiring soon (within 30 days)
    return (
      <span className="expiration-badge warning" title={`Expire le ${format(expirationDate, 'dd/MM/yyyy', { locale: fr })}`}>
        <Clock size={12} />
        <span>Expire dans {daysUntilExpiry}j</span>
      </span>
    );
  }

  // Valid
  return (
    <span className="expiration-badge valid" title={`Valide jusqu'au ${format(expirationDate, 'dd/MM/yyyy', { locale: fr })}`}>
      <Clock size={12} />
      <span>Valide</span>
    </span>
  );
};

export default DocumentExpirationBadge;

// Utility to calculate expiration date based on document type and upload date
export const calculateExpirationDate = (category: string, uploadedAt: string): string | null => {
  const docKey = Object.keys(EXPIRING_DOCUMENTS).find(key => 
    category.toLowerCase().includes(key.toLowerCase())
  );
  
  if (!docKey) return null;
  
  const daysValid = EXPIRING_DOCUMENTS[docKey];
  const uploadDate = parseISO(uploadedAt);
  const expirationDate = new Date(uploadDate);
  expirationDate.setDate(expirationDate.getDate() + daysValid);
  
  return expirationDate.toISOString();
};
