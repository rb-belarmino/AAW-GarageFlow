import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Dashboard & Overview", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should render metrics cards and dashboard overview", async ({ page }) => {
    await page.goto("/");

    // Verify main title
    await expect(page.getByRole("heading", { name: /Dealer Yard Overview/i })).toBeVisible();

    // Verify metric cards
    await expect(page.getByRole("heading", { name: /Fleet Inventory/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /In Progress Tasks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Completed Ratio/i })).toBeVisible();

    // Verify Quick Actions buttons
    await expect(page.getByRole("button", { name: /Work Order Board/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Add Vehicle/i })).toBeVisible();

    // Verify Live Work Order Stream heading
    await expect(page.getByRole("heading", { name: /Live Work Order Stream/i })).toBeVisible();
  });

  test("should navigate to work orders and vehicles from quick action links", async ({ page }) => {
    await page.goto("/");

    // Click Work Order Board button
    await page.getByRole("button", { name: /Work Order Board/i }).click();
    await expect(page).toHaveURL(/\/work-orders/);

    // Return to dashboard
    await page.goto("/");

    // Click Add Vehicle button
    await page.getByRole("button", { name: /Add Vehicle/i }).click();
    await expect(page).toHaveURL(/\/vehicles/);
  });
});
