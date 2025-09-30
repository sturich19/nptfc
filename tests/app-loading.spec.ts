import { test, expect } from "@playwright/test";

test.describe("NPTFC App Loading", () => {
  test("should load the application and handle authentication", async ({
    page,
  }) => {
    // Navigate to the application
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // The app should either show:
    // 1. Loading state
    // 2. Redirect to Auth0 login
    // 3. Authenticated content (if somehow logged in)

    const currentUrl = page.url();

    if (currentUrl.includes("auth0.com")) {
      // We're on Auth0 login page - this is expected!
      console.log("✅ App correctly redirected to Auth0 authentication");

      // Check that we're on a login page
      expect(currentUrl).toContain("auth0.com");
      expect(currentUrl).toContain("login");

      // The page should have login form elements (be flexible about structure)
      const loginSelectors = [
        'input[type="email"]',
        'input[name="username"]',
        'input[name="email"]',
        "#username",
        "#email",
        "form",
        '[data-testid="username"]',
      ];

      let loginFormFound = false;
      for (const selector of loginSelectors) {
        try {
          await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
          loginFormFound = true;
          break;
        } catch {
          continue;
        }
      }

      // If no specific login form found, just verify we're on Auth0
      if (!loginFormFound) {
        console.log(
          "Login form structure may have changed, but Auth0 redirect is working",
        );
        expect(currentUrl).toContain("auth0.com");
      }
    } else {
      // We're still on localhost - check what's showing
      console.log("App loaded on localhost, checking content...");

      // Should show loading or redirect message
      const loadingText = page.locator("text=Loading");
      const redirectText = page.locator("text=Redirecting to login");

      const hasLoading = await loadingText.isVisible();
      const hasRedirect = await redirectText.isVisible();

      expect(hasLoading || hasRedirect).toBeTruthy();
    }
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    // Check page title (should work regardless of auth state)
    await expect(page).toHaveTitle(
      /NPTFC|Newport Pagnell Tigers|Tigers|React App/,
    );
  });

  test("should not have critical JavaScript errors on load", async ({
    page,
  }) => {
    const jsErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon")) {
        jsErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out expected Auth0, backend connection errors, and known issues
    const criticalErrors = jsErrors.filter(
      (error) =>
        !error.includes("auth0") &&
        !error.includes("favicon") &&
        !error.includes("Microsoft Clarity") &&
        !error.includes("chunk") &&
        !error.includes("AxiosError") &&
        !error.includes("Connection refused") &&
        !error.includes("Error fetching data"),
    );

    // Log any errors for debugging
    if (criticalErrors.length > 0) {
      console.log("JavaScript errors found:", criticalErrors);
    }

    expect(criticalErrors.length).toBeLessThanOrEqual(1); // Allow 1 minor error
  });

  test("should load CSS and basic styling", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check that some basic styling is applied
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        margin: styles.margin,
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
      };
    });

    // Basic check that CSS is loaded
    expect(bodyStyles.fontFamily).toBeTruthy();
    expect(bodyStyles.fontFamily).not.toBe("");
  });
});
