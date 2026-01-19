import { z } from 'zod';

// French phone number validation regex
const FRENCH_PHONE_REGEX = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;

// French postal code validation regex  
const FRENCH_POSTAL_CODE_REGEX = /^[0-9]{5}$/;

// Profile update validation schema
export const profileUpdateSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  lastName: z.string()
    .trim()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .trim()
    .max(20, 'Numéro de téléphone trop long')
    .refine(
      (val) => val === '' || FRENCH_PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Format de téléphone invalide (ex: 0612345678 ou +33612345678)'
    )
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(255, 'Adresse trop longue')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .trim()
    .max(100, 'Nom de ville trop long')
    .optional()
    .or(z.literal('')),
  postalCode: z.string()
    .trim()
    .refine(
      (val) => val === '' || FRENCH_POSTAL_CODE_REGEX.test(val),
      'Code postal invalide (ex: 75001)'
    )
    .optional()
    .or(z.literal('')),
  country: z.string()
    .trim()
    .max(100, 'Nom de pays trop long')
    .optional()
    .default('France')
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
