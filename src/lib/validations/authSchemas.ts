/**
 * Schémas de validation Zod pour l'authentification
 */

import { z } from 'zod';

// Schéma de validation pour le login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Format d'email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
  password: z
    .string()
    .min(1, { message: "Le mot de passe est requis" })
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(128, { message: "Le mot de passe ne peut pas dépasser 128 caractères" }),
});

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "Le prénom est requis" })
    .max(50, { message: "Le prénom ne peut pas dépasser 50 caractères" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Le prénom contient des caractères invalides" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Le nom est requis" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Le nom contient des caractères invalides" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Format d'email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(128, { message: "Le mot de passe ne peut pas dépasser 128 caractères" }),
  confirmPassword: z
    .string()
    .min(1, { message: "La confirmation du mot de passe est requise" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Schéma pour la réinitialisation de mot de passe (demande)
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Format d'email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
});

// Schéma pour la réinitialisation de mot de passe (nouveau mot de passe)
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(128, { message: "Le mot de passe ne peut pas dépasser 128 caractères" }),
  confirmPassword: z
    .string()
    .min(1, { message: "La confirmation du mot de passe est requise" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Types inférés
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
