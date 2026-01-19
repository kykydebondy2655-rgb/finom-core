import { z } from 'zod';

// Allowed project types for loan applications
export const PROJECT_TYPES = [
  'achat_residence_principale',
  'achat_residence_secondaire', 
  'investissement_locatif',
  'construction',
  'renovation'
] as const;

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
  })
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
