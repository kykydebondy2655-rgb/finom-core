import { z } from 'zod';

// Borrower types
export const BORROWER_TYPES = ['particulier', 'entreprise'] as const;
export type BorrowerType = typeof BORROWER_TYPES[number];

// Allowed project types for individual loan applications
export const PROJECT_TYPES_PARTICULIER = [
  'achat_residence_principale',
  'achat_residence_secondaire', 
  'investissement_locatif',
  'construction',
  'renovation'
] as const;

// Allowed project types for business loan applications
export const PROJECT_TYPES_ENTREPRISE = [
  'achat_locaux_commerciaux',
  'investissement_locatif_pro',
  'construction_pro',
  'renovation_pro'
] as const;

// All project types combined
export const PROJECT_TYPES = [
  ...PROJECT_TYPES_PARTICULIER,
  ...PROJECT_TYPES_ENTREPRISE
] as const;

// Company legal forms
export const COMPANY_LEGAL_FORMS = [
  'SARL',
  'SAS',
  'SASU',
  'EURL',
  'SCI',
  'SA',
  'SNC',
  'Auto-entrepreneur',
  'Autre'
] as const;

// Company data validation schema
export const companySchema = z.object({
  companyName: z.string().trim().min(1, 'Raison sociale requise').max(255, 'Raison sociale trop longue'),
  companySiret: z.string().trim().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d{14}$/, 'SIRET invalide'),
  companyLegalForm: z.enum(COMPANY_LEGAL_FORMS, {
    errorMap: () => ({ message: 'Forme juridique invalide' })
  })
});

// Loan application validation schema
export const loanApplicationSchema = z.object({
  propertyPrice: z.number()
    .min(10000, 'Le prix du bien doit être d\'au moins 10 000 €')
    .max(10000000, 'Le prix du bien ne peut pas dépasser 10 000 000 €'),
  notaryFees: z.number()
    .min(0, 'Les frais de notaire ne peuvent pas être négatifs')
    .max(500000, 'Les frais de notaire semblent excessifs'),
  agencyFees: z.number()
    .min(0, 'Les frais d\'agence ne peuvent pas être négatifs')
    .max(500000, 'Les frais d\'agence semblent excessifs'),
  worksAmount: z.number()
    .min(0, 'Le montant des travaux ne peut pas être négatif')
    .max(1000000, 'Le montant des travaux semble excessif'),
  downPayment: z.number()
    .min(0, 'L\'apport ne peut pas être négatif'),
  durationYears: z.number()
    .min(5, 'La durée minimum est de 5 ans')
    .max(30, 'La durée maximum est de 30 ans'),
  rate: z.number()
    .min(0, 'Le taux ne peut pas être négatif')
    .max(20, 'Le taux semble anormalement élevé'),
  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: 'Type de projet invalide' })
  }),
  borrowerType: z.enum(BORROWER_TYPES, {
    errorMap: () => ({ message: 'Type de demandeur invalide' })
  }).optional()
});

// Co-borrower validation schema
export const coborrowerSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
  lastName: z.string().trim().min(1, 'Nom requis').max(100, 'Nom trop long'),
  dateOfBirth: z.string().optional(),
  phone: z.string().trim().max(20, 'Numéro trop long').optional(),
  email: z.string().email('Email invalide').max(255, 'Email trop long').optional().or(z.literal('')),
  profession: z.string().trim().max(100, 'Profession trop longue').optional(),
  employmentType: z.string().trim().max(50, 'Type d\'emploi trop long').optional(),
  monthlyIncome: z.number().min(0, 'Revenu invalide').max(1000000, 'Revenu trop élevé'),
  monthlyCharges: z.number().min(0, 'Charges invalides').max(500000, 'Charges trop élevées')
});

export type LoanApplicationData = z.infer<typeof loanApplicationSchema>;
export type CoborrowerData = z.infer<typeof coborrowerSchema>;
export type CompanyData = z.infer<typeof companySchema>;
