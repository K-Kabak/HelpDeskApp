# Prompty dla Agentów 1-6 - Następne Funkcje P1

**Status projektu:** ✅ Gotowe do kolejnego etapu - wszystkie błędy naprawione, PR zmergowany

---

## 📋 PRZYPISANIE AGENTÓW

**Agent 1:** Backend Developer - API, Worker, Services  
**Agent 2:** Frontend Developer - UI/UX, Components  
**Agent 3:** QA/Documentation - Tests, Docs, OpenAPI  
**Agent 4:** Backend Developer - Database, Migrations, Prisma  
**Agent 5:** Security/API - Authorization, Validation, Security  
**Agent 6:** Full-Stack - Mixed Backend/Frontend Features

---

## 🎯 PRIORYTET P1 - FUNKCJE DO IMPLEMENTACJI

### Zidentyfikowane funkcje P1 z backlogu:
1. **[093] Signed attachment download URLs** (P2 w backlogu, ale ważne)
2. **[096] SLA calibration tool** (P2 w backlogu, ale ważne)
3. **Attachment upload/download API + UI** (P0/P1 - core feature)
4. **Audit viewer UI for admins** (P1 - [063])
5. **Enhance search with tag/category filters** (P1 - [065])
6. **Reopen throttling (cooldown)** (P1 - [067])

---

## 🚀 PROMPT 1: Agent 1 (Backend) - Attachment Upload/Download API

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Attachment Upload/Download API

**Status:** Attachment model exists in Prisma schema, but no API endpoints or UI.

**YOUR MISSION:**
1. **Upload API:**
   - Create `src/app/api/tickets/[id]/attachments/route.ts` (POST)
   - Implement file upload handling (multipart/form-data)
   - Validate file size (max 10MB) and type (whitelist: pdf, doc, docx, jpg, png, txt)
   - Store file in MinIO (or local storage for dev)
   - Create Attachment record in database with metadata
   - Enforce organization scoping and role permissions
   - Add audit logging for uploads

2. **Download API:**
   - Create `src/app/api/tickets/[id]/attachments/[attachmentId]/route.ts` (GET)
   - Generate signed/download URLs (time-bound, 1 hour expiry)
   - Enforce visibility rules (internal attachments hidden from requesters)
   - Add audit logging for downloads
   - Return file with proper Content-Type headers

3. **Delete API:**
   - Add DELETE method to attachment route
   - Only allow delete for agents/admins
   - Soft delete or hard delete based on requirements
   - Add audit logging

**Files to create/modify:**
- `src/app/api/tickets/[id]/attachments/route.ts` - POST (upload)
- `src/app/api/tickets/[id]/attachments/[attachmentId]/route.ts` - GET (download), DELETE
- `src/lib/storage.ts` - Storage abstraction (MinIO/local)
- Update `docs/openapi.yaml` with attachment endpoints

**ACCEPTANCE CRITERIA:**
- ✅ POST /api/tickets/[id]/attachments uploads files successfully
- ✅ GET /api/tickets/[id]/attachments/[attachmentId] returns file with proper headers
- ✅ Internal attachments are hidden from requesters
- ✅ File size and type validation enforced
- ✅ Audit logging for uploads/downloads
- ✅ Organization scoping enforced
- ✅ Signed URLs expire after 1 hour

**HOW TO START:**
1. Read `prisma/schema.prisma` - check Attachment model
2. Check existing storage setup (MinIO config)
3. Review `src/lib/authorization.ts` for org scoping patterns
4. Implement upload endpoint first
5. Implement download endpoint with signed URLs
6. Add tests at the end

**SIMPLIFIED WORKFLOW:**
- Focus on implementation first
- Test locally with real files
- Write tests at the end
- Commit after completing all attachment APIs

