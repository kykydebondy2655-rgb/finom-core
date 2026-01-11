import { describe, it, expect } from 'vitest';
import { 
  calculateMonthlyPayment, 
  calculateTotalInterest, 
  calculateTotalCost, 
  calculateDebtRatio, 
  isEligibleForLoan,
  calculateInsuranceCost
} from '@/lib/loanCalculations';

describe('calculateMonthlyPayment', () => {
  it('calculates correct monthly payment for standard loan', () => {
    // 100000€ at 3% over 20 years (240 months)
    const payment = calculateMonthlyPayment(100000, 3, 240);
    expect(payment).toBeCloseTo(554.60, 0);
  });

  it('calculates correct payment for short-term loan', () => {
    // 10000€ at 5% over 1 year (12 months)
    const payment = calculateMonthlyPayment(10000, 5, 12);
    expect(payment).toBeCloseTo(856.07, 0);
  });

  it('handles zero interest rate', () => {
    const payment = calculateMonthlyPayment(12000, 0, 12);
    expect(payment).toBe(1000);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateMonthlyPayment(0, 3, 240)).toBe(0);
    expect(calculateMonthlyPayment(100000, 3, 0)).toBe(0);
    expect(calculateMonthlyPayment(-100000, 3, 240)).toBe(0);
  });

  it('handles very high interest rates', () => {
    const payment = calculateMonthlyPayment(10000, 20, 60);
    expect(payment).toBeGreaterThan(250);
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

describe('calculateTotalCost', () => {
  it('calculates total cost including all fees', () => {
    const total = calculateTotalCost(100000, 30000, 2000, 5000);
    expect(total).toBe(137000);
  });

  it('handles case with no additional fees', () => {
    const total = calculateTotalCost(100000, 30000);
    expect(total).toBe(130000);
  });

  it('handles zero principal', () => {
    const total = calculateTotalCost(0, 0, 1000, 500);
    expect(total).toBe(1500);
  });
});

describe('calculateDebtRatio', () => {
  it('calculates correct debt ratio', () => {
    // 500€ monthly payment on 2000€ income = 25%
    expect(calculateDebtRatio(500, 2000)).toBe(25);
  });

  it('handles high debt ratio', () => {
    // 1500€ monthly payment on 3000€ income = 50%
    expect(calculateDebtRatio(1500, 3000)).toBe(50);
  });

  it('returns 0 for zero income', () => {
    expect(calculateDebtRatio(500, 0)).toBe(0);
  });

  it('handles precise calculations', () => {
    // 555€ monthly payment on 2000€ income = 27.75%
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
    expect(isEligibleForLoan(100)).toBe(false);
  });

  it('respects custom threshold', () => {
    expect(isEligibleForLoan(40, 40)).toBe(true);
    expect(isEligibleForLoan(41, 40)).toBe(false);
  });
});

describe('calculateInsuranceCost', () => {
  it('calculates correct insurance cost', () => {
    // 100000€ at 0.3% annual insurance over 240 months
    const cost = calculateInsuranceCost(100000, 0.3, 240);
    expect(cost).toBeCloseTo(6000, 0);
  });

  it('returns 0 for zero insurance rate', () => {
    expect(calculateInsuranceCost(100000, 0, 240)).toBe(0);
  });

  it('handles short duration', () => {
    const cost = calculateInsuranceCost(10000, 0.5, 12);
    expect(cost).toBeCloseTo(50, 0);
  });
});
