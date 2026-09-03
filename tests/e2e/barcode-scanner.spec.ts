import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
  await page.getByPlaceholder("••••••••").fill("Password123!");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test.describe("Barcode Scanner & VIN Capture", () => {
  test("should open Barcode Scanner modal without console crash or runtime errors", async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await loginAsAdmin(page);
    await page.goto("/vehicles");

    // Open Add Vehicle dialog
    await page.getByRole("button", { name: "Add Vehicle" }).click();
    await expect(page.getByRole("heading", { name: "Register New Vehicle" })).toBeVisible();

    // Click Scan Barcode button
    const scanButton = page.getByRole("button", { name: /Scan Barcode/i });
    await expect(scanButton).toBeVisible();
    await scanButton.click();

    // Verify Barcode Scanner modal is displayed
    const scannerModal = page.getByRole("dialog", { name: /Scan VIN Barcode/i });
    await expect(scannerModal).toBeVisible();

    const scannerModalHeading = scannerModal.getByRole("heading", { name: /Scan VIN Barcode/i });
    await expect(scannerModalHeading).toBeVisible();

    // Verify upload / photo button exists
    const uploadButton = scannerModal.getByRole("button", { name: /Take Photo \/ Upload Image/i });
    await expect(uploadButton).toBeVisible();

    // Wait a brief moment to ensure live scanner loop runs cleanly without throwing unhandled exceptions
    await page.waitForTimeout(1000);

    // Close scanner modal using cancel button with force click
    const cancelButton = scannerModal.getByRole("button", { name: /^Cancel$/i });
    await cancelButton.click({ force: true });

    // Modal should be closed
    await expect(scannerModal).not.toBeVisible();

    // Assert zero uncaught page errors
    expect(pageErrors).toEqual([]);
  });
});