**WHEN READY TO COMMIT:**
- After all APIs work and tests pass
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: implement attachment upload/download API"`
- Push and create PR
```

---

## 🚀 PROMPT 2: Agent 2 (Frontend) - Attachment UI Components

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Attachment UI Components

**Status:** Attachment APIs will be implemented by Agent 1. You need to create UI.

**YOUR MISSION:**
1. **Attachment Picker Component:**
   - Enhance existing `src/app/app/tickets/[id]/attachment-picker.tsx`
   - Add file upload with drag-and-drop
   - Show upload progress
   - Display uploaded files with download links
   - Show visibility indicator (public/internal)
   - Allow delete for agents/admins

2. **File Upload Form:**
   - Add file input with validation
   - Show file preview (for images)
   - Display file size and type
   - Toggle for internal/public visibility
   - Error handling and user feedback

3. **Attachment List:**
   - Display attachments in ticket detail page
   - Show file name, size, upload date, uploader
   - Download button with proper permissions
   - Hide internal attachments from requesters
   - Loading states and error handling

**Files to create/modify:**
- `src/app/app/tickets/[id]/attachment-picker.tsx` - enhance existing
- `src/app/app/tickets/[id]/attachment-upload-form.tsx` - new component
- `src/app/app/tickets/[id]/attachment-list.tsx` - new component
- Update `src/app/app/tickets/[id]/page.tsx` to use new components

**ACCEPTANCE CRITERIA:**
- ✅ Users can upload files via drag-and-drop or file picker
- ✅ Upload progress is shown
- ✅ Files are displayed with metadata
- ✅ Download works with signed URLs
- ✅ Internal attachments hidden from requesters
- ✅ Delete works for agents/admins
- ✅ Error handling and user feedback

**HOW TO START:**
1. Wait for Agent 1 to complete APIs (or check if they exist)
2. Review existing `attachment-picker.tsx`
3. Implement upload form with file validation
4. Implement attachment list with download
5. Test with real files
6. Add error handling

**SIMPLIFIED WORKFLOW:**
- Work on all attachment UI together
- Test in browser with real uploads
- Commit after completing all UI components

**WHEN READY TO COMMIT:**
- After all UI components work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Test in browser
- Commit: `git commit -m "feat: implement attachment upload/download UI"`
- Push and create PR
```

---

## 🚀 PROMPT 3: Agent 3 (QA/Documentation) - Tests & Docs for Attachments

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Tests & Documentation for Attachments

**Status:** Attachment APIs and UI will be implemented by Agents 1 and 2.

**YOUR MISSION:**
1. **Integration Tests:**
   - Create `tests/attachment-upload.test.ts`
   - Test upload with valid/invalid files
   - Test file size and type validation
   - Test organization scoping
   - Test visibility rules (internal vs public)
   - Test download with signed URLs
   - Test URL expiry

2. **E2E Tests:**
   - Create `e2e/attachments.spec.ts`
   - Test full flow: upload → view → download → delete
   - Test visibility rules in UI
   - Test error handling

3. **Documentation:**
   - Update `docs/openapi.yaml` with attachment endpoints
   - Update `README.md` with attachment feature description
   - Update `docs/current-state.md`
   - Mark [027], [028], [049] as complete in backlog

**Files to create/modify:**
- `tests/attachment-upload.test.ts` - new
- `tests/attachment-download.test.ts` - new (or enhance existing)
- `e2e/attachments.spec.ts` - new
- `docs/openapi.yaml` - update
- `docs/github-backlog.md` - mark complete

**ACCEPTANCE CRITERIA:**
- ✅ Upload tests cover all scenarios
- ✅ Download tests verify signed URLs and expiry
- ✅ E2E tests cover full user flow
- ✅ OpenAPI spec updated
- ✅ Documentation reflects implementation

**HOW TO START:**
1. Wait for Agents 1 and 2 to complete implementation
2. Review implemented APIs and UI
3. Write integration tests first
4. Write E2E tests
5. Update documentation
6. Run all tests: `pnpm test && pnpm test:e2e`

**SIMPLIFIED WORKFLOW:**
- Write tests after implementation is complete
- Focus on critical paths first
- Update docs at the end
- Commit after completing all tests and docs

