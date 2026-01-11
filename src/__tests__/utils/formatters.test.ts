import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  getStatusLabel, 
  getStatusColor 
} from '@/services/api';

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    expect(formatCurrency(1234.56)).toBe('1 234,56 €');
    expect(formatCurrency(1000)).toBe('1 000 €');
    expect(formatCurrency(0)).toBe('0 €');
  });

  it('formats negative amounts correctly', () => {
    expect(formatCurrency(-500)).toBe('-500 €');
    expect(formatCurrency(-1234.56)).toBe('-1 234,56 €');
  });

  it('handles edge cases gracefully', () => {
    expect(formatCurrency(null)).toBe('0 €');
    expect(formatCurrency(undefined)).toBe('0 €');
    expect(formatCurrency(NaN)).toBe('0 €');
  });

  it('handles very large amounts', () => {
    expect(formatCurrency(1000000)).toBe('1 000 000 €');
    expect(formatCurrency(999999999.99)).toBe('999 999 999,99 €');
  });

  it('handles small decimal amounts', () => {
    expect(formatCurrency(0.01)).toBe('0,01 €');
    expect(formatCurrency(0.1)).toBe('0,1 €');
  });
});

describe('formatDate', () => {
  it('formats valid dates correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('15');
    expect(result).toContain('janvier');
    expect(result).toContain('2024');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  it('handles ISO date strings', () => {
    const result = formatDate('2024-06-20T14:30:00.000Z');
    expect(result).toContain('20');
    expect(result).toContain('2024');
  });
});

describe('formatDateTime', () => {
  it('formats datetime correctly', () => {
    const result = formatDateTime('2024-01-15T10:30:00');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
    expect(formatDateTime('')).toBe('-');
  });
});

describe('getStatusLabel', () => {
  it('returns correct labels for known statuses', () => {
    expect(getStatusLabel('pending')).toBe('En attente');
    expect(getStatusLabel('in_review')).toBe('En cours d\'analyse');
    expect(getStatusLabel('approved')).toBe('Approuvé');
    expect(getStatusLabel('rejected')).toBe('Refusé');
    expect(getStatusLabel('funded')).toBe('Financé');
    expect(getStatusLabel('completed')).toBe('Terminé');
    expect(getStatusLabel('draft')).toBe('Brouillon');
  });

  it('handles unknown statuses', () => {
    expect(getStatusLabel('unknown_status')).toBe('unknown_status');
    expect(getStatusLabel('')).toBe('Inconnu');
    expect(getStatusLabel(null)).toBe('Inconnu');
  });
});

describe('getStatusColor', () => {
  it('returns correct colors for known statuses', () => {
    expect(getStatusColor('pending')).toBe('var(--color-warning)');
    expect(getStatusColor('in_review')).toBe('var(--color-info)');
    expect(getStatusColor('approved')).toBe('var(--color-success)');
    expect(getStatusColor('rejected')).toBe('var(--color-danger)');
  });

  it('returns default color for unknown statuses', () => {
    expect(getStatusColor('unknown')).toBe('var(--color-text-secondary)');
    expect(getStatusColor(null)).toBe('var(--color-text-secondary)');
    expect(getStatusColor('')).toBe('var(--color-text-secondary)');
  });
});
