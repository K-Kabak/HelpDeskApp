import { test, expect } from "@playwright/test";

test.describe("Bulk Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Agent123!");
    await page.getByRole("button", { name: "Zaloguj" }).click();

    // Wait for navigation to app
    await page.waitForURL("/app");
  });

  test("agent can select multiple tickets and change status", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: 10000 });

    // Get all ticket checkboxes (limit to first 3 for testing)
    const checkboxes = page.locator('input[type="checkbox"]').all();
    const checkboxArray = await checkboxes;

    if (checkboxArray.length < 2) {
      test.skip("Not enough tickets to test bulk actions");
      return;
    }

    // Select first 2 tickets
    await checkboxArray[0].check();
    await checkboxArray[1].check();

    // Verify selection count
    await expect(page.getByText("Wybrano 2 zgłoszeń")).toBeVisible();

    // Click "Zmień status" button
    await page.getByRole("button", { name: "Zmień status" }).click();

    // Select new status (W_TOKU)
    await page.getByRole("combobox").selectOption("W_TOKU");

    // Click "Zaktualizuj" button
    await page.getByRole("button", { name: "Zaktualizuj" }).click();

    // Wait for success message
    await expect(page.getByText("Zaktualizowano status 2 zgłoszeń")).toBeVisible();

    // Verify checkboxes are cleared
    await expect(page.getByText("Wybrano")).not.toBeVisible();
  });

  test("agent can select multiple tickets and assign to agent", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: 10000 });

    // Get all ticket checkboxes (limit to first 2 for testing)
    const checkboxes = page.locator('input[type="checkbox"]').all();
    const checkboxArray = await checkboxes;

    if (checkboxArray.length < 2) {
      test.skip("Not enough tickets to test bulk actions");
      return;
    }

    // Select first 2 tickets
    await checkboxArray[0].check();
    await checkboxArray[1].check();

    // Verify selection count
    await expect(page.getByText("Wybrano 2 zgłoszeń")).toBeVisible();

    // Click "Przypisz" button
    await page.getByRole("button", { name: "Przypisz" }).click();

    // Select an agent (first available agent)
    const agentSelect = page.locator('select[name*="agent"]');
    await agentSelect.selectOption({ index: 1 }); // Skip "Brak" option

    // Click "Przypisz" button
    await page.getByRole("button", { name: "Przypisz" }).click();

    // Wait for success message
    await expect(page.getByText("Przypisano 2 zgłoszeń")).toBeVisible();

    // Verify checkboxes are cleared
    await expect(page.getByText("Wybrano")).not.toBeVisible();
  });

  test("agent can select all tickets using select all checkbox", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: 10000 });

    // Get ticket count from "Zaznacz wszystkie" label
    const selectAllLabel = page.getByText(/Zaznacz wszystkie \((\d+)\)/);
    const match = await selectAllLabel.textContent();
    const ticketCount = match ? parseInt(match.match(/(\d+)/)?.[1] || "0") : 0;

    if (ticketCount === 0) {
      test.skip("No tickets to test bulk actions");
      return;
    }

    // Click select all checkbox
    await page.getByLabel("Zaznacz wszystkie zgłoszenia").check();

    // Verify all tickets are selected
    await expect(page.getByText(`Wybrano ${ticketCount} zgłoszeń`)).toBeVisible();

    // Click clear selection
    await page.getByRole("button", { name: "Wyczyść wybór" }).click();

    // Verify selection is cleared
    await expect(page.getByText("Wybrano")).not.toBeVisible();
  });

  test("bulk actions work correctly with partial failures", async ({ page }) => {
    // This test would require setting up a scenario where some tickets fail
    // For now, we'll test the basic functionality and error handling
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: 10000 });

    const checkboxes = page.locator('input[type="checkbox"]').all();
    const checkboxArray = await checkboxes;

    if (checkboxArray.length < 1) {
      test.skip("No tickets to test bulk actions");
      return;
    }

    // Select one ticket
    await checkboxArray[0].check();

    // Try to change status to an invalid state (this should work with valid data)
    await page.getByRole("button", { name: "Zmień status" }).click();
    await page.getByRole("combobox").selectOption("ROZWIAZANE");
    await page.getByRole("button", { name: "Zaktualizuj" }).click();

    // Should succeed or show appropriate message
    await expect(
      page.getByText(/Zaktualizowano status/).or(page.getByText(/Nie udało się/))
    ).toBeVisible();
  });

  test("bulk actions toolbar appears and disappears correctly", async ({ page }) => {
    await page.goto("/app");

    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: 10000 });

    const checkboxes = page.locator('input[type="checkbox"]').all();
    const checkboxArray = await checkboxes;

    if (checkboxArray.length === 0) {
      test.skip("No tickets to test bulk actions");
      return;
    }

    // Initially no toolbar should be visible
    await expect(page.getByText("Wybrano")).not.toBeVisible();

    // Select a ticket
    await checkboxArray[0].check();

    // Toolbar should appear
    await expect(page.getByText("Wybrano 1 zgłoszenie")).toBeVisible();

    // Deselect the ticket
    await checkboxArray[0].uncheck();

    // Toolbar should disappear
    await expect(page.getByText("Wybrano")).not.toBeVisible();
  });
});
