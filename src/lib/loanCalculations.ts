/**
 * Loan Calculation Utilities
 * Centralized calculation functions for loan applications
 * All functions are safe: no NaN, no division by zero
 */

// ============================================
// CONSTANTS
// ============================================
export const INSURANCE_RATE = 0.31; // Taux assurance fixe 0.31% par an (OBLIGATOIRE)
export const ORIGINATION_FEE = 500; // Frais de dossier fixes
export const GUARANTEE_RATE = 1.2; // Taux de garantie (1.2% du capital)

// ============================================
// SAFE NUMBER HELPERS
// ============================================

/**
 * Safely converts a value to a number, returning 0 if invalid
 */
export const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Safely formats a number for display, returning "—" if invalid
 */
export const safeFormat = (value: number, decimals: number = 0): string => {
  if (isNaN(value) || !isFinite(value)) return '—';
  return value.toLocaleString('fr-FR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

// ============================================
// LOAN AMOUNT CALCULATION
// ============================================

/**
 * Calculates the total loan amount (capital emprunté)
 * = prix du bien + frais notaire + frais agence + travaux - apport
 */
export const calculateLoanAmount = (
  propertyPrice: number,
  notaryFees: number,
  agencyFees: number,
  worksAmount: number,
  downPayment: number
): number => {
  const price = safeNumber(propertyPrice);
  const notary = safeNumber(notaryFees);
  const agency = safeNumber(agencyFees);
  const works = safeNumber(worksAmount);
  const down = safeNumber(downPayment);
  
  const result = price + notary + agency + works - down;
  return Math.max(0, Math.round(result * 100) / 100);
};

// ============================================
// MONTHLY PAYMENT CALCULATIONS
// ============================================

/**
 * Calculates monthly credit payment (HORS assurance)
 * Uses standard amortization formula
 */
export const calculateMonthlyCredit = (
  principal: number,
  annualRate: number,
  durationMonths: number
): number => {
  const p = safeNumber(principal);
  const rate = safeNumber(annualRate);
  const months = safeNumber(durationMonths);
  
  if (p <= 0 || months <= 0) return 0;
  if (rate === 0) return Math.round((p / months) * 100) / 100;
  
  const monthlyRate = rate / 100 / 12;
  const payment = p * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(payment * 100) / 100;
};

/**
 * Calculates monthly insurance payment (OBLIGATOIRE - taux fixe 0.31%)
 * Formule: (capital emprunté × 0.31%) / 12
 */
export const calculateMonthlyInsurance = (principal: number): number => {
  const p = safeNumber(principal);
  if (p <= 0) return 0;
  
  const monthlyInsurance = (p * INSURANCE_RATE / 100) / 12;
  return Math.round(monthlyInsurance * 100) / 100;
};

/**
 * Calculates total monthly payment (credit + assurance)
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  durationMonths: number
): number => {
  const credit = calculateMonthlyCredit(principal, annualRate, durationMonths);
  const insurance = calculateMonthlyInsurance(principal);
  return Math.round((credit + insurance) * 100) / 100;
};

// ============================================
// TOTAL COST CALCULATIONS
// ============================================

/**
 * Calculates total interest paid over loan lifetime
 */
export const calculateTotalInterest = (
  principal: number,
  monthlyCredit: number,
  durationMonths: number
): number => {
  const p = safeNumber(principal);
  const monthly = safeNumber(monthlyCredit);
  const months = safeNumber(durationMonths);
  
  if (p <= 0 || monthly <= 0 || months <= 0) return 0;
  
  const totalPaid = monthly * months;
  return Math.max(0, Math.round((totalPaid - p) * 100) / 100);
};

/**
 * Calculates total insurance cost over loan lifetime
 */
export const calculateTotalInsurance = (
  principal: number,
  durationMonths: number
): number => {
  const p = safeNumber(principal);
  const months = safeNumber(durationMonths);
  
  if (p <= 0 || months <= 0) return 0;
  
  const monthlyInsurance = calculateMonthlyInsurance(p);
  return Math.round(monthlyInsurance * months * 100) / 100;
};

/**
 * Calculates bank fees (dossier + garantie)
 */
export const calculateBankFees = (principal: number): number => {
  const p = safeNumber(principal);
  if (p <= 0) return ORIGINATION_FEE;
  
  const guaranteeFee = p * (GUARANTEE_RATE / 100);
  return Math.round((ORIGINATION_FEE + guaranteeFee) * 100) / 100;
};

/**
 * Calculates total cost of loan (intérêts + assurance + frais bancaires)
 */
export const calculateTotalCost = (
  totalInterest: number,
  totalInsurance: number,
  bankFees: number
): number => {
  const interest = safeNumber(totalInterest);
  const insurance = safeNumber(totalInsurance);
  const fees = safeNumber(bankFees);
  
  return Math.round((interest + insurance + fees) * 100) / 100;
};

// ============================================
// DEBT RATIO CALCULATION
// ============================================

/**
 * Calculates debt ratio (mensualité totale / revenus mensuels)
 */
export const calculateDebtRatio = (
  monthlyPayment: number,
  monthlyIncome: number
): number => {
  const payment = safeNumber(monthlyPayment);
  const income = safeNumber(monthlyIncome);
  
  if (income <= 0) return 0;
  return Math.round((payment / income) * 10000) / 100;
};

/**
 * Checks if debt ratio is below maximum threshold
 */
export const isEligibleForLoan = (
  debtRatio: number,
  maxDebtRatio: number = 35
): boolean => {
  return safeNumber(debtRatio) <= maxDebtRatio;
};

// ============================================
// TAEG ESTIMATION
// ============================================

/**
 * Estimates TAEG (Taux Annuel Effectif Global)
 * Approximation: taux crédit + taux assurance + frais (~0.2%)
 */
export const estimateTAEG = (creditRate: number): number => {
  const rate = safeNumber(creditRate);
  return Math.round((rate + INSURANCE_RATE + 0.2) * 100) / 100;
};

// ============================================
// COMPLETE SIMULATION
// ============================================

export interface SimulationInput {
  propertyPrice: number;      // Prix du bien
  notaryFees: number;         // Frais de notaire
  agencyFees: number;         // Frais d'agence
  worksAmount: number;        // Travaux (optionnel)
  downPayment: number;        // Apport personnel
  durationYears: number;      // Durée en années
  annualRate: number;         // Taux annuel (%)
}

export interface SimulationResult {
  loanAmount: number;         // Capital emprunté
  durationMonths: number;     // Durée en mois
  monthlyCredit: number;      // Mensualité crédit hors assurance
  monthlyInsurance: number;   // Mensualité assurance
  monthlyTotal: number;       // Mensualité totale
  totalInterest: number;      // Coût total intérêts
  totalInsurance: number;     // Coût total assurance
  bankFees: number;           // Frais bancaires
  totalCost: number;          // Coût global (intérêts + assurance + frais)
  taegEstimate: number;       // TAEG estimé
  isValid: boolean;           // Simulation valide
}

/**
 * Performs a complete loan simulation with all calculations
 */
export const performSimulation = (input: SimulationInput): SimulationResult => {
  const {
    propertyPrice,
    notaryFees,
    agencyFees,
    worksAmount,
    downPayment,
    durationYears,
    annualRate
  } = input;
  
  const durationMonths = safeNumber(durationYears) * 12;
  const loanAmount = calculateLoanAmount(
    propertyPrice,
    notaryFees,
    agencyFees,
    worksAmount,
    downPayment
  );
  
  // Check validity
  const isValid = loanAmount > 0 && durationMonths > 0 && safeNumber(annualRate) > 0;
  
  if (!isValid) {
    return {
      loanAmount: 0,
      durationMonths: 0,
      monthlyCredit: 0,
      monthlyInsurance: 0,
      monthlyTotal: 0,
      totalInterest: 0,
      totalInsurance: 0,
      bankFees: 0,
      totalCost: 0,
      taegEstimate: 0,
      isValid: false
    };
  }
  
  const monthlyCredit = calculateMonthlyCredit(loanAmount, annualRate, durationMonths);
  const monthlyInsurance = calculateMonthlyInsurance(loanAmount);
  const monthlyTotal = Math.round((monthlyCredit + monthlyInsurance) * 100) / 100;
  const totalInterest = calculateTotalInterest(loanAmount, monthlyCredit, durationMonths);
  const totalInsurance = calculateTotalInsurance(loanAmount, durationMonths);
  const bankFees = calculateBankFees(loanAmount);
  const totalCost = calculateTotalCost(totalInterest, totalInsurance, bankFees);
  const taegEstimate = estimateTAEG(annualRate);
  
  return {
    loanAmount,
    durationMonths,
    monthlyCredit,
    monthlyInsurance,
    monthlyTotal,
    totalInterest,
    totalInsurance,
    bankFees,
    totalCost,
    taegEstimate,
    isValid: true
  };
};

// ============================================
// LEGACY EXPORTS (pour compatibilité tests existants)
// ============================================

/**
 * @deprecated Use calculateInsuranceTotal instead
 */
export const calculateInsuranceCost = (
  principal: number,
  insuranceRate: number,
  durationMonths: number
): number => {
  const monthlyInsurance = (safeNumber(principal) * safeNumber(insuranceRate) / 100) / 12;
  return Math.round(monthlyInsurance * safeNumber(durationMonths) * 100) / 100;
};
