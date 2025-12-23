import { test, expect } from "@playwright/test";

test.describe("Admin Teams Management", () => {
  test.beforeEach(async ({ page }) => {
    // This would need to be adapted to your authentication system
    // For now, assuming we have a way to login as admin
    await page.goto("/login");
    // TODO: Add admin login steps
  });

  test("admin can create new team", async ({ page }) => {
    await page.goto("/app/admin/teams");

    // Click "Dodaj zespół" button
    await page.getByRole("button", { name: "Dodaj zespół" }).click();

    // Fill in the form
    await page.getByLabel("Nazwa zespołu").fill("Zespół Testowy");

    // Submit the form
    await page.getByRole("button", { name: "Dodaj zespół" }).click();

    // Verify success message
    await expect(page.getByText("Zespół dodany.")).toBeVisible();

    // Verify team appears in the list
    await expect(page.getByText("Zespół Testowy")).toBeVisible();
  });

  test("admin can edit team name", async ({ page }) => {
    await page.goto("/app/admin/teams");

    // Find and click edit button for first team
    await page.getByRole("button", { name: "Edytuj" }).first().click();

    // Update team name
    const input = page.getByDisplayValue(/./); // Find the input with current team name
    await input.fill("Zaktualizowany Zespół");

    // Submit the form
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Verify success message
    await expect(page.getByText("Zespół zaktualizowany.")).toBeVisible();

    // Verify updated name appears
    await expect(page.getByText("Zaktualizowany Zespół")).toBeVisible();
  });

  test("admin can add user to team", async ({ page }) => {
    // First create a test team
    await page.goto("/app/admin/teams");

    await page.getByRole("button", { name: "Dodaj zespół" }).click();
    await page.getByLabel("Nazwa zespołu").fill("Zespół do Testów Członkostwa");
    await page.getByRole("button", { name: "Dodaj zespół" }).click();
    await expect(page.getByText("Zespół dodany.")).toBeVisible();

    // Click "Zarządzaj" button for the new team
    await page.getByText("Zespół do Testów Członkostwa").locator("..").getByRole("button", { name: "Zarządzaj" }).click();

    // Add a user to the team (assuming there's at least one user available)
    const userSelect = page.getByRole("combobox");
    if (await userSelect.count() > 0) {
      await userSelect.selectOption({ index: 0 }); // Select first available user
      await page.getByRole("button", { name: "Dodaj" }).click();

      // Verify user was added
      await expect(page.getByText("Członek dodany do zespołu.")).toBeVisible();
    }
  });

  test("admin can remove user from team", async ({ page }) => {
    await page.goto("/app/admin/teams");

    // Find a team with members and click manage
    const teamWithMembers = page.locator('[data-testid="team-row"]').filter({
      hasText: /\d+ członków/
    });

    if (await teamWithMembers.count() > 0) {
      await teamWithMembers.first().getByRole("button", { name: "Zarządzaj" }).click();

      // Remove first member
      await page.getByRole("button", { name: "Usuń" }).first().click();

      // Verify member was removed
      await expect(page.getByText("Członek usunięty z zespołu.")).toBeVisible();
    }
  });

  test("admin cannot delete team with active tickets", async ({ page }) => {
    await page.goto("/app/admin/teams");

    // Find a team with active tickets (if any exist)
    const teamWithActiveTickets = page.locator('[data-testid="team-row"]').filter({
      hasText: "aktywnych zgłoszeń"
    });

    if (await teamWithActiveTickets.count() > 0) {
      // Click delete button
      await teamWithActiveTickets.getByRole("button", { name: "Usuń" }).click();

      // Confirm deletion
      page.on('dialog', dialog => dialog.accept());

      // Verify error message
      await expect(page.getByText(/nie można usunąć/i)).toBeVisible();
    }
  });

  test("admin can delete team without active tickets", async ({ page }) => {
    // First create a test team
    await page.goto("/app/admin/teams");

    await page.getByRole("button", { name: "Dodaj zespół" }).click();
    await page.getByLabel("Nazwa zespołu").fill("Zespół do Usunięcia");
    await page.getByRole("button", { name: "Dodaj zespół" }).click();
    await expect(page.getByText("Zespół dodany.")).toBeVisible();

    // Now delete the team
    await page.getByText("Zespół do Usunięcia").locator("..").getByRole("button", { name: "Usuń" }).click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    // Verify success message
    await expect(page.getByText("Zespół usunięty.")).toBeVisible();

    // Verify team is no longer in the list
    await expect(page.getByText("Zespół do Usunięcia")).not.toBeVisible();
  });

  test("team name validation works", async ({ page }) => {
    await page.goto("/app/admin/teams");

    // Click "Dodaj zespół" button
    await page.getByRole("button", { name: "Dodaj zespół" }).click();

    // Try to submit empty form
    await page.getByRole("button", { name: "Dodaj zespół" }).click();

    // Verify validation error
    await expect(page.getByText("Nazwa zespołu jest wymagana.")).toBeVisible();

    // Try with existing team name (assuming "Zespół Wsparcia" exists)
    await page.getByLabel("Nazwa zespołu").fill("Zespół Wsparcia");
    await page.getByRole("button", { name: "Dodaj zespół" }).click();

    // Should show duplicate name error
    await expect(page.getByText("Nazwa zespołu już istnieje.")).toBeVisible();
  });
});
