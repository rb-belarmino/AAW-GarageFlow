import { Page, expect } from "@playwright/test";

export async function loginAs(page: Page, username = "admin", password = "Password123!") {
  await page.goto("/login");
  await page.getByPlaceholder("e.g. admin or tech1").fill(username);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  return loginAs(page, "admin", "Password123!");
}
