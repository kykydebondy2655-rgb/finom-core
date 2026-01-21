/**
 * Validation Utilities
 * Centralized validation functions for the application
 */

/**
 * Validates IBAN format
 * @param iban - The IBAN string to validate
 * @returns true if valid IBAN format
 */
export const isValidIBAN = (iban: string): boolean => {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  // Basic IBAN format check (2 letters + 2 digits + up to 30 alphanumeric)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
  if (!ibanRegex.test(cleanIban)) return false;
  // Check length based on country (simplified - FR = 27 chars)
  if (cleanIban.startsWith('FR') && cleanIban.length !== 27) return false;
  return true;
};

/**
 * Validates email format
 * @param email - The email string to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with valid boolean and array of error messages
 */
export const isStrongPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validates amount within range
 * @param amount - The amount to validate
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (optional)
 * @returns true if amount is valid
 */
export const isValidAmount = (amount: number, min = 0, max?: number): boolean => {
  if (isNaN(amount) || !isFinite(amount)) return false;
  if (amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
};

/**
 * Validates phone number format (French format)
 * @param phone - The phone number to validate
 * @returns true if valid phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  // French phone: 10 digits starting with 0 or +33 followed by 9 digits
  const frenchPhoneRegex = /^(0[1-9][0-9]{8}|\+33[1-9][0-9]{8})$/;
  return frenchPhoneRegex.test(cleanPhone);
};

/**
 * Parses and validates phone number with formatting
 * Supports French and international formats
 * @param phone - The phone number to parse
 * @returns Object with valid boolean and formatted phone
 */
export const parseAndValidatePhone = (phone: string): { valid: boolean; formatted: string | undefined } => {
  if (!phone) return { valid: true, formatted: undefined };
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // French phone formats: 0612345678, +33612345678, 0033612345678
  if (/^0[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  if (/^\+33[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  if (/^0033[1-9]\d{8}$/.test(cleaned)) {
    return { valid: true, formatted: '+33' + cleaned.slice(4) };
  }
  // International format (at least 8 digits with +)
  if (/^\+\d{8,15}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  // Just digits, at least 8
  if (/^\d{8,15}$/.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  
  return { valid: false, formatted: undefined };
};

/**
 * Validates BIC/SWIFT code format
 * @param bic - The BIC code to validate
 * @returns true if valid BIC format
 */
export const isValidBIC = (bic: string): boolean => {
  if (!bic) return true; // BIC is often optional
  const cleanBic = bic.replace(/\s/g, '').toUpperCase();
  // BIC format: 8 or 11 characters
  const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return bicRegex.test(cleanBic);
};

// ============================================
// STATUS LABELS - Centralized for consistency
// ============================================

/**
 * Labels for client/lead statuses
 */
export const CLIENT_STATUS_LABELS: Record<string, string> = {
  // Pipeline stages
  nouveau: 'Nouveau',
  nrp: 'NRP',
  NRP: 'NRP',
  faux_numero: 'Faux numéro',
  pas_interesse: 'Pas intéressé',
  a_rappeler: 'À rappeler',
  interesse: 'Intéressé',
  qualifie: 'Qualifié',
  converti: 'Converti',
  // Lead statuses
  new: 'Nouveau',
  assigned: 'Assigné',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  converted: 'Converti',
  lost: 'Perdu',
  // Callback statuses
  pending: 'En attente',
  done: 'Effectué',
  missed: 'Manqué',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/**
 * Colors for client/lead statuses
 */
export const CLIENT_STATUS_COLORS: Record<string, string> = {
  nouveau: '#3B82F6',
  nrp: '#F59E0B',
  faux_numero: '#DC2626',
  pas_interesse: '#6B7280',
  a_rappeler: '#8B5CF6',
  interesse: '#10B981',
  qualifie: '#0EA5E9',
  converti: '#22C55E',
};

/**
 * Labels for call statuses
 */
export const CALL_STATUS_LABELS: Record<string, string> = {
  answered: 'Répondu',
  no_answer: 'Pas de réponse',
  busy: 'Occupé',
  voicemail: 'Messagerie',
  callback: 'À rappeler',
  callback_scheduled: 'Rappel planifié',
};

/**
 * Labels for loan statuses
 */
export const LOAN_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  in_review: 'En analyse',
  documents_required: 'Documents requis',
  under_review: 'En analyse',
  processing: 'En traitement',
  offer_issued: 'Offre émise',
  approved: 'Approuvé',
  rejected: 'Refusé',
  funded: 'Financé',
};

/**
 * Labels for document statuses
 */
export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  received: 'Reçu',
  under_review: 'En analyse',
  validated: 'Validé',
  rejected: 'Rejeté',
  expired: 'Expiré',
};

/**
 * Get status label from any status type with fallback formatting
 */
export const getClientStatusLabel = (status: string | null): string => {
  if (!status) return 'Inconnu';
  // Try exact match first
  if (CLIENT_STATUS_LABELS[status]) return CLIENT_STATUS_LABELS[status];
  // Try lowercase
  const lower = status.toLowerCase();
  if (CLIENT_STATUS_LABELS[lower]) return CLIENT_STATUS_LABELS[lower];
  // Format unknown status (replace _ with space, capitalize)
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getCallStatusLabel = (status: string): string => {
  if (!status) return 'Inconnu';
  if (CALL_STATUS_LABELS[status]) return CALL_STATUS_LABELS[status];
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getLoanStatusLabel = (status: string | null): string => {
  if (!status) return 'Inconnu';
  if (LOAN_STATUS_LABELS[status]) return LOAN_STATUS_LABELS[status];
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getDocumentStatusLabel = (status: string | null): string => {
  if (!status) return 'Inconnu';
  if (DOCUMENT_STATUS_LABELS[status]) return DOCUMENT_STATUS_LABELS[status];
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
