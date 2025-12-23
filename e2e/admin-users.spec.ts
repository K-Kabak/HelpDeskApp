import { test, expect } from "@playwright/test";

test.describe("Admin Users Management", () => {
  test.beforeEach(async ({ page }) => {
    // This would need to be adapted to your authentication system
    // For now, assuming we have a way to login as admin
    await page.goto("/login");
    // TODO: Add admin login steps
  });

  test("admin can create new user", async ({ page }) => {
    await page.goto("/app/admin/users");

    // Click "Dodaj użytkownika" button
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Fill in the form
    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Imię i nazwisko").fill("Nowy Użytkownik");
    await page.getByLabel("Hasło").fill("password123");
    await page.getByRole("combobox", { name: /rola/i }).selectOption("AGENT");

    // Submit the form
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Verify success message
    await expect(page.getByText("Użytkownik dodany.")).toBeVisible();

    // Verify user appears in the list
    await expect(page.getByText("Nowy Użytkownik")).toBeVisible();
    await expect(page.getByText("newuser@example.com")).toBeVisible();
  });

  test("admin can edit existing user", async ({ page }) => {
    await page.goto("/app/admin/users");

    // Find and click edit button for first user
    await page.getByRole("button", { name: "Edytuj" }).first().click();

    // Update user details
    await page.getByLabel("Imię i nazwisko").fill("Zaktualizowany Użytkownik");

    // Submit the form
    await page.getByRole("button", { name: "Zapisz" }).click();

    // Verify success message
    await expect(page.getByText("Użytkownik zaktualizowany.")).toBeVisible();

    // Verify updated name appears
    await expect(page.getByText("Zaktualizowany Użytkownik")).toBeVisible();
  });

  test("admin cannot delete user with active tickets", async ({ page }) => {
    await page.goto("/app/admin/users");

    // Find a user with active tickets (if any exist)
    const userWithActiveTickets = page.locator('[data-testid="user-row"]').filter({
      hasText: "aktywnych"
    });

    if (await userWithActiveTickets.count() > 0) {
      // Click delete button
      await userWithActiveTickets.getByRole("button", { name: "Usuń" }).click();

      // Confirm deletion
      page.on('dialog', dialog => dialog.accept());

      // Verify error message
      await expect(page.getByText(/nie można usunąć/i)).toBeVisible();
    }
  });

  test("admin can delete user without active tickets", async ({ page }) => {
    // First create a test user
    await page.goto("/app/admin/users");

    // Click "Dodaj użytkownika" button
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Fill in the form for a user that can be deleted
    await page.getByLabel("Email").fill("deletetest@example.com");
    await page.getByLabel("Imię i nazwisko").fill("Użytkownik do Usunięcia");
    await page.getByLabel("Hasło").fill("password123");
    await page.getByRole("combobox", { name: /rola/i }).selectOption("REQUESTER");

    // Submit the form
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Verify user was created
    await expect(page.getByText("Użytkownik dodany.")).toBeVisible();

    // Now delete the user
    await page.getByText("Użytkownik do Usunięcia").locator("..").getByRole("button", { name: "Usuń" }).click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());

    // Verify success message
    await expect(page.getByText("Użytkownik usunięty.")).toBeVisible();

    // Verify user is no longer in the list
    await expect(page.getByText("Użytkownik do Usunięcia")).not.toBeVisible();
  });

  test("form validation works", async ({ page }) => {
    await page.goto("/app/admin/users");

    // Click "Dodaj użytkownika" button
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Try to submit empty form
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Verify validation errors
    await expect(page.getByText("Wszystkie pola są wymagane.")).toBeVisible();

    // Try with invalid password
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Imię i nazwisko").fill("Test User");
    await page.getByLabel("Hasło").fill("123"); // Too short
    await page.getByRole("button", { name: "Dodaj użytkownika" }).click();

    // Verify password validation
    await expect(page.getByText("Hasło musi mieć przynajmniej 8 znaków.")).toBeVisible();
  });
});
