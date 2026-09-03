import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Vehicle Lifecycle CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should register a new vehicle and display it in the inventory table", async ({ page }) => {
    await page.goto("/vehicles");

    const uniqueSuffix = Date.now().toString().slice(-6);
    const uniqueVin = `1HGCR2F83HA${uniqueSuffix}`;

    // Open Add Vehicle dialog
    await page.getByRole("button", { name: "Add Vehicle" }).click();
    await expect(page.getByRole("heading", { name: "Register New Vehicle" })).toBeVisible();

    // Fill form
    await page.getByPlaceholder(/2HGFE2F53PH518377/i).fill(uniqueVin);
    await page.getByPlaceholder(/Honda, Toyota/i).fill("TestToyota");
    await page.getByPlaceholder(/Civic, RAV4/i).fill("TestCorolla");
    await page.getByPlaceholder(/Aegean Blue, Black/i).fill("Silver");

    // Save
    await page.getByRole("button", { name: /Save Vehicle/i }).click();

    // Verify modal closed
    await expect(page.getByRole("heading", { name: "Register New Vehicle" })).not.toBeVisible({ timeout: 10000 });

    // Search for the newly created vehicle
    const searchInput = page.getByPlaceholder(/Search vehicles by VIN, make, model/i);
    await searchInput.fill(uniqueVin);

    // Should find the vehicle row
    await expect(page.getByText(uniqueVin)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("TestToyota", { exact: false })).toBeVisible();
  });
});
