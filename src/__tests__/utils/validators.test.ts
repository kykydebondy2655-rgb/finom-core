import { describe, it, expect } from 'vitest';
import { 
  isValidIBAN, 
  isValidEmail, 
  isStrongPassword, 
  isValidAmount,
  isValidPhone,
  isValidBIC 
} from '@/lib/validators';

describe('isValidIBAN', () => {
  describe('French IBAN (FR)', () => {
    it('accepts valid French IBAN', () => {
      expect(isValidIBAN('FR7630006000011234567890189')).toBe(true);
      expect(isValidIBAN('FR76 3000 6000 0112 3456 7890 189')).toBe(true);
    });

    it('rejects French IBAN with wrong length', () => {
      expect(isValidIBAN('FR763000600001123456789')).toBe(false); // too short
      expect(isValidIBAN('FR76300060000112345678901890')).toBe(false); // too long
    });
  });

  describe('International IBAN formats', () => {
    it('accepts valid German IBAN (DE)', () => {
      expect(isValidIBAN('DE89370400440532013000')).toBe(true);
    });

    it('accepts valid Spanish IBAN (ES)', () => {
      expect(isValidIBAN('ES9121000418450200051332')).toBe(true);
    });

    it('accepts valid UK IBAN (GB)', () => {
      expect(isValidIBAN('GB82WEST12345698765432')).toBe(true);
    });
  });

  describe('Invalid formats', () => {
    it('rejects empty string', () => {
      expect(isValidIBAN('')).toBe(false);
    });

    it('rejects IBAN with invalid characters', () => {
      expect(isValidIBAN('FR76-3000-6000-0112')).toBe(false);
      expect(isValidIBAN('FR76@30006000011234567890189')).toBe(false);
    });

    it('rejects IBAN without country code', () => {
      expect(isValidIBAN('763000600001123456789')).toBe(false);
    });

    it('accepts lowercase and converts to uppercase', () => {
      expect(isValidIBAN('fr7630006000011234567890189')).toBe(true);
    });
  });
});

describe('isValidEmail', () => {
  it('accepts valid email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
    expect(isValidEmail('firstname.lastname@company.fr')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user example@test.com')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  it('accepts strong passwords', () => {
    expect(isStrongPassword('Password123').valid).toBe(true);
    expect(isStrongPassword('MyStr0ngP@ss').valid).toBe(true);
    expect(isStrongPassword('SecurePass1').valid).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = isStrongPassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
  });

  it('rejects passwords without uppercase', () => {
    const result = isStrongPassword('password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
  });

  it('rejects passwords without lowercase', () => {
    const result = isStrongPassword('PASSWORD123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
  });

  it('rejects passwords without digits', () => {
    const result = isStrongPassword('PasswordStrong');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
  });

  it('returns multiple errors for very weak passwords', () => {
    const result = isStrongPassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('isValidAmount', () => {
  it('accepts valid amounts within range', () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(999999)).toBe(true);
  });

  it('accepts amounts with custom min', () => {
    expect(isValidAmount(10, 10)).toBe(true);
    expect(isValidAmount(9, 10)).toBe(false);
  });

  it('accepts amounts with custom max', () => {
    expect(isValidAmount(100, 0, 100)).toBe(true);
    expect(isValidAmount(101, 0, 100)).toBe(false);
  });

  it('rejects invalid amounts', () => {
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
    expect(isValidAmount(-Infinity)).toBe(false);
  });

  it('rejects negative amounts with default min', () => {
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(-0.01)).toBe(false);
  });

  it('accepts negative amounts with negative min', () => {
    expect(isValidAmount(-50, -100)).toBe(true);
    expect(isValidAmount(-150, -100)).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid French phone numbers', () => {
    expect(isValidPhone('0612345678')).toBe(true);
    expect(isValidPhone('06 12 34 56 78')).toBe(true);
    expect(isValidPhone('06.12.34.56.78')).toBe(true);
    expect(isValidPhone('+33612345678')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123456')).toBe(false);
    expect(isValidPhone('00612345678')).toBe(false);
  });
});

describe('isValidBIC', () => {
  it('accepts valid BIC codes', () => {
    expect(isValidBIC('BNPAFRPP')).toBe(true);
    expect(isValidBIC('BNPAFRPPXXX')).toBe(true);
    expect(isValidBIC('CEPAFRPP751')).toBe(true);
  });

  it('accepts empty BIC (optional field)', () => {
    expect(isValidBIC('')).toBe(true);
  });

  it('rejects invalid BIC codes', () => {
    expect(isValidBIC('BNP')).toBe(false);
    expect(isValidBIC('BNPAFRPP12345')).toBe(false);
  });
});
