/**
 * Loan Status State Machine
 * Defines valid status transitions to prevent inconsistent state changes
 */

export const LOAN_STATUS_DEFINITIONS = [
  { value: 'pending', label: 'En attente', color: '#f59e0b', icon: '⏳', description: 'Dossier reçu, en attente de traitement' },
  { value: 'documents_required', label: 'Documents requis', color: '#3b82f6', icon: '📋', description: 'Documents manquants à fournir' },
  { value: 'under_review', label: 'En analyse', color: '#8b5cf6', icon: '🔍', description: 'Analyse du dossier en cours' },
  { value: 'processing', label: 'En traitement', color: '#06b6d4', icon: '⚙️', description: 'Dossier en cours de traitement' },
  { value: 'offer_issued', label: 'Offre émise', color: '#f97316', icon: '📨', description: 'Offre envoyée, délai légal 10 jours' },
  { value: 'approved', label: 'Approuvé', color: '#10b981', icon: '✅', description: 'Dossier validé et approuvé' },
  { value: 'rejected', label: 'Rejeté', color: '#ef4444', icon: '❌', description: 'Dossier refusé' },
  { value: 'funded', label: 'Financé', color: '#059669', icon: '💰', description: 'Fonds débloqués' },
] as const;

export type LoanStatus = typeof LOAN_STATUS_DEFINITIONS[number]['value'];

/**
 * State machine defining valid transitions
 * Key = current status, Value = array of allowed next statuses
 */
export const VALID_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  // Initial state - can request documents or start review
  pending: ['documents_required', 'under_review', 'rejected'],
  
  // Waiting for documents - can go back to review once complete, or reject
  documents_required: ['under_review', 'pending', 'rejected'],
  
  // Under review - can request more docs, start processing, or reject
  under_review: ['documents_required', 'processing', 'rejected'],
  
  // Processing - can issue offer, approve directly, or reject
  processing: ['offer_issued', 'approved', 'rejected', 'under_review'],
  
  // Offer issued - after 10-day legal period, can approve or client can decline
  offer_issued: ['approved', 'rejected'],
  
  // Approved - can only move to funded
  approved: ['funded', 'rejected'],
  
  // Terminal states - no transitions allowed
  rejected: [],
  funded: [],
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: string | null, to: string): boolean {
  // If no current status, allow setting to pending or documents_required
  if (!from) {
    return to === 'pending' || to === 'documents_required';
  }
  
  const fromStatus = from as LoanStatus;
  const toStatus = to as LoanStatus;
  
  // Same status is always valid (no change)
  if (fromStatus === toStatus) return true;
  
  // Check if transition is in the allowed list
  const allowedTransitions = VALID_TRANSITIONS[fromStatus];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(toStatus);
}

/**
 * Get allowed next statuses from current status
 */
export function getAllowedTransitions(currentStatus: string | null): LoanStatus[] {
  if (!currentStatus) {
    return ['pending', 'documents_required'];
  }
  
  const status = currentStatus as LoanStatus;
  return VALID_TRANSITIONS[status] || [];
}

/**
 * Get status definition by value
 */
export function getStatusDefinition(status: string) {
  return LOAN_STATUS_DEFINITIONS.find(s => s.value === status);
}

/**
 * Check if status is a terminal state (no further transitions allowed)
 */
export function isTerminalStatus(status: string): boolean {
  return status === 'rejected' || status === 'funded';
}

/**
 * Get human-readable explanation for why a transition is blocked
 */
export function getTransitionBlockReason(from: string, to: string): string {
  if (isTerminalStatus(from)) {
    const fromLabel = getStatusDefinition(from)?.label || from;
    return `Un dossier "${fromLabel}" ne peut plus être modifié.`;
  }
  
  const fromLabel = getStatusDefinition(from)?.label || from;
  const toLabel = getStatusDefinition(to)?.label || to;
  const allowed = getAllowedTransitions(from).map(s => getStatusDefinition(s)?.label || s);
  
  if (allowed.length === 0) {
    return `Aucune transition n'est possible depuis "${fromLabel}".`;
  }
  
  return `Transition de "${fromLabel}" vers "${toLabel}" non autorisée. Transitions possibles: ${allowed.join(', ')}.`;
}
