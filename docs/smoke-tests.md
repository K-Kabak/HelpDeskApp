# Smoke Tests

This document provides step-by-step instructions for performing smoke tests after deployment to verify that critical functionality is working correctly. Smoke tests are quick, high-level tests that check the most important user flows.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Test 1: Application Health Check](#test-1-application-health-check)
- [Test 2: Login Functionality](#test-2-login-functionality)
- [Test 3: Ticket Creation](#test-3-ticket-creation)
- [Test 4: Ticket Viewing](#test-4-ticket-viewing)
- [Test 5: Comment Creation](#test-5-comment-creation)
- [Test 6: Basic Admin Functions](#test-6-basic-admin-functions)
- [Troubleshooting](#troubleshooting)
- [Quick Reference](#quick-reference)

---

## Overview

Smoke tests are performed immediately after deployment to verify that:
- The application is running and accessible
- Critical user flows work end-to-end
- Database connectivity is working
- Authentication is functioning
- Core features are operational

**Time Required**: 10-15 minutes

**When to Run**: After every production deployment, before announcing deployment completion

---

## Prerequisites

### Required Information

- Application URL (e.g., `https://helpdesk.yourdomain.com`)
- Demo credentials:
  - **Admin**: `admin@serwisdesk.local` / `Admin123!`
  - **Agent**: `agent@serwisdesk.local` / `Agent123!`
  - **Requester**: `requester@serwisdesk.local` / `Requester123!`

**⚠️ Security Note**: These are demo credentials for testing. Change them in production!

### Tools

- Web browser (Chrome, Firefox, Edge, or Safari)
- Command-line tool (curl, PowerShell, or terminal) for API health checks
- Access to application logs (optional, for troubleshooting)

---

## Test 1: Application Health Check

### Purpose

Verify that the application is running and all required services are accessible.

### Steps

1. **Check Health Endpoint via API**:
   ```bash
   # Using curl
   curl https://your-domain.com/api/health
   
   # Using PowerShell
   Invoke-RestMethod -Uri "https://your-domain.com/api/health" -Method Get
   ```

2. **Verify Response**:
   - Status code: `200 OK`
   - Response body contains:
     ```json
     {
       "database": true,
       "redis": true,  // if Redis is configured
       "minio": true,  // if MinIO is configured
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
     ```

3. **Check Application in Browser**:
   - Navigate to: `https://your-domain.com`
   - Should redirect to login page or show application (if already logged in)

### Expected Results

- ✅ Health endpoint returns `200 OK`
- ✅ `database: true` in response
- ✅ Application loads in browser
- ✅ No error pages or 500 errors

### Troubleshooting

**Health endpoint returns 503**:
- Check database connectivity
- Verify `DATABASE_URL` environment variable
- Check database server is running
- Review application logs

**Health endpoint returns 404**:
- Verify application is deployed correctly
- Check routing configuration
- Verify API routes are accessible

**Application doesn't load**:
- Check application is running
- Verify DNS configuration
- Check SSL certificate is valid
- Review application logs

---

## Test 2: Login Functionality

### Purpose

Verify that authentication is working correctly for all user roles.

### Steps

1. **Navigate to Login Page**:
   - Go to: `https://your-domain.com/login`
   - Should see login form with email and password fields

2. **Login as Admin**:
   - Email: `admin@serwisdesk.local`
   - Password: `Admin123!`
   - Click "Zaloguj" (Login) button
   - Should redirect to `/app` dashboard

3. **Verify Admin Session**:
   - Should see dashboard with ticket list
   - Should see admin navigation/links (if applicable)
   - User name/email should be visible in top bar

4. **Logout and Login as Agent**:
   - Click logout button
   - Login with: `agent@serwisdesk.local` / `Agent123!`
   - Should redirect to dashboard
   - Should see agent-appropriate view

5. **Logout and Login as Requester**:
   - Click logout button
   - Login with: `requester@serwisdesk.local` / `Requester123!`
   - Should redirect to dashboard
   - Should see only own tickets

### Expected Results

- ✅ Login page loads correctly
- ✅ All three user roles can login successfully
- ✅ Users are redirected to dashboard after login
- ✅ User role is reflected in UI (admin sees admin features, requester sees only own tickets)
- ✅ Logout works correctly

### Troubleshooting

**Login fails with "Invalid credentials"**:
- Verify demo users exist in database
- Check password hashes are correct (run seed script if needed)
- Verify `NEXTAUTH_SECRET` is set correctly
- Check application logs for authentication errors

**Login redirects back to login page**:
- Check session cookies are being set
- Verify `NEXTAUTH_URL` matches actual domain
- Check browser console for errors
- Verify HTTPS is working (required for secure cookies)

**User sees wrong permissions**:
- Verify user roles in database
- Check organization assignment
- Review authorization logic

---

## Test 3: Ticket Creation

### Purpose

Verify that users can create new tickets with proper validation and data persistence.

### Steps

1. **Login as Requester**:
   - Login with: `requester@serwisdesk.local` / `Requester123!`

2. **Navigate to Ticket Creation**:
   - Click "Nowe zgłoszenie" (New Ticket) or similar button
   - Or navigate to ticket creation form

3. **Fill Out Ticket Form**:
   - **Title**: "Test Ticket - Smoke Test"
   - **Description**: "This is a smoke test ticket created after deployment."
   - **Priority**: Select "Średni" (Medium)
   - **Category**: Select any available category (if applicable)
   - Add any other required fields

4. **Submit Ticket**:
   - Click "Utwórz" (Create) or "Zapisz" (Save) button
   - Should see success message or redirect to ticket detail page

5. **Verify Ticket Created**:
   - Ticket should appear in ticket list
   - Ticket should have correct status (typically "NOWE" - New)
   - Ticket should have correct priority
   - Ticket should be assigned to requester

6. **View Ticket Detail**:
   - Click on the created ticket
   - Should see ticket details page
   - Title and description should match what was entered
   - Markdown should render correctly (if description contains markdown)

### Expected Results

- ✅ Ticket creation form loads
- ✅ Form validation works (required fields, length limits)
- ✅ Ticket is created successfully
- ✅ Ticket appears in ticket list
- ✅ Ticket detail page shows correct information
- ✅ Ticket is scoped to requester's organization

### Troubleshooting

**Form doesn't submit**:
- Check browser console for JavaScript errors
- Verify API endpoint is accessible
- Check network tab for failed requests
- Review application logs

**Ticket not appearing in list**:
- Verify database write succeeded
- Check organization scoping
- Refresh page
- Check ticket list filters

**Validation errors**:
- Verify field requirements match documentation
- Check input length limits
- Review validation error messages

---

## Test 4: Ticket Viewing

### Purpose

Verify that ticket lists and detail views work correctly with proper filtering and organization scoping.

### Steps

1. **Login as Agent**:
   - Login with: `agent@serwisdesk.local` / `Agent123!`

2. **View Ticket List**:
   - Should see dashboard with ticket list
   - Should see tickets from agent's organization
   - Should see more tickets than requester (org-wide view)

3. **Test Filters**:
   - Filter by status: Select "NOWE" (New) from status filter
   - Should see only new tickets
   - Filter by priority: Select "Wysoki" (High) from priority filter
   - Should see only high priority tickets
   - Clear filters: Should see all tickets again

4. **Test Search** (if available):
   - Enter search term in search box
   - Should filter tickets by search term
   - Clear search: Should show all tickets

5. **View Ticket Detail**:
   - Click on any ticket
   - Should see ticket detail page with:
     - Ticket title and description
     - Status and priority
     - Requester information
     - Assignee information (if assigned)
     - Comments (if any)
     - Audit timeline (if visible)

6. **Test Saved Views** (if available):
   - Apply some filters
   - Save as view
   - Load saved view
   - Should apply saved filters

### Expected Results

- ✅ Ticket list loads with organization-scoped tickets
- ✅ Filters work correctly (status, priority)
- ✅ Search works (if implemented)
- ✅ Ticket detail page loads correctly
- ✅ All ticket information is displayed
- ✅ Organization scoping is enforced (agent sees org tickets, requester sees own)

### Troubleshooting

**Ticket list is empty**:
- Verify tickets exist in database
- Check organization scoping
- Verify user's organization assignment
- Check database connectivity

**Filters don't work**:
- Check browser console for errors
- Verify API endpoints are working
- Check filter parameters in network requests
- Review application logs

**Wrong tickets visible**:
- Verify organization scoping logic
- Check user's organization assignment
- Review authorization code

---

## Test 5: Comment Creation

### Purpose

Verify that users can add comments to tickets with proper permissions and visibility controls.

### Steps

1. **Login as Agent**:
   - Login with: `agent@serwisdesk.local` / `Agent123!`

2. **Open a Ticket**:
   - Navigate to ticket list
   - Click on any ticket (or use ticket created in Test 3)

3. **Add Public Comment**:
   - Scroll to comment section
   - Enter comment: "This is a public comment from smoke test."
   - Ensure "Internal" checkbox is **unchecked** (if present)
   - Click "Dodaj komentarz" (Add Comment) or submit button
   - Should see comment appear in comment timeline

4. **Verify Public Comment**:
   - Comment should be visible in timeline
   - Comment should show author name
   - Comment should show timestamp
   - Markdown should render (if comment contains markdown)

5. **Add Internal Comment** (Agent/Admin only):
   - Enter comment: "This is an internal comment - not visible to requester."
   - Check "Internal" checkbox (if present)
   - Submit comment
   - Should see comment appear with "Internal" indicator

6. **Login as Requester and Verify**:
   - Logout and login as: `requester@serwisdesk.local` / `Requester123!`
   - Open the same ticket
   - Should see public comment
   - Should **NOT** see internal comment (if ticket belongs to requester)

### Expected Results

- ✅ Comment form is accessible
- ✅ Public comments can be created
- ✅ Internal comments can be created (by agents/admins)
- ✅ Comments appear in timeline
- ✅ Internal comments are hidden from requesters
- ✅ Comment permissions are enforced (requester cannot create internal comments)

### Troubleshooting

**Comment doesn't submit**:
- Check browser console for errors
- Verify API endpoint is accessible
- Check rate limiting (may be blocking rapid comments)
- Review application logs

**Comment not appearing**:
- Verify database write succeeded
- Refresh page
- Check comment visibility logic
- Review application logs

**Internal comment visible to requester**:
- Verify comment visibility filtering
- Check server-side filtering (not just client-side)
- Review authorization code

**Permission errors**:
- Verify user role and permissions
- Check organization scoping
- Review authorization logic

---

## Test 6: Basic Admin Functions

### Purpose

Verify that admin users can access and use admin features.

### Steps

1. **Login as Admin**:
   - Login with: `admin@serwisdesk.local` / `Admin123!`

2. **Access Admin Panel**:
   - Navigate to admin section (typically `/app/admin` or via admin menu)
   - Should see admin navigation/links

3. **Test User Management** (if available):
   - Navigate to Users page (`/app/admin/users`)
   - Should see list of users in organization
   - Verify user list loads correctly
   - Check user details are displayed

4. **Test Team Management** (if available):
   - Navigate to Teams page (`/app/admin/teams`)
   - Should see list of teams
   - Verify team list loads correctly

5. **Test SLA Management** (if available):
   - Navigate to SLA Policies page (`/app/admin/sla`)
   - Should see SLA policies
   - Verify policies are displayed correctly

6. **Test Automation Rules** (if available):
   - Navigate to Automation Rules page (`/app/admin/automation`)
   - Should see automation rules
   - Verify rules are displayed correctly

7. **Verify Non-Admin Access**:
   - Logout and login as agent: `agent@serwisdesk.local` / `Agent123!`
   - Try to access admin pages directly (e.g., `/app/admin/users`)
   - Should be redirected or see "Forbidden" message
   - Non-admin users should not see admin navigation

### Expected Results

- ✅ Admin can access admin panel
- ✅ Admin pages load correctly
- ✅ User management works (if implemented)
- ✅ Team management works (if implemented)
- ✅ SLA management works (if implemented)
- ✅ Automation rules work (if implemented)
- ✅ Non-admin users are blocked from admin pages
- ✅ Organization scoping is enforced (admin sees only own org data)

### Troubleshooting

**Admin panel not accessible**:
- Verify user role is "ADMIN" in database
- Check authorization logic
- Verify admin routes are configured
- Review application logs

**Admin pages return 403**:
- Check user role and organization
- Verify authorization middleware
- Review application logs

**Data not loading**:
- Check database connectivity
- Verify organization scoping
- Review application logs
- Check API endpoints

---

## Troubleshooting

### Common Issues

#### Application Not Responding

**Symptoms**: Health check fails, pages don't load, timeouts

**Possible Causes**:
- Application not running
- Database connectivity issues
- Network/firewall problems
- Resource exhaustion (memory, CPU)

**Solutions**:
1. Check application status: `pm2 list` or `docker ps`
2. Check application logs: `pm2 logs` or `docker logs`
3. Verify database connectivity: `psql $DATABASE_URL`
4. Check system resources: `top` or `htop`
5. Restart application if needed

#### Database Connection Errors

**Symptoms**: Health check shows `database: false`, 503 errors

**Possible Causes**:
- Database server down
- Incorrect `DATABASE_URL`
- Network issues
- Database credentials expired

**Solutions**:
1. Verify database server is running
2. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`
3. Check `DATABASE_URL` format and credentials
4. Verify network connectivity to database
5. Check firewall rules

#### Authentication Failures

**Symptoms**: Cannot login, "Invalid credentials" errors

**Possible Causes**:
- Demo users not seeded
- Incorrect `NEXTAUTH_SECRET`
- Session cookie issues
- Database user data missing

**Solutions**:
1. Run seed script: `pnpm prisma:seed`
2. Verify `NEXTAUTH_SECRET` is set correctly
3. Check user exists in database: `SELECT * FROM "User" WHERE email = 'admin@serwisdesk.local';`
4. Clear browser cookies and try again
5. Check application logs for authentication errors

#### API Endpoint Errors

**Symptoms**: 404, 500, or other API errors

**Possible Causes**:
- API routes not deployed
- Missing environment variables
- Database errors
- Validation failures

**Solutions**:
1. Verify API routes exist: Check `src/app/api/` directory
2. Check environment variables are set
3. Review application logs for specific errors
4. Test API endpoints directly: `curl https://your-domain.com/api/tickets`
5. Check database migrations are applied

### Getting Help

If issues persist:

1. **Collect Diagnostic Information**:
   ```bash
   # Run verification script
   .\scripts\verify-deployment.ps1 -OutputFormat "json" > diagnostics.json
   
   # Collect logs
   pm2 logs --lines 500 > app-logs.txt
   ```

2. **Review Documentation**:
   - [Deployment Guide](./deployment.md)
   - [Troubleshooting Guide](./deployment.md#troubleshooting)
   - [Runbooks](./runbooks.md)

3. **Check Known Issues**:
   - Review `docs/known-issues.md`
   - Check GitHub issues

4. **Escalate**:
   - Contact DevOps team
   - Create detailed issue report with diagnostics

---

## Quick Reference

### Health Check Command

```bash
# Using curl
curl https://your-domain.com/api/health

# Using PowerShell
Invoke-RestMethod -Uri "https://your-domain.com/api/health" -Method Get
```

### Demo Credentials

- **Admin**: `admin@serwisdesk.local` / `Admin123!`
- **Agent**: `agent@serwisdesk.local` / `Agent123!`
- **Requester**: `requester@serwisdesk.local` / `Requester123!`

### Test Checklist

- [ ] Health check passes
- [ ] Login works for all roles
- [ ] Ticket creation works
- [ ] Ticket viewing works
- [ ] Comment creation works
- [ ] Admin functions work
- [ ] No errors in logs

### Expected Health Check Response

```json
{
  "database": true,
  "redis": true,
  "minio": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Related Documentation

- [Production Readiness Checklist](./production-readiness-checklist.md)
- [Deployment Guide](./deployment.md)
- [Testing Guide](./testing.md)
- [User Guide](./user-guide.md)

---

## Notes

- Smoke tests should be performed after every production deployment
- Document any failures and their resolution
- Update this document if new critical features are added
- Keep demo credentials secure and rotate them regularly in production






