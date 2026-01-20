/**
 * E2E Tests - Authentication Flows
 * Tests login, registration, and password recovery flows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title and form elements
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
    
    // Check links
    await expect(page.getByRole('link', { name: /mot de passe oublié/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /créer un compte/i })).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without filling form
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email.*requis|email.*obligatoire/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/mot de passe/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    // Wait for error message
    await expect(page.getByText(/identifiants invalides|erreur|invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display registration page correctly', async ({ page }) => {
    await page.goto('/register');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: /créer.*compte|inscription/i })).toBeVisible();
    await expect(page.getByLabel(/prénom/i)).toBeVisible();
    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/téléphone/i)).toBeVisible();
  });

  test('should validate registration form fields', async ({ page }) => {
    await page.goto('/register');
    
    // Fill with invalid email
    await page.getByLabel(/prénom/i).fill('Test');
    await page.getByLabel(/nom/i).fill('User');
    await page.getByLabel(/email/i).fill('invalid-email');
    
    // Try to submit
    await page.getByRole('button', { name: /créer|s'inscrire/i }).click();
    
    // Check for email validation error
    await expect(page.getByText(/email.*valide|email.*invalid/i)).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.getByRole('link', { name: /mot de passe oublié/i }).click();
    
    // Check we're on the forgot password page
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should display forgot password success message', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Fill email
    await page.getByLabel(/email/i).fill('test@example.com');
    
    // Submit
    await page.getByRole('button', { name: /envoyer|réinitialiser/i }).click();
    
    // Check success message (always shown for security)
    await expect(page.getByText(/email.*envoyé|instructions.*envoyées|vérifiez.*email/i)).toBeVisible({ timeout: 10000 });
  });
});
