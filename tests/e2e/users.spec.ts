import { test, expect } from "@playwright/test";

test.describe("Staff & User Management (RBAC)", () => {
  const uniqueId = Date.now().toString().slice(-4);
  const techUsername = `tech_${uniqueId}`;
  const techPassword = "TechPassword123!";

  test("should allow Manager to view staff list and create new Technician user", async ({ page }) => {
    // 1. Login as Admin / Manager
    await page.goto("/login");
    await page.getByPlaceholder("e.g. admin or tech1").fill("admin");
    await page.getByPlaceholder("••••••••").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await page.goto("/users");

    // Verify Manager heading and badge
    await expect(page.getByRole("heading", { name: /Staff & User Management/i })).toBeVisible();
    await expect(page.getByText(/Manager Access/i)).toBeVisible();

    // Verify Add New User button opens modal
    const addUserBtn = page.getByRole("button", { name: /Add New User/i });
    await expect(addUserBtn).toBeVisible();
    await addUserBtn.click();

    await expect(page.getByRole("heading", { name: /Add Shop Staff \/ User/i })).toBeVisible();

    // Fill new user form
    await page.getByPlaceholder(/Carlos Rodriguez/i).fill(`Auto Technician ${uniqueId}`);
    await page.getByPlaceholder(/crodriguez or tech3/i).fill(techUsername);
    await page.locator("form input[type='password']").fill(techPassword);

    // Save user
    await page.getByRole("button", { name: /Save User/i }).click();

    // Modal should close and new user appears in table
    await expect(page.getByRole("heading", { name: /Add Shop Staff \/ User/i })).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(techUsername)).toBeVisible({ timeout: 10000 });
  });

  test("should block Technician from accessing user management", async ({ page }) => {
    // Login as newly created Technician
    await page.goto("/login");
    await page.getByPlaceholder("e.g. admin or tech1").fill(techUsername);
    await page.getByPlaceholder("••••••••").fill(techPassword);
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Navigate to /users
    await page.goto("/users");

    // Should show Access Restricted message
    await expect(page.getByRole("heading", { name: /Access Restricted/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Only Managers can manage shop users/i)).toBeVisible();
  });
});
