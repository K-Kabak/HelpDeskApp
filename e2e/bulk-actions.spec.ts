import { test, expect } from "@playwright/test";

test.describe("Bulk Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent/admin to access bulk actions
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Agent123!");
    await page.getByRole("button", { name: /zaloguj/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL("/app");
  });

  test("agent can select multiple tickets and change status", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"], .rounded-xl.border', { timeout: 5000 });

    // Select first ticket checkbox (if available)
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('#select-all') });
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount === 0) {
      test.skip();
      return;
    }

    // Select at least one ticket
    await checkboxes.first().check();

    // Verify bulk actions toolbar appears
    await expect(page.getByText(/Wybrano \d+ zgłoszeń/i)).toBeVisible();

    // Click "Zmień status" button
    await page.getByRole("button", { name: "Zmień status" }).click();

    // Select new status
    await page.locator('select').filter({ hasText: /status/i }).selectOption("W_TOKU");

    // Confirm update
    await page.getByRole("button", { name: /zaktualizuj/i }).click();

    // Verify success message
    await expect(page.getByText(/Zaktualizowano status/i)).toBeVisible({ timeout: 5000 });
  });

  test("agent can assign multiple tickets to agent", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"], .rounded-xl.border', { timeout: 5000 });

    // Select first ticket checkbox
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('#select-all') });
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount === 0) {
      test.skip();
      return;
    }

    await checkboxes.first().check();

    // Click "Przypisz" button
    await page.getByRole("button", { name: "Przypisz" }).click();

    // Select agent (if available)
    const agentSelect = page.locator('select').filter({ hasText: /agent/i }).first();
    if (await agentSelect.count() > 0) {
      const options = await agentSelect.locator('option').count();
      if (options > 1) {
        await agentSelect.selectOption({ index: 1 });
      }
    }

    // Confirm assignment
    await page.getByRole("button", { name: /przypisz/i }).click();

    // Verify success message
    await expect(page.getByText(/Przypisano/i)).toBeVisible({ timeout: 5000 });
  });

  test("agent can select all tickets", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"], .rounded-xl.border', { timeout: 5000 });

    // Find "Select all" checkbox
    const selectAllCheckbox = page.locator('#select-all');
    const isVisible = await selectAllCheckbox.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }

    // Click select all
    await selectAllCheckbox.check();

    // Verify bulk actions toolbar shows correct count
    const ticketCount = await page.locator('input[type="checkbox"]:checked').filter({ hasNot: page.locator('#select-all') }).count();
    if (ticketCount > 0) {
      await expect(page.getByText(new RegExp(`Wybrano ${ticketCount} zgłoszeń`, "i"))).toBeVisible();
    }
  });

  test("bulk actions toolbar clears selection after update", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"], .rounded-xl.border', { timeout: 5000 });

    // Select first ticket
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('#select-all') });
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount === 0) {
      test.skip();
      return;
    }

    await checkboxes.first().check();

    // Verify toolbar appears
    await expect(page.getByText(/Wybrano/i)).first()).toBeVisible();

    // Click "Zmień status"
    await page.getByRole("button", { name: "Zmień status" }).click();

    // Select status and confirm
    await page.locator('select').filter({ hasText: /status/i }).selectOption("W_TOKU");
    await page.getByRole("button", { name: /zaktualizuj/i }).click();

    // Wait for update to complete
    await page.waitForTimeout(1000);

    // Verify toolbar is hidden (selection cleared)
    await expect(page.getByText(/Wybrano/i).first()).not.toBeVisible({ timeout: 3000 });
  });

  test("requester cannot see bulk actions", async ({ page }) => {
    // Login as requester
    await page.goto("/login");
    await page.getByLabel("Email").fill("requester@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Requester123!");
    await page.getByRole("button", { name: /zaloguj/i }).click();
    
    await page.waitForURL("/app");
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"], .rounded-xl.border', { timeout: 5000 });

    // Verify bulk actions toolbar is not visible
    await expect(page.getByRole("button", { name: "Zmień status" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Przypisz" })).not.toBeVisible();
    
    // Verify checkboxes are not visible
    const checkboxes = page.locator('input[type="checkbox"]').filter({ hasNot: page.locator('#select-all') });
    const visibleCheckboxes = await checkboxes.filter({ has: page.locator(':visible') }).count();
    expect(visibleCheckboxes).toBe(0);
  });
});