**WHEN READY TO COMMIT:**
- After all tests pass and docs updated
- Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
- Commit: `git commit -m "test: add attachment tests and update documentation"`
- Push and create PR
```

---

## 🚀 PROMPT 4: Agent 4 (Backend/Database) - Audit Viewer Backend

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Audit Viewer Backend API

**Status:** Audit events are written but not exposed via API. Need query endpoint.

**YOUR MISSION:**
1. **Audit Query API:**
   - Create `src/app/api/admin/audit-events/route.ts` (GET)
   - Support filtering by:
     - Actor (userId)
     - Date range (from/to)
     - Action type (TICKET_CREATED, TICKET_UPDATED, etc.)
     - Entity type (TICKET, USER, etc.)
   - Cursor-based pagination
   - Organization scoping (admin only, org-scoped)
   - Return audit events with actor information

2. **Ticket Audit Timeline API:**
   - Enhance `src/app/api/tickets/[id]/audit/route.ts` (if exists)
   - Or create if doesn't exist
   - Return audit events for specific ticket
   - Include actor information
   - Support pagination

3. **Admin Audit API:**
   - Check `src/app/api/admin/audit-events/route.ts` (if exists)
   - Enhance with filtering and pagination
   - Support AdminAudit table queries

**Files to create/modify:**
- `src/app/api/admin/audit-events/route.ts` - GET with filters
- `src/app/api/tickets/[id]/audit/route.ts` - enhance or create
- Update `docs/openapi.yaml` with audit endpoints

**ACCEPTANCE CRITERIA:**
- ✅ GET /api/admin/audit-events returns paginated audit events
- ✅ Filtering by actor, date, action, entity works
- ✅ Organization scoping enforced
- ✅ Admin-only access
- ✅ Cursor pagination works
- ✅ Ticket audit timeline returns events for ticket

**HOW TO START:**
1. Check existing audit endpoints
2. Review `prisma/schema.prisma` - AuditEvent and AdminAudit models
3. Review existing pagination patterns in `src/lib/ticket-list.ts`
4. Implement query endpoint with filters
5. Add tests at the end

**SIMPLIFIED WORKFLOW:**
- Implement all audit endpoints together
- Test with different filters
- Write tests at the end
- Commit after completing all endpoints

**WHEN READY TO COMMIT:**
- After all endpoints work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Commit: `git commit -m "feat: implement audit viewer backend API"`
- Push and create PR
```

---

## 🚀 PROMPT 5: Agent 5 (Security/API) - Reopen Throttling & Security

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Implement Reopen Throttling & Security Enhancements

**Status:** Reopen reason capture exists, but no throttling to prevent abuse.

**YOUR MISSION:**
1. **Reopen Throttling:**
   - Add cooldown logic to `src/app/api/tickets/[id]/route.ts`
   - Prevent reopening within X minutes (e.g., 5 minutes) of last reopen
   - Store last reopen timestamp
   - Return clear error message when throttled
   - Different cooldown for different priorities (optional)

2. **Organization Scoping Fix:**
   - Verify `src/app/api/tickets/[id]/comments/route.ts` enforces org scoping
   - Add organization check if missing
   - Ensure ticket.organizationId === session.user.organizationId

3. **Security Enhancements:**
   - Review rate limiting on critical endpoints
   - Ensure all API endpoints use `requireAuth`
   - Verify input validation on all endpoints
   - Check for SQL injection risks (Prisma should protect, but verify)

**Files to create/modify:**
- `src/app/api/tickets/[id]/route.ts` - add reopen throttling
- `src/app/api/tickets/[id]/comments/route.ts` - verify org scoping
- `src/lib/rate-limit.ts` - review and enhance if needed

**ACCEPTANCE CRITERIA:**
- ✅ Reopen throttling prevents abuse (5 min cooldown)
- ✅ Clear error messages when throttled
- ✅ Comments API enforces organization scoping
- ✅ All endpoints use proper authorization
- ✅ Input validation on all endpoints

**HOW TO START:**
1. Review existing reopen logic in ticket route
2. Check `tests/reopen-throttling.test.ts` for existing tests
3. Implement throttling logic
4. Verify org scoping in comments API
5. Review security of all endpoints
6. Add/update tests

**SIMPLIFIED WORKFLOW:**
- Implement throttling first
- Then verify security
- Write tests at the end
- Commit after completing all security enhancements

