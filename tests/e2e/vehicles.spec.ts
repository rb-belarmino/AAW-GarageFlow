import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
  await page.getByPlaceholder("••••••••").fill("Password123!");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe("Vehicle Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display vehicle list and search filter correctly", async ({ page }) => {
    await page.goto("/vehicles");

    // Wait for search input
    const searchInput = page.getByPlaceholder(/Search vehicles by VIN, make, model/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Search for a specific make (e.g. Civic or Ford)
    await searchInput.fill("Civic");

    // Table should contain Civic
    await expect(page.getByText("Civic", { exact: false }).first()).toBeVisible({ timeout: 5000 });

    // Clear search
    await searchInput.fill("");
  });

  test("should open Add Vehicle dialog", async ({ page }) => {
    await page.goto("/vehicles");

    const addVehicleButton = page.getByRole("button", { name: "Add Vehicle" });
    await expect(addVehicleButton).toBeVisible();
    await addVehicleButton.click();

    await expect(page.getByRole("heading", { name: "Register New Vehicle" })).toBeVisible();
    await expect(page.getByPlaceholder(/2HGFE2F53PH518377/i)).toBeVisible();
  });
});
