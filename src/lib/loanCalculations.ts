/**
 * Loan Calculation Utilities
 * Centralized calculation functions for loan applications
 */

/**
 * Calculates monthly payment for a loan
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (in percentage, e.g., 3 for 3%)
 * @param durationMonths - Loan duration in months
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  durationMonths: number
): number => {
  if (principal <= 0 || durationMonths <= 0) return 0;
  if (annualRate === 0) return principal / durationMonths;
  
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1);
  
  return Math.round(payment * 100) / 100;
};

/**
 * Calculates total interest paid over loan lifetime
 * @param principal - Original loan amount
 * @param monthlyPayment - Monthly payment amount
 * @param durationMonths - Loan duration in months
 * @returns Total interest amount
 */
export const calculateTotalInterest = (
  principal: number,
  monthlyPayment: number,
  durationMonths: number
): number => {
  const totalPaid = monthlyPayment * durationMonths;
  return Math.round((totalPaid - principal) * 100) / 100;
};

/**
 * Calculates total cost of loan including all fees
 * @param principal - Loan amount
 * @param totalInterest - Total interest over loan lifetime
 * @param fees - Application/processing fees
 * @param insuranceCost - Insurance cost over loan lifetime
 * @returns Total cost
 */
export const calculateTotalCost = (
  principal: number,
  totalInterest: number,
  fees: number = 0,
  insuranceCost: number = 0
): number => {
  return principal + totalInterest + fees + insuranceCost;
};

/**
 * Calculates debt ratio (monthly payment / monthly income)
 * @param monthlyPayment - Monthly loan payment
 * @param monthlyIncome - Monthly income
 * @returns Debt ratio as percentage
 */
export const calculateDebtRatio = (
  monthlyPayment: number,
  monthlyIncome: number
): number => {
  if (monthlyIncome <= 0) return 0;
  return Math.round((monthlyPayment / monthlyIncome) * 10000) / 100;
};

/**
 * Checks if debt ratio is below maximum threshold
 * @param debtRatio - Current debt ratio percentage
 * @param maxDebtRatio - Maximum allowed debt ratio (default: 35%)
 * @returns true if eligible
 */
export const isEligibleForLoan = (
  debtRatio: number,
  maxDebtRatio: number = 35
): boolean => {
  return debtRatio <= maxDebtRatio;
};

/**
 * Calculates insurance cost over loan lifetime
 * @param principal - Loan amount
 * @param insuranceRate - Annual insurance rate (in percentage)
 * @param durationMonths - Loan duration in months
 * @returns Total insurance cost
 */
export const calculateInsuranceCost = (
  principal: number,
  insuranceRate: number,
  durationMonths: number
): number => {
  const monthlyInsurance = (principal * insuranceRate / 100) / 12;
  return Math.round(monthlyInsurance * durationMonths * 100) / 100;
};
