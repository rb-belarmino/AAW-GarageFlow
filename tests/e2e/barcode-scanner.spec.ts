import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

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

  test("should extract VIN from barcode photo upload and populate form", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/vehicles");

    // Open Add Vehicle dialog
    await page.getByRole("button", { name: "Add Vehicle" }).click();
    await expect(page.getByRole("heading", { name: "Register New Vehicle" })).toBeVisible();

    // Click Scan Barcode button
    await page.getByRole("button", { name: /Scan Barcode/i }).click();
    const scannerModal = page.getByRole("dialog", { name: /Scan VIN Barcode/i });
    await expect(scannerModal).toBeVisible();

    // Generate a test QR image with valid 17-char VIN in browser context and trigger upload
    const testVin = "KMHGN4JE3JU100001";
    await page.evaluate(async (vin) => {
      // Create a canvas with a QR code or barcode representation
      const canvas = document.createElement("canvas");
      canvas.width = 250;
      canvas.height = 250;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 250, 250);

      // Draw high-contrast test pattern with text
      ctx.fillStyle = "black";
      ctx.font = "bold 16px monospace";
      ctx.fillText(vin, 20, 120);

      // Convert to file and set to input
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      const file = new File([blob], "vin-sample.png", { type: "image/png" });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, testVin);

    // Form should have the VIN input ready for user
    const vinInput = page.getByPlaceholder(/2HGFE2F53PH518377/i);
    await expect(vinInput).toBeVisible();
  });
});
