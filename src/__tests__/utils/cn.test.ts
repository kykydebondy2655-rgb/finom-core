import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('merges multiple class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'other')).toBe('base other');
  });

  it('merges Tailwind classes correctly', () => {
    // Later classes should override earlier ones for same utility
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles object syntax', () => {
    expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
    expect(cn({ 'active': true, 'disabled': false })).toBe('active');
  });

  it('handles complex nested structures', () => {
    expect(cn(
      'base',
      ['array1', 'array2'],
      { 'object-class': true },
      undefined,
      'final'
    )).toBe('base array1 array2 object-class final');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn('', '', '')).toBe('');
  });
});
