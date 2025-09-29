import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');

  // Ensure auth directory exists
  const fs = require('fs');
  const authDir = './tests/.auth';
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;