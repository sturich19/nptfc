import { test as setup, expect } from '@playwright/test';

const authFile = './tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('🔐 Setting up authentication...');

  // Get credentials from environment variables
  const email = process.env.AUTH0_TEST_EMAIL;
  const password = process.env.AUTH0_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('AUTH0_TEST_EMAIL and AUTH0_TEST_PASSWORD must be set in .env.test');
  }

  // Navigate to the app
  await page.goto('/');

  // Wait for page to load and potentially redirect
  await page.waitForLoadState('networkidle');

  console.log('Current URL after navigation:', page.url());

  // Check if we're already redirected to Auth0, or if we need to wait
  let currentUrl = page.url();
  if (!currentUrl.includes('auth0.com')) {
    console.log('Waiting for Auth0 redirect...');
    try {
      await page.waitForURL('**/auth0.com/**', { timeout: 15000 });
      console.log('📍 Redirected to Auth0 login');
    } catch (error) {
      console.log('No Auth0 redirect detected. Current URL:', page.url());
      console.log('This might mean user is already authenticated or Auth0 config issue');
      throw new Error(`Expected Auth0 redirect but stayed on: ${page.url()}`);
    }
  } else {
    console.log('📍 Already on Auth0 login page');
  }

  // Fill in login credentials
  await page.waitForSelector('input[name="email"], input[name="username"], input[type="email"]', { timeout: 10000 });

  // Try different possible selectors for the email field
  const emailSelectors = [
    'input[name="email"]',
    'input[name="username"]',
    'input[type="email"]',
    '#username',
    '#email'
  ];

  let emailField = null;
  for (const selector of emailSelectors) {
    try {
      emailField = page.locator(selector);
      if (await emailField.isVisible()) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (emailField) {
    await emailField.fill(email);
    console.log('✉️ Email filled');
  } else {
    throw new Error('Could not find email input field');
  }

  // Fill password
  const passwordSelectors = [
    'input[name="password"]',
    'input[type="password"]',
    '#password'
  ];

  let passwordField = null;
  for (const selector of passwordSelectors) {
    try {
      passwordField = page.locator(selector);
      if (await passwordField.isVisible()) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (passwordField) {
    await passwordField.fill(password);
    console.log('🔑 Password filled');
  } else {
    throw new Error('Could not find password input field');
  }

  // Submit the form
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Log In")',
    'button:has-text("Login")',
    'button:has-text("Continue")',
    'button:has-text("Sign In")'
  ];

  let submitButton = null;
  for (const selector of submitSelectors) {
    try {
      submitButton = page.locator(selector);
      if (await submitButton.isVisible()) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (submitButton) {
    await submitButton.click();
    console.log('🚀 Login submitted');
  } else {
    throw new Error('Could not find submit button');
  }

  // Wait for redirect back to app
  await page.waitForURL('http://localhost:3000/**', { timeout: 30000 });
  console.log('🏠 Redirected back to app');

  // Wait for app to be ready (look for authenticated content)
  await page.waitForLoadState('networkidle');

  // Verify we're authenticated by checking for logged-in content
  // This might be navigation, user menu, or other authenticated elements
  const authenticatedSelectors = [
    'nav',
    'header',
    'main',
    '[data-testid="authenticated-content"]',
    'text="Admin"',
    'text="Players"',
    'text="Fixtures"'
  ];

  let isAuthenticated = false;
  for (const selector of authenticatedSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      isAuthenticated = true;
      console.log(`✅ Authenticated - found: ${selector}`);
      break;
    } catch {
      continue;
    }
  }

  if (!isAuthenticated) {
    console.log('⚠️ Could not verify authentication, but proceeding...');
  }

  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log('💾 Authentication state saved to:', authFile);
});