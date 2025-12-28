import { test, expect } from "@playwright/test";

test.describe("Saved Views", () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto("/login");
    await page.getByLabel("Email").fill("agent@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Agent123!");
    await page.getByRole("button", { name: "Zaloguj" }).click();

    // Wait for navigation to app
    await page.waitForURL("/app");
  });

  test("agent can save current view with filters", async ({ page }) => {
    await page.goto("/app");

    // Apply some filters first (status filter)
    await page.getByRole("combobox", { name: "Status" }).selectOption("NOWE");

    // Wait for "Zapisz jako widok" button to appear
    await expect(page.getByRole("button", { name: "Zapisz jako widok" })).toBeVisible();

    // Click save view button
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    // Fill view name in dialog
    const viewName = `Test View ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(viewName);

    // Check "Ustaw jako domyślny" checkbox
    await page.getByLabel("Ustaw jako domyślny").check();

    // Click save button
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Wait for success (dialog closes and view appears in tabs)
    await expect(page.getByRole("button", { name: viewName })).toBeVisible();

    // Verify the view has a star (default indicator)
    await expect(page.getByText("★")).toBeVisible();
  });

  test("agent can load a saved view", async ({ page }) => {
    await page.goto("/app");

    // First create a test view
    await page.getByRole("combobox", { name: "Status" }).selectOption("W_TOKU");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const viewName = `Load Test View ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(viewName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Wait for view to appear
    await expect(page.getByRole("button", { name: viewName })).toBeVisible();

    // Clear current filters
    await page.getByRole("combobox", { name: "Status" }).selectOption("");

    // Click on the saved view
    await page.getByRole("button", { name: viewName }).click();

    // Verify the view is active (button should be blue)
    const activeViewButton = page.locator('[class*="bg-sky-600"]').filter({ hasText: viewName });
    await expect(activeViewButton).toBeVisible();

    // Verify status filter is applied
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue("W_TOKU");
  });

  test("agent can edit view name", async ({ page }) => {
    await page.goto("/app");

    // Create a test view first
    await page.getByRole("combobox", { name: "Status" }).selectOption("OCZEKUJE_NA_UZYTKOWNIKA");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const originalName = `Edit Test View ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(originalName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Wait for view to appear
    await expect(page.getByRole("button", { name: originalName })).toBeVisible();

    // Click the edit button (pencil icon) on the active view
    await page.getByRole("button", { name: originalName }).click(); // Make it active first

    // Find and click the edit button
    const editButton = page.locator('[title="Edytuj nazwę"]').first();
    await editButton.click();

    // Enter new name in prompt
    const newName = `Edited View ${Date.now()}`;
    await page.evaluate((name) => {
      window.prompt = () => name;
    }, newName);

    // Click the edit button again to trigger the prompt
    await editButton.click();

    // Wait for view name to update
    await expect(page.getByRole("button", { name: newName })).toBeVisible();
    await expect(page.getByRole("button", { name: originalName })).not.toBeVisible();
  });

  test("agent can delete a saved view", async ({ page }) => {
    await page.goto("/app");

    // Create a test view first
    await page.getByRole("combobox", { name: "Status" }).selectOption("ROZWIAZANE");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const viewName = `Delete Test View ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(viewName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Wait for view to appear
    await expect(page.getByRole("button", { name: viewName })).toBeVisible();

    // Click the view to make it active
    await page.getByRole("button", { name: viewName }).click();

    // Find and click the delete button (trash icon)
    const deleteButton = page.locator('[title="Usuń widok"]').first();
    await deleteButton.click();

    // Confirm deletion in alert
    page.on('dialog', dialog => dialog.accept());

    // Wait for view to be removed
    await expect(page.getByRole("button", { name: viewName })).not.toBeVisible();
  });

  test("agent can set view as default and unset default", async ({ page }) => {
    await page.goto("/app");

    // Create two test views
    await page.getByRole("combobox", { name: "Status" }).selectOption("NOWE");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const firstViewName = `Default Test View 1 ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(firstViewName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Create second view
    await page.getByRole("combobox", { name: "Status" }).selectOption("W_TOKU");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const secondViewName = `Default Test View 2 ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(secondViewName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Wait for both views to appear
    await expect(page.getByRole("button", { name: firstViewName })).toBeVisible();
    await expect(page.getByRole("button", { name: secondViewName })).toBeVisible();

    // Set first view as default (it should not have a star yet)
    await page.getByRole("button", { name: firstViewName }).click(); // Make it active
    const starButton = page.locator('[title="Ustaw jako domyślny"]').first();
    await starButton.click();

    // Verify first view has star
    const firstViewWithStar = page.locator(`button:has-text("${firstViewName}")`).locator('xpath=following-sibling::*').filter({ hasText: "★" });
    await expect(firstViewWithStar).toBeVisible();

    // Set second view as default
    await page.getByRole("button", { name: secondViewName }).click(); // Make it active
    const starButton2 = page.locator('[title="Ustaw jako domyślny"]').first();
    await starButton2.click();

    // Verify second view has star and first view doesn't
    const secondViewWithStar = page.locator(`button:has-text("${secondViewName}")`).locator('xpath=following-sibling::*').filter({ hasText: "★" });
    await expect(secondViewWithStar).toBeVisible();

    // First view should no longer have star (since only one can be default)
    const firstViewWithoutStar = page.locator(`button:has-text("${firstViewName}")`).filter({ hasText: "★" });
    await expect(firstViewWithoutStar).not.toBeVisible();
  });

  test("saved views are scoped to organization", async ({ page }) => {
    await page.goto("/app");

    // Create a test view
    await page.getByRole("combobox", { name: "Status" }).selectOption("ZAMKNIETE");
    await page.getByRole("button", { name: "Zapisz jako widok" }).click();

    const viewName = `Org Scope Test ${Date.now()}`;
    await page.getByLabel("Nazwa widoku").fill(viewName);
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Verify view appears for current user
    await expect(page.getByRole("button", { name: viewName })).toBeVisible();

    // Logout and login as different user in same org
    await page.getByRole("button", { name: /logout|wyloguj/i }).click();
    await page.waitForURL("/login");

    // Login as admin (same org)
    await page.getByLabel("Email").fill("admin@serwisdesk.local");
    await page.getByLabel("Hasło").fill("Admin123!");
    await page.getByRole("button", { name: "Zaloguj" }).click();
    await page.waitForURL("/app");

    // The view should still be visible (same org)
    await expect(page.getByRole("button", { name: viewName })).toBeVisible();
  });

  test("view dropdown shows all available views", async ({ page }) => {
    await page.goto("/app");

    // Create multiple test views
    const viewNames = [];
    for (let i = 0; i < 3; i++) {
      await page.getByRole("combobox", { name: "Status" }).selectOption("NOWE");
      await page.getByRole("button", { name: "Zapisz jako widok" }).click();

      const viewName = `Dropdown Test View ${i} ${Date.now()}`;
      viewNames.push(viewName);
      await page.getByLabel("Nazwa widoku").fill(viewName);
      await page.getByRole("button", { name: "Zapisz" }).click();
    }

    // Check that dropdown contains all views
    const dropdown = page.locator('select').filter({ hasText: "Wszystkie widoki" });
    await dropdown.click();

    // Verify all views are in dropdown options
    for (const viewName of viewNames) {
      await expect(page.locator('option').filter({ hasText: viewName })).toBeVisible();
    }

    // Select a view from dropdown
    await dropdown.selectOption({ label: viewNames[0] });

    // Verify the view becomes active
    const activeViewButton = page.locator('[class*="bg-sky-600"]').filter({ hasText: viewNames[0] });
    await expect(activeViewButton).toBeVisible();
  });
});
