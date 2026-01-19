import { z } from 'zod';

// Valid document statuses
export const DOCUMENT_STATUSES = [
  'pending',
  'received', 
  'under_review',
  'validated',
  'rejected'
] as const;

// Valid loan statuses
export const LOAN_STATUSES = [
  'pending',
  'documents_required',
  'under_review',
  'processing',
  'offer_issued',
  'approved',
  'rejected',
  'funded'
] as const;

// Document status update schema
export const documentStatusUpdateSchema = z.object({
  status: z.enum(DOCUMENT_STATUSES, {
    errorMap: () => ({ message: 'Statut de document invalide' })
  }),
  rejectionReason: z.string()
    .trim()
    .max(1000, 'Raison trop longue')
    .optional()
}).refine(
  (data) => data.status !== 'rejected' || (data.rejectionReason && data.rejectionReason.length > 0),
  { message: 'La raison du rejet est requise', path: ['rejectionReason'] }
);

// Loan status update schema
export const loanStatusUpdateSchema = z.object({
  status: z.enum(LOAN_STATUSES, {
    errorMap: () => ({ message: 'Statut de prêt invalide' })
  }),
  nextAction: z.string()
    .trim()
    .max(500, 'Prochaine action trop longue')
    .optional()
    .or(z.literal('')),
  rejectionReason: z.string()
    .trim()
    .max(1000, 'Raison trop longue')
    .optional()
}).refine(
  (data) => data.status !== 'rejected' || (data.rejectionReason && data.rejectionReason.length > 0),
  { message: 'La raison du rejet est requise', path: ['rejectionReason'] }
);

export type DocumentStatusUpdate = z.infer<typeof documentStatusUpdateSchema>;
export type LoanStatusUpdate = z.infer<typeof loanStatusUpdateSchema>;
