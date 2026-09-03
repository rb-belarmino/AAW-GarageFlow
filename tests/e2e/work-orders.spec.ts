import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
  await page.getByPlaceholder("••••••••").fill("Password123!");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe("Work Orders Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display work orders and search filter", async ({ page }) => {
    await page.goto("/work-orders");

    // Wait for work orders page elements
    await expect(page.getByRole("button", { name: /New Work Order/i })).toBeVisible({ timeout: 10000 });

    // Verify search input is present
    const searchInput = page.getByPlaceholder(/Search work orders by Task keyword, VIN, or Order Number/i);
    await expect(searchInput).toBeVisible();

    // Verify work orders or cards are rendered
    await expect(page.getByText(/WO-10/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should open New Work Order modal", async ({ page }) => {
    await page.goto("/work-orders");

    const newOrderBtn = page.getByRole("button", { name: /New Work Order/i });
    await newOrderBtn.click();

    await expect(page.getByRole("heading", { name: /Create Work Order/i })).toBeVisible();
  });
});
