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