**WHEN READY TO COMMIT:**
- After throttling and security fixes work
- Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
- Commit: `git commit -m "feat: add reopen throttling and security enhancements"`
- Push and create PR
```

---

## 🚀 PROMPT 6: Agent 6 (Full-Stack) - Search Filters & Audit Viewer UI

**SKOPIUJ CAŁOŚĆ:**

```
[Wklej najpierw zawartość całego pliku .cursor/plans/master-agent-prompt.md]

---

## TASK: Enhance Search Filters & Implement Audit Viewer UI

**Status:** Search exists but lacks tag/category filters. Audit viewer UI missing.

**YOUR MISSION:**
1. **Enhanced Search Filters:**
   - Enhance `src/app/app/page.tsx` search functionality
   - Add tag filter dropdown (multi-select)
   - Add category filter dropdown
   - Update `src/lib/ticket-list.ts` to support tag/category filters
   - Update API endpoint `/api/tickets` to accept tag/category params
   - Display active filters in UI
   - Clear filters functionality

2. **Audit Viewer UI:**
   - Create `src/app/app/admin/audit/page.tsx` (if doesn't exist)
   - Enhance `src/app/app/admin/audit/audit-viewer.tsx`
   - Add filters: actor, date range, action type, entity type
   - Display paginated audit events
   - Show actor information, timestamp, action, entity details
   - Link to related entities (ticket, user, etc.)

**Files to create/modify:**
- `src/app/app/page.tsx` - add tag/category filters
- `src/lib/ticket-list.ts` - support tag/category filters
- `src/app/api/tickets/route.ts` - accept tag/category params
- `src/app/app/admin/audit/page.tsx` - enhance or create
- `src/app/app/admin/audit/audit-viewer.tsx` - enhance

**ACCEPTANCE CRITERIA:**
- ✅ Tag filter works in ticket list
- ✅ Category filter works in ticket list
- ✅ Filters are applied to API query
- ✅ Active filters displayed in UI
- ✅ Audit viewer shows paginated events
- ✅ Audit filters work (actor, date, action, entity)
- ✅ Links to related entities work

**HOW TO START:**
1. Review existing search in `src/app/app/page.tsx`
2. Check `src/lib/ticket-list.ts` for filter support
3. Implement tag/category filters
4. Review existing audit viewer (if exists)
5. Enhance audit viewer with filters
6. Test in browser

**SIMPLIFIED WORKFLOW:**
- Work on search filters first
- Then audit viewer UI
- Test in browser
- Commit after completing both features

**WHEN READY TO COMMIT:**
- After both features work
- Run: `pnpm lint && pnpm exec tsc --noEmit`
- Test in browser
- Commit: `git commit -m "feat: enhance search filters and implement audit viewer UI"`
- Push and create PR
```

---

## 📊 REKOMENDACJA URUCHOMIENIA

### Kolejność wykonania:

**Faza 1: Attachments (Agents 1, 2, 3)**
1. **Agent 1** - Attachment APIs (backend)
2. **Agent 2** - Attachment UI (frontend) - może równolegle z Agent 1
3. **Agent 3** - Tests & Docs (może równolegle z Agent 1 i 2)

**Faza 2: Audit & Security (Agents 4, 5, 6)**
4. **Agent 4** - Audit Viewer Backend
5. **Agent 5** - Reopen Throttling & Security
6. **Agent 6** - Search Filters & Audit Viewer UI - może równolegle z Agent 4

### Można uruchomić równolegle:
- Agent 1 + Agent 2 (backend + frontend, różne pliki)
- Agent 4 + Agent 6 (backend + frontend, różne pliki)
- Agent 3 może pracować równolegle z wszystkimi (tests/docs)

---

## ✅ DEFINICJA GOTOWOŚCI

Każdy agent kończy gdy:
1. ✅ Implementacja działa lokalnie
2. ✅ `pnpm lint && pnpm exec tsc --noEmit` przechodzi
3. ✅ Testy przechodzą (jeśli Agent 3)
4. ✅ PR utworzony i gotowy do review

---

**Status:** Gotowe do uruchomienia agentów 🚀

