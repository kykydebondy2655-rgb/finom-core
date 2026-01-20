/**
 * Document Status State Machine
 * Defines valid status transitions for document workflow
 */

export const DOCUMENT_STATUS_DEFINITIONS = [
  { value: 'pending', label: 'En attente', color: '#f59e0b', icon: '⏳', description: 'Document en attente de réception' },
  { value: 'received', label: 'Reçu', color: '#3b82f6', icon: '📥', description: 'Document reçu, en attente de vérification' },
  { value: 'under_review', label: 'En vérification', color: '#8b5cf6', icon: '🔍', description: 'Document en cours d\'analyse' },
  { value: 'validated', label: 'Validé', color: '#10b981', icon: '✅', description: 'Document conforme et validé' },
  { value: 'rejected', label: 'Rejeté', color: '#ef4444', icon: '❌', description: 'Document non conforme, à remplacer' },
] as const;

export type DocumentStatus = typeof DOCUMENT_STATUS_DEFINITIONS[number]['value'];

/**
 * State machine defining valid document transitions
 * Key = current status, Value = array of allowed next statuses
 */
export const VALID_DOCUMENT_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  // Initial state - document expected but not yet uploaded
  pending: ['received'],
  
  // Document uploaded - can be reviewed or directly validated/rejected
  received: ['under_review', 'validated', 'rejected'],
  
  // Under review - can be validated or rejected
  under_review: ['validated', 'rejected'],
  
  // Validated - terminal state (document is good)
  validated: [],
  
  // Rejected - can go back to received when client uploads replacement
  rejected: ['received', 'pending'],
};

/**
 * Check if a document status transition is valid
 */
export function isValidDocumentTransition(from: string | null, to: string): boolean {
  // If no current status, allow setting to pending or received
  if (!from) {
    return to === 'pending' || to === 'received';
  }
  
  const fromStatus = from as DocumentStatus;
  const toStatus = to as DocumentStatus;
  
  // Same status is always valid (no change)
  if (fromStatus === toStatus) return true;
  
  // Check if transition is in the allowed list
  const allowedTransitions = VALID_DOCUMENT_TRANSITIONS[fromStatus];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(toStatus);
}

/**
 * Get allowed next statuses from current document status
 */
export function getAllowedDocumentTransitions(currentStatus: string | null): DocumentStatus[] {
  if (!currentStatus) {
    return ['pending', 'received'];
  }
  
  const status = currentStatus as DocumentStatus;
  return VALID_DOCUMENT_TRANSITIONS[status] || [];
}

/**
 * Get document status definition by value
 */
export function getDocumentStatusDefinition(status: string) {
  return DOCUMENT_STATUS_DEFINITIONS.find(s => s.value === status);
}

/**
 * Check if document status is terminal (validated = can't change)
 */
export function isDocumentTerminalStatus(status: string): boolean {
  return status === 'validated';
}

/**
 * Check if document can be replaced (only rejected documents)
 */
export function canReplaceDocument(status: string): boolean {
  return status === 'rejected';
}

/**
 * Get human-readable explanation for why a document transition is blocked
 */
export function getDocumentTransitionBlockReason(from: string, to: string): string {
  if (isDocumentTerminalStatus(from)) {
    return 'Un document validé ne peut plus être modifié.';
  }
  
  const fromLabel = getDocumentStatusDefinition(from)?.label || from;
  const toLabel = getDocumentStatusDefinition(to)?.label || to;
  const allowed = getAllowedDocumentTransitions(from).map(s => getDocumentStatusDefinition(s)?.label || s);
  
  if (allowed.length === 0) {
    return `Aucune transition n'est possible depuis "${fromLabel}".`;
  }
  
  return `Transition de "${fromLabel}" vers "${toLabel}" non autorisée. Transitions possibles: ${allowed.join(', ')}.`;
}

/**
 * Get the appropriate action text based on document status
 */
export function getDocumentActionText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Téléverser';
    case 'received':
      return 'Vérifier';
    case 'under_review':
      return 'Statuer';
    case 'validated':
      return 'Validé';
    case 'rejected':
      return 'Remplacer';
    default:
      return 'Action';
  }
}
