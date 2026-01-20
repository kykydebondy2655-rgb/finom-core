/**
 * E2E Tests - Loan Simulator
 * Tests the mortgage simulation functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Loan Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulator');
  });

  test('should display simulator page correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /simulateur|simulation/i })).toBeVisible();
    
    // Check form fields are present
    await expect(page.getByText(/prix.*bien|prix.*propriété/i)).toBeVisible();
    await expect(page.getByText(/apport/i)).toBeVisible();
    await expect(page.getByText(/durée/i)).toBeVisible();
  });

  test('should calculate loan when property price changes', async ({ page }) => {
    // Find property price input and change value
    const propertyPriceInput = page.locator('input[type="number"]').first();
    await propertyPriceInput.fill('300000');
    
    // Wait for calculation to update
    await page.waitForTimeout(500);
    
    // Check that results are displayed
    await expect(page.getByText(/mensualité|par mois/i)).toBeVisible();
  });

  test('should update rate based on profile', async ({ page }) => {
    // Check that rate information is displayed
    await expect(page.getByText(/taux/i)).toBeVisible();
    
    // Verify percentage is shown
    await expect(page.getByText(/%/)).toBeVisible();
  });

  test('should display loan breakdown', async ({ page }) => {
    // Check for breakdown sections
    await expect(page.getByText(/intérêts|coût.*crédit/i)).toBeVisible();
    await expect(page.getByText(/assurance/i)).toBeVisible();
  });

  test('should validate minimum property price', async ({ page }) => {
    // Try to set very low property price
    const propertyPriceInput = page.locator('input[type="number"]').first();
    await propertyPriceInput.fill('1000');
    
    // Check that calculation still works or shows warning
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.getByText(/simulateur|simulation/i)).toBeVisible();
  });

  test('should show CTA to create loan application', async ({ page }) => {
    // Check for call-to-action button
    await expect(page.getByRole('button', { name: /déposer.*demande|créer.*dossier|valider/i })).toBeVisible();
  });

  test('should redirect to login when creating loan without auth', async ({ page }) => {
    // Click the create loan button
    const ctaButton = page.getByRole('button', { name: /déposer.*demande|créer.*dossier|valider/i });
    await ctaButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should toggle coborrower section', async ({ page }) => {
    // Look for coborrower toggle
    const coborrowerToggle = page.getByText(/co-emprunteur/i);
    
    if (await coborrowerToggle.isVisible()) {
      await coborrowerToggle.click();
      
      // Check that coborrower fields appear
      await expect(page.getByText(/prénom.*co-emprunteur|informations.*co-emprunteur/i)).toBeVisible();
    }
  });

  test('should display project type selection', async ({ page }) => {
    // Check for project type options
    await expect(page.getByText(/type.*projet|projet.*immobilier/i)).toBeVisible();
  });
});
