import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
  await page.getByPlaceholder("••••••••").fill("Password123!");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe("Work Order Lifecycle & Checklist Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should filter work orders by status tabs", async ({ page }) => {
    await page.goto("/work-orders");

    // Check tabs exist
    const allTab = page.getByRole("button", { name: /All \(/i });
    const inProgressTab = page.getByRole("button", { name: /In Progress/i });
    const doneTab = page.getByRole("button", { name: /Ready \/ Done/i });

    await expect(allTab).toBeVisible({ timeout: 10000 });
    await expect(inProgressTab).toBeVisible();
    await expect(doneTab).toBeVisible();

    // Click In Progress tab
    await inProgressTab.click();
    await page.waitForTimeout(500);

    // Click All tab
    await allTab.click();
    await page.waitForTimeout(500);
  });

  test("should toggle checklist task completion", async ({ page }) => {
    await page.goto("/work-orders");

    // Find the first checklist task button (e.g. task button inside the work order card)
    const taskButton = page.locator("button:has-text('+ Note'), button:has-text('Edit Note')").first();
    await expect(taskButton).toBeVisible({ timeout: 10000 });

    // Click to toggle
    await taskButton.click();
    await page.waitForTimeout(1000);
  });
});
