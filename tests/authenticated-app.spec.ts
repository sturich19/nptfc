import { test, expect } from "@playwright/test";
import { waitForAuthenticatedApp } from "./helpers/auth";

test.describe("NPTFC Authenticated App Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedApp(page);
  });

  test("should be authenticated and show app content", async ({ page }) => {
    // Verify we're authenticated by checking URL and basic content
    expect(page.url()).toContain("localhost:3000");

    // Should not be redirected to Auth0
    expect(page.url()).not.toContain("auth0.com");

    // Take a screenshot to see what's actually on the page
    await page.screenshot({
      path: "test-results/authenticated-home.png",
      fullPage: true,
    });

    // Basic checks for any content
    const body = page.locator("body");
    await expect(body).toBeVisible();

    console.log("✅ Successfully authenticated and on app home page");
  });

  test("should access admin page and see what content is available", async ({
    page,
  }) => {
    // Navigate to admin
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    console.log("Current admin page URL:", page.url());

    // Take screenshot to see admin page layout
    await page.screenshot({
      path: "test-results/admin-page-layout.png",
      fullPage: true,
    });

    // Get page title
    const title = await page.title();
    console.log("Admin page title:", title);

    // Log all text content to understand what's on the page
    const pageText = await page.textContent("body");
    console.log(
      "Admin page text content (first 500 chars):",
      pageText?.substring(0, 500),
    );

    // Check for any visible elements
    const allElements = await page.locator("*").count();
    console.log("Total elements on admin page:", allElements);

    // Just verify we can access the admin page
    expect(page.url()).toContain("/admin");
  });

  test("should list all available links/navigation", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedApp(page);

    // Find all links on the page
    const links = await page.locator("a").all();
    console.log(`Found ${links.length} links on homepage:`);

    for (const link of links) {
      try {
        const href = await link.getAttribute("href");
        const text = await link.textContent();
        if (href && text?.trim()) {
          console.log(`- "${text.trim()}" -> ${href}`);
        }
      } catch {
        // Skip if link is not accessible
      }
    }

    // Find any buttons that might be navigation
    const buttons = await page.locator("button").all();
    console.log(`Found ${buttons.length} buttons on homepage:`);

    for (const button of buttons) {
      try {
        const text = await button.textContent();
        if (text?.trim()) {
          console.log(`- Button: "${text.trim()}"`);
        }
      } catch {
        // Skip if button is not accessible
      }
    }
  });

  test("should try accessing different admin routes directly", async ({
    page,
  }) => {
    const adminRoutes = [
      "/admin",
      "/AdminSeason",
      "/AdminPlayer",
      "/AdminTeam",
      "/AdminFixture",
      "/AdminTigersFixture",
      "/AdminGameStats",
    ];

    for (const route of adminRoutes) {
      console.log(`\n--- Testing route: ${route} ---`);

      try {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        console.log(`✅ Successfully accessed: ${route}`);
        console.log(`Current URL: ${page.url()}`);

        // Check for any error messages
        const errorText = await page.locator("text=Error").count();
        const notFoundText = await page.locator("text=404").count();

        if (errorText > 0 || notFoundText > 0) {
          console.log(`⚠️ Possible error on ${route}`);
        } else {
          console.log(`✅ ${route} loaded without errors`);
        }
      } catch (error) {
        console.log(`❌ Failed to access: ${route} - ${error.message}`);
      }
    }
  });
});
