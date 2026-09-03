import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("should display login form with brand elements", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Atlantic Auto World" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. admin or tech1")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });

  test("should show error alert on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("e.g. admin or tech1").fill("wronguser");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /Sign In/i }).click();

    const alert = page.locator("form div[role='alert'], .text-destructive");
    await expect(alert.first()).toBeVisible({ timeout: 10000 });
    await expect(alert.first()).toContainText("Invalid username or password");
  });

  test("should successfully login and redirect with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
    await page.getByPlaceholder("••••••••").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // After sign in, should redirect to home or vehicles
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  });
});
