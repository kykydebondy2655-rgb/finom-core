import { describe, it, expect } from 'vitest';
import { 
  calculateMonthlyPayment, 
  calculateMonthlyCredit,
  calculateMonthlyInsurance,
  calculateTotalInterest, 
  calculateTotalCost, 
  calculateDebtRatio, 
  isEligibleForLoan,
  calculateInsuranceCost,
  calculateLoanAmount,
  calculateTotalInsurance,
  calculateBankFees,
  performSimulation,
  safeNumber,
  safeFormat,
  INSURANCE_RATE
} from '@/lib/loanCalculations';

describe('safeNumber', () => {
  it('converts valid numbers', () => {
    expect(safeNumber(100)).toBe(100);
    expect(safeNumber('100')).toBe(100);
    expect(safeNumber(3.14)).toBe(3.14);
  });

  it('returns 0 for invalid values', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber('')).toBe(0);
    expect(safeNumber('abc')).toBe(0);
    expect(safeNumber(NaN)).toBe(0);
  });
});

describe('safeFormat', () => {
  it('formats valid numbers', () => {
    expect(safeFormat(1234.56, 2)).toContain('1');
    expect(safeFormat(1000)).toContain('1');
  });

  it('returns dash for invalid numbers', () => {
    expect(safeFormat(NaN)).toBe('—');
    expect(safeFormat(Infinity)).toBe('—');
  });
});

describe('calculateLoanAmount', () => {
  it('calculates loan amount correctly', () => {
    // 250000 + 20000 (notaire) + 5000 (agence) + 10000 (travaux) - 30000 (apport)
    const amount = calculateLoanAmount(250000, 20000, 5000, 10000, 30000);
    expect(amount).toBe(255000);
  });

  it('returns 0 when apport >= total', () => {
    const amount = calculateLoanAmount(100000, 5000, 0, 0, 150000);
    expect(amount).toBe(0);
  });

  it('handles missing values', () => {
    const amount = calculateLoanAmount(250000, 0, 0, 0, 25000);
    expect(amount).toBe(225000);
  });
});

describe('calculateMonthlyCredit', () => {
  it('calculates correct monthly credit payment', () => {
    // 100000€ at 3% over 20 years (240 months)
    const payment = calculateMonthlyCredit(100000, 3, 240);
    expect(payment).toBeCloseTo(554.60, 0);
  });

  it('handles zero interest rate', () => {
    const payment = calculateMonthlyCredit(12000, 0, 12);
    expect(payment).toBe(1000);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateMonthlyCredit(0, 3, 240)).toBe(0);
    expect(calculateMonthlyCredit(100000, 3, 0)).toBe(0);
    expect(calculateMonthlyCredit(-100000, 3, 240)).toBe(0);
  });
});

describe('calculateMonthlyInsurance', () => {
  it('calculates correct insurance at fixed 0.31% rate', () => {
    // 100000€ × 0.31% / 12 = 25.83€/mois
    const insurance = calculateMonthlyInsurance(100000);
    expect(insurance).toBeCloseTo(25.83, 0);
  });

  it('returns 0 for zero principal', () => {
    expect(calculateMonthlyInsurance(0)).toBe(0);
    expect(calculateMonthlyInsurance(-10000)).toBe(0);
  });
});

describe('calculateMonthlyPayment (with insurance)', () => {
  it('calculates total monthly payment including insurance', () => {
    const payment = calculateMonthlyPayment(100000, 3, 240);
    const credit = calculateMonthlyCredit(100000, 3, 240);
    const insurance = calculateMonthlyInsurance(100000);
    expect(payment).toBeCloseTo(credit + insurance, 0);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateMonthlyPayment(0, 3, 240)).toBe(0);
  });
});

describe('calculateTotalInterest', () => {
  it('calculates correct total interest', () => {
    const interest = calculateTotalInterest(100000, 554.60, 240);
    expect(interest).toBeCloseTo(33104, -2);
  });

  it('returns 0 when monthly payment equals principal/duration', () => {
    const interest = calculateTotalInterest(12000, 1000, 12);
    expect(interest).toBe(0);
  });
});

