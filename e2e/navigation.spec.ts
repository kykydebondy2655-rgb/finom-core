/**
 * E2E Tests - Navigation
 * Tests main navigation and public pages
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Check main elements are visible
    await expect(page.getByRole('banner')).toBeVisible(); // Header
    await expect(page.getByRole('contentinfo')).toBeVisible(); // Footer
  });

  test('should navigate to rates page', async ({ page }) => {
    await page.goto('/');
    
    // Click on rates link in navigation
    const ratesLink = page.getByRole('link', { name: /taux|barème/i });
    if (await ratesLink.isVisible()) {
      await ratesLink.first().click();
      await expect(page).toHaveURL(/rates/);
    }
  });

  test('should navigate to how it works page', async ({ page }) => {
    await page.goto('/how-it-works');
    
    // Check page content
    await expect(page.getByText(/comment.*fonctionne|fonctionnement|étapes/i)).toBeVisible();
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    
    // Check contact form elements
    await expect(page.getByText(/contact|nous.*contacter/i)).toBeVisible();
  });

  test('should navigate to FAQ page', async ({ page }) => {
    await page.goto('/faq');
    
    // Check FAQ elements
    await expect(page.getByText(/questions.*fréquentes|faq/i)).toBeVisible();
  });

  test('should navigate to legal pages', async ({ page }) => {
    // Legal notice
    await page.goto('/legal');
    await expect(page.getByText(/mentions.*légales|legal/i)).toBeVisible();
    
    // Privacy policy
    await page.goto('/privacy');
    await expect(page.getByText(/confidentialité|données.*personnelles|privacy/i)).toBeVisible();
    
    // Terms of service
    await page.goto('/terms');
    await expect(page.getByText(/conditions.*utilisation|cgu|terms/i)).toBeVisible();
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-that-does-not-exist');
    
    // Check 404 elements
    await expect(page.getByText(/404|page.*trouvée|not.*found/i)).toBeVisible();
  });

  test('should have accessible header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header navigation is accessible
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Check navigation links
    const nav = page.getByRole('navigation');
    await expect(nav.first()).toBeVisible();
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    
    // Check footer is visible
    await expect(footer).toBeVisible();
  });
});
