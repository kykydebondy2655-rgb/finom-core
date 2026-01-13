/**
 * Unit Tests for Authentication Validation Schemas
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/authSchemas';

describe('loginSchema', () => {
  describe('email validation', () => {
    it('accepts valid email', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("L'email est requis");
      }
    });

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Format d'email invalide");
      }
    });

    it('rejects email exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = loginSchema.safeParse({
        email: longEmail,
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace from email', () => {
      const result = loginSchema.safeParse({
        email: '  test@example.com  ',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });
  });

  describe('password validation', () => {
    it('accepts valid password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le mot de passe est requis');
      }
    });

    it('rejects password shorter than 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le mot de passe doit contenir au moins 6 caractères');
      }
    });

    it('rejects password exceeding 128 characters', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'a'.repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it('accepts password with exactly 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '123456',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('registerSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  describe('firstName validation', () => {
    it('accepts valid first name', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty first name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le prénom est requis');
      }
    });

    it('accepts first name with accents', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: 'François',
      });
      expect(result.success).toBe(true);
    });

    it('accepts first name with hyphen', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: 'Jean-Pierre',
      });
      expect(result.success).toBe(true);
    });

    it('accepts first name with apostrophe', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: "O'Connor",
      });
      expect(result.success).toBe(true);
    });

    it('rejects first name with numbers', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: 'John123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le prénom contient des caractères invalides');
      }
    });

    it('rejects first name exceeding 50 characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace from first name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        firstName: '  John  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
      }
    });
  });

  describe('lastName validation', () => {
    it('accepts valid last name', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty last name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        lastName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le nom est requis');
      }
    });

    it('accepts last name with accents', () => {
      const result = registerSchema.safeParse({
        ...validData,
        lastName: 'Müller',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('password confirmation', () => {
    it('accepts matching passwords', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects non-matching passwords', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.errors.find(e => e.path.includes('confirmPassword'));
        expect(confirmError?.message).toBe('Les mots de passe ne correspondent pas');
      }
    });

    it('rejects empty confirmation', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("L'email est requis");
    }
  });

  it('rejects invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('trims whitespace', () => {
    const result = forgotPasswordSchema.safeParse({
      email: '  test@example.com  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password too short', () => {
    const result = resetPasswordSchema.safeParse({
      password: '12345',
      confirmPassword: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Le mot de passe doit contenir au moins 6 caractères');
    }
  });

  it('rejects non-matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'differentpassword',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.errors.find(e => e.path.includes('confirmPassword'));
      expect(confirmError?.message).toBe('Les mots de passe ne correspondent pas');
    }
  });

  it('rejects empty confirmation', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password exceeding 128 characters', () => {
    const longPassword = 'a'.repeat(129);
    const result = resetPasswordSchema.safeParse({
      password: longPassword,
      confirmPassword: longPassword,
    });
    expect(result.success).toBe(false);
  });
});