describe('calculateTotalInsurance', () => {
  it('calculates correct total insurance cost', () => {
    // 100000€ × 0.31% / 12 × 240 = 6200€
    const cost = calculateTotalInsurance(100000, 240);
    expect(cost).toBeCloseTo(6200, -1);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateTotalInsurance(0, 240)).toBe(0);
    expect(calculateTotalInsurance(100000, 0)).toBe(0);
  });
});

describe('calculateBankFees', () => {
  it('calculates fees correctly', () => {
    // 500 (dossier) + 100000 × 1.2% (garantie) = 1700€
    const fees = calculateBankFees(100000);
    expect(fees).toBeCloseTo(1700, 0);
  });
});

describe('calculateTotalCost', () => {
  it('calculates total cost including all components', () => {
    const total = calculateTotalCost(30000, 6000, 1700);
    expect(total).toBe(37700);
  });

  it('handles zeros', () => {
    const total = calculateTotalCost(0, 0, 0);
    expect(total).toBe(0);
  });
});

describe('calculateDebtRatio', () => {
  it('calculates correct debt ratio', () => {
    expect(calculateDebtRatio(500, 2000)).toBe(25);
  });

  it('handles high debt ratio', () => {
    expect(calculateDebtRatio(1500, 3000)).toBe(50);
  });

  it('returns 0 for zero income', () => {
    expect(calculateDebtRatio(500, 0)).toBe(0);
  });

  it('handles precise calculations', () => {
    expect(calculateDebtRatio(555, 2000)).toBe(27.75);
  });
});

describe('isEligibleForLoan', () => {
  it('returns true for debt ratio below threshold', () => {
    expect(isEligibleForLoan(25)).toBe(true);
    expect(isEligibleForLoan(34.99)).toBe(true);
    expect(isEligibleForLoan(0)).toBe(true);
  });

  it('returns true for debt ratio at threshold', () => {
    expect(isEligibleForLoan(35)).toBe(true);
  });

  it('returns false for debt ratio above threshold', () => {
    expect(isEligibleForLoan(35.01)).toBe(false);
    expect(isEligibleForLoan(50)).toBe(false);
  });

  it('respects custom threshold', () => {
    expect(isEligibleForLoan(40, 40)).toBe(true);
    expect(isEligibleForLoan(41, 40)).toBe(false);
  });
});

describe('calculateInsuranceCost (legacy)', () => {
  it('calculates correct insurance cost with custom rate', () => {
    const cost = calculateInsuranceCost(100000, 0.3, 240);
    expect(cost).toBeCloseTo(6000, 0);
  });

  it('returns 0 for zero insurance rate', () => {
    expect(calculateInsuranceCost(100000, 0, 240)).toBe(0);
  });
});

describe('performSimulation', () => {
  it('performs complete valid simulation', () => {
    const result = performSimulation({
      propertyPrice: 250000,
      notaryFees: 20000,
      agencyFees: 5000,
      worksAmount: 0,
      downPayment: 50000,
      durationYears: 20,
      annualRate: 3.5
    });

    expect(result.isValid).toBe(true);
    expect(result.loanAmount).toBe(225000);
    expect(result.durationMonths).toBe(240);
    expect(result.monthlyCredit).toBeGreaterThan(0);
    expect(result.monthlyInsurance).toBeGreaterThan(0);
    expect(result.monthlyTotal).toBe(result.monthlyCredit + result.monthlyInsurance);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalInsurance).toBeGreaterThan(0);
  });

  it('returns invalid for negative loan amount', () => {
    const result = performSimulation({
      propertyPrice: 100000,
      notaryFees: 0,
      agencyFees: 0,
      worksAmount: 0,
      downPayment: 150000,
      durationYears: 20,
      annualRate: 3
    });

    expect(result.isValid).toBe(false);
    expect(result.loanAmount).toBe(0);
  });

  it('returns invalid for zero duration', () => {
    const result = performSimulation({
      propertyPrice: 250000,
      notaryFees: 0,
      agencyFees: 0,
      worksAmount: 0,
      downPayment: 25000,
      durationYears: 0,
      annualRate: 3
    });

    expect(result.isValid).toBe(false);
  });
});

describe('INSURANCE_RATE constant', () => {
  it('is 0.31% fixed', () => {
    expect(INSURANCE_RATE).toBe(0.31);
  });
});
