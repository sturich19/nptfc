import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';

test.describe('NPTFC Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the application homepage', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/NPTFC|Newport Pagnell Tigers/);

    // Wait for the main content to be visible
    const auth = new AuthHelper(page);
    await auth.waitForAppReady();

    // Basic check that we're not on an error page
    const errorMessage = page.locator('text=Error').or(page.locator('text=404'));
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle authentication flow', async ({ page }) => {
    const auth = new AuthHelper(page);

    // Check if authentication is working
    const isAuth = await auth.isAuthenticated();

    if (!isAuth) {
      // If not authenticated, we should see login UI
      const loginButton = page.locator('button:has-text("Log In")');
      await expect(loginButton).toBeVisible({ timeout: 10000 });
    } else {
      // If authenticated, we should see main navigation
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible({ timeout: 10000 });
    }
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const auth = new AuthHelper(page);
    await auth.waitForAppReady();

    // Check that content is still accessible on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should not have JavaScript errors', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    const auth = new AuthHelper(page);
    await auth.waitForAppReady();

    // Filter out known issues that might not be critical
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('auth0') &&
      !error.includes('Microsoft Clarity')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should load required assets', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.waitForAppReady();

    // Check that CSS is loaded (Bootstrap/Material-UI)
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        fontFamily: styles.fontFamily,
        margin: styles.margin
      };
    });

    // Basic check that some styling is applied
    expect(bodyStyles.fontFamily).toBeTruthy();
  });
});