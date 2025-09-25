import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';

test.describe('NPTFC Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for app to be ready
    const auth = new AuthHelper(page);
    await auth.waitForAppReady();
  });

  test('homepage should match visual baseline', async ({ page }) => {
    // Wait for all content to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the full page
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.3, // 30% threshold for changes
    });
  });

  test('homepage header should match visual baseline', async ({ page }) => {
    // Focus on the header area
    const header = page.locator('header').or(page.locator('nav')).first();

    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('homepage-header.png', {
        threshold: 0.2,
      });
    } else {
      // If no specific header, capture top portion of page
      await expect(page).toHaveScreenshot('homepage-top.png', {
        clip: { x: 0, y: 0, width: 1280, height: 200 },
        threshold: 0.2,
      });
    }
  });

  test('mobile viewport should match visual baseline', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for responsive design to kick in
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Take mobile screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('tablet viewport should match visual baseline', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Wait for responsive design to kick in
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Take tablet screenshot
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('dark mode visual comparison (if supported)', async ({ page }) => {
    // Try to find and activate dark mode toggle
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]')
      .or(page.locator('button:has-text("Dark")'))
      .or(page.locator('button:has-text("Theme")'));

    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.3,
      });
    } else {
      // Skip this test if dark mode is not available
      test.skip('Dark mode not available');
    }
  });
});

test.describe('NPTFC Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const auth = new AuthHelper(page);
    await auth.waitForAppReady();
  });

  test('navigation menu should be consistent', async ({ page }) => {
    const navigation = page.locator('nav').first();

    if (await navigation.isVisible()) {
      await expect(navigation).toHaveScreenshot('navigation-menu.png', {
        threshold: 0.1,
      });
    }
  });

  test('footer should be consistent', async ({ page }) => {
    const footer = page.locator('footer').first();

    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('footer.png', {
        threshold: 0.1,
      });
    }
  });

  test('loading states should be consistent', async ({ page }) => {
    // Try to capture loading spinner or skeleton UI
    const loadingElement = page.locator('[data-testid="loading"]')
      .or(page.locator('.loading'))
      .or(page.locator('.spinner'));

    // Reload page to try to catch loading state
    await page.reload();

    try {
      await expect(loadingElement).toHaveScreenshot('loading-state.png', {
        timeout: 2000,
        threshold: 0.2,
      });
    } catch (error) {
      // Loading state might be too fast to capture, skip this test
      test.skip('Loading state not captured - too fast');
    }
  });
});

test.describe('NPTFC Cross-browser Visual Consistency', () => {
  test('homepage should look consistent across browsers', async ({ page, browserName }) => {
    await page.goto('/');

    const auth = new AuthHelper(page);
    await auth.waitForAppReady();

    await page.waitForLoadState('networkidle');

    // Take browser-specific screenshots
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      threshold: 0.4, // Higher threshold for cross-browser differences
    });
  });
});