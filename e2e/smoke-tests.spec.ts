import { test, expect } from "@playwright/test";

/**
 * Smoke Tests - Critical Path Verification
 * 
 * These tests verify that all critical functionality is working correctly
 * after deployment. Based on docs/smoke-tests.md
 * 
 * Demo credentials:
 * - Admin: admin@serwisdesk.local / Admin123!
 * - Agent: agent@serwisdesk.local / Agent123!
 * - Requester: requester@serwisdesk.local / Requester123!
 */

// Helper function to login
async function login(page: any, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  // Use more flexible selectors for the login form
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /zaloguj|logowanie/i }).click();
  // Wait for redirect to /app after successful login
  await page.waitForURL(/\/app/, { timeout: 15000 });
}

// Helper function to logout
async function logout(page: any) {
  // Find and click logout button (text is "Wyloguj" in Topbar)
  const logoutButton = page.getByRole("button", { name: /wyloguj/i });
  if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  } else {
    // If logout button not found, try to navigate directly to signout
    await page.goto("/api/auth/signout");
    await page.waitForURL(/\/login/, { timeout: 5000 });
  }
}

test.describe("Smoke Tests - Critical Paths", () => {
  test("Test 1: Application Health Check", async ({ page, request }) => {
    // Wait a bit for server to be ready
    await page.waitForTimeout(2000);
    
    // Check health endpoint via API (retry if needed)
    let healthResponse;
    let retries = 3;
    while (retries > 0) {
      try {
        healthResponse = await request.get("/api/health");
        if (healthResponse.ok()) break;
      } catch (e) {
        // Ignore and retry
      }
      await page.waitForTimeout(1000);
      retries--;
    }
    
    expect(healthResponse?.ok()).toBeTruthy();
    
    if (healthResponse?.ok()) {
      const healthData = await healthResponse.json();
      expect(healthData).toHaveProperty("database");
      expect(healthData.database).toBe(true);
      expect(healthData).toHaveProperty("timestamp");
    }
    
    // Check application loads in browser
    await page.goto("/");
    // Should redirect to login or show application
    const url = page.url();
    expect(url).toMatch(/\/(login|app)/);
  });

  test("Test 2: Login Functionality - All Roles", async ({ page }) => {
    // Test Admin Login
    await login(page, "admin@serwisdesk.local", "Admin123!");
    expect(page.url()).toMatch(/\/app/);
    
    // Verify admin session - should see dashboard
    await expect(page.locator("body")).toContainText(/dashboard|zgłoszenia|tickets/i, { timeout: 5000 });
    
    // Logout
    await logout(page);
    
    // Test Agent Login
    await login(page, "agent@serwisdesk.local", "Agent123!");
    expect(page.url()).toMatch(/\/app/);
    await expect(page.locator("body")).toContainText(/dashboard|zgłoszenia|tickets/i, { timeout: 5000 });
    
    // Logout
    await logout(page);
    
    // Test Requester Login
    await login(page, "requester@serwisdesk.local", "Requester123!");
    expect(page.url()).toMatch(/\/app/);
    await expect(page.locator("body")).toContainText(/dashboard|zgłoszenia|tickets/i, { timeout: 5000 });
  });

  test("Test 3: Ticket Creation", async ({ page, request }) => {
    // Login as Requester
    await login(page, "requester@serwisdesk.local", "Requester123!");
    
    // Navigate to ticket creation (could be via button or direct URL)
    // Try to find "Nowe zgłoszenie" button or navigate to form
    const newTicketButton = page.getByRole("button", { name: /nowe zgłoszenie|new ticket/i });
    if (await newTicketButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await newTicketButton.click();
    } else {
      // Try direct navigation
      await page.goto("/app/tickets/new");
    }
    
    // Fill out ticket form
    await page.waitForURL(/\/app\/tickets\/new|\/app/, { timeout: 5000 });
    
    // Fill title
    const titleInput = page.getByLabel(/tytuł|title/i).or(page.locator('input[placeholder*="tytuł" i], input[placeholder*="title" i]'));
    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill("Test Ticket - Smoke Test");
    }
    
    // Fill description
    const descInput = page.getByLabel(/opis|description/i).or(page.locator('textarea[placeholder*="opis" i], textarea[placeholder*="description" i]'));
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill("This is a smoke test ticket created after deployment.");
    }
    
    // Select priority if available
    const prioritySelect = page.getByLabel(/priorytet|priority/i);
    if (await prioritySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prioritySelect.selectOption({ index: 1 }); // Select medium priority
    }
    
    // Submit ticket
    const submitButton = page.getByRole("button", { name: /utwórz|create|zapisz|save/i });
    await submitButton.click();
    
    // Wait for success or redirect to ticket detail
    await page.waitForURL(/\/app\/tickets\/\d+|\/app/, { timeout: 10000 });
    
    // Verify ticket appears in list or detail view
    // Check if we're on ticket detail page
    if (page.url().match(/\/app\/tickets\/\d+$/)) {
      await expect(page.locator("body")).toContainText("Test Ticket - Smoke Test", { timeout: 5000 });
    } else {
      // We're back at list, verify ticket appears
      await expect(page.locator("body")).toContainText("Test Ticket - Smoke Test", { timeout: 5000 });
    }
  });

  test("Test 4: Ticket Viewing and Filtering", async ({ page }) => {
    // Login as Agent
    await login(page, "agent@serwisdesk.local", "Agent123!");
    
    // Should see ticket list
    await page.waitForURL(/\/app/, { timeout: 5000 });
    await expect(page.locator("body")).toContainText(/zgłoszenia|tickets/i, { timeout: 5000 });
    
    // Test filters if available
    const statusFilter = page.getByLabel(/status|filter.*status/i).or(page.locator('select[name*="status" i]'));
    if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.selectOption({ index: 0 });
      // Wait for list to update
      await page.waitForTimeout(1000);
    }
    
    // Test priority filter if available
    const priorityFilter = page.getByLabel(/priority|priorytet/i).or(page.locator('select[name*="priority" i]'));
    if (await priorityFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await priorityFilter.selectOption({ index: 0 });
      await page.waitForTimeout(1000);
    }
    
    // Test search if available
    const searchInput = page.getByPlaceholder(/szukaj|search/i).or(page.locator('input[type="search" i]'));
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill("test");
      await page.waitForTimeout(1000);
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
    
    // Click on a ticket to view detail (if tickets exist)
    const ticketLink = page.locator('a[href*="/tickets/"]').first();
    if (await ticketLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ticketLink.click();
      await page.waitForURL(/\/app\/tickets\/\d+/, { timeout: 5000 });
      
      // Verify ticket detail page loads
      await expect(page.locator("body")).toBeVisible();
      
      // Should see ticket information
      // Basic check that page loaded
      expect(page.url()).toMatch(/\/app\/tickets\/\d+$/);
    }
  });

  test("Test 5: Comment Creation", async ({ page }) => {
    // Login as Agent
    await login(page, "agent@serwisdesk.local", "Agent123!");
    
    // Navigate to a ticket (create one if needed or use existing)
    // First try to find a ticket in the list
    let ticketId: string | null = null;
    
    const ticketLink = page.locator('a[href*="/tickets/"]').first();
    if (await ticketLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await ticketLink.getAttribute("href");
      ticketId = href?.match(/\/tickets\/(\d+)/)?.[1] || null;
      await ticketLink.click();
    } else {
      // No tickets, skip this test or create one
      test.skip();
      return;
    }
    
    await page.waitForURL(/\/app\/tickets\/\d+/, { timeout: 5000 });
    
    // Add public comment
    const commentInput = page.getByPlaceholder(/komentarz|comment/i).or(page.locator('textarea[placeholder*="komentarz" i], textarea[placeholder*="comment" i]'));
    if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentInput.fill("This is a public comment from smoke test.");
      
      // Check if there's an internal checkbox
      const internalCheckbox = page.getByLabel(/internal|wewnętrzny/i).or(page.locator('input[type="checkbox"][name*="internal" i]'));
      if (await internalCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Ensure it's unchecked for public comment
        if (await internalCheckbox.isChecked()) {
          await internalCheckbox.uncheck();
        }
      }
      
      // Submit comment
      const submitButton = page.getByRole("button", { name: /dodaj komentarz|add comment|wyślij|send/i });
      await submitButton.click();
      
      // Wait for comment to appear
      await expect(page.locator("body")).toContainText("This is a public comment from smoke test", { timeout: 5000 });
    }
    
    // Test internal comment (Agent/Admin only)
    const commentInput2 = page.getByPlaceholder(/komentarz|comment/i).or(page.locator('textarea[placeholder*="komentarz" i], textarea[placeholder*="comment" i]'));
    if (await commentInput2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentInput2.fill("This is an internal comment - not visible to requester.");
      
      const internalCheckbox = page.getByLabel(/internal|wewnętrzny/i).or(page.locator('input[type="checkbox"][name*="internal" i]'));
      if (await internalCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await internalCheckbox.check();
      }
      
      const submitButton = page.getByRole("button", { name: /dodaj komentarz|add comment|wyślij|send/i });
      await submitButton.click();
      
      // Wait for comment to appear
      await expect(page.locator("body")).toContainText("This is an internal comment", { timeout: 5000 });
    }
    
    // Now login as Requester and verify internal comment is hidden
    await logout(page);
    await login(page, "requester@serwisdesk.local", "Requester123!");
    
    // Navigate to the same ticket if we have the ID
    if (ticketId) {
      await page.goto(`/app/tickets/${ticketId}`);
      await page.waitForURL(/\/app\/tickets\/\d+/, { timeout: 5000 });
      
      // Should see public comment
      await expect(page.locator("body")).toContainText("This is a public comment from smoke test", { timeout: 5000 });
      
      // Should NOT see internal comment
      const bodyText = await page.locator("body").textContent();
      expect(bodyText).not.toContain("This is an internal comment - not visible to requester");
    }
  });

  test("Test 6: Basic Admin Functions", async ({ page }) => {
    // Login as Admin
    await login(page, "admin@serwisdesk.local", "Admin123!");
    
    // Try to access admin panel
    await page.goto("/app/admin");
    await page.waitForTimeout(2000);
    
    // Should see admin navigation or admin pages
    // Check if admin users page is accessible
    await page.goto("/app/admin/users");
    await page.waitForTimeout(2000);
    
    // Should load without error (403 or redirect would indicate failure)
    expect(page.url()).toMatch(/\/app\/admin/);
    
    // Verify non-admin access is blocked
    await logout(page);
    await login(page, "agent@serwisdesk.local", "Agent123!");
    
    // Try to access admin page as agent
    await page.goto("/app/admin/users");
    await page.waitForTimeout(2000);
    
    // Should be redirected or see forbidden message
    const url = page.url();
    const bodyText = await page.locator("body").textContent();
    
    // Either redirected away from admin or see forbidden message
    expect(
      url.includes("/app/admin") === false || 
      (bodyText?.toLowerCase().includes("forbidden") || bodyText?.toLowerCase().includes("brak dostępu"))
    ).toBeTruthy();
  });
});

