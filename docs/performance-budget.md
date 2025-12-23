# Performance Budget

This document outlines the performance targets for the HelpDeskApp database and API, along with measured results and monitoring approach.

## Database Query Targets

| Query Type | Target Latency (P95) | Measured P50 | Measured P95 | Measured P99 | Status |
|------------|----------------------|--------------|--------------|--------------|--------|
| Ticket List (20 items) | < 200ms | 5.97ms | 14.96ms | 14.96ms | ✅ PASS |
| Ticket List with Status Filter | < 200ms | 5.08ms | 5.93ms | 5.93ms | ✅ PASS |
| Ticket Search | < 100ms | 5.63ms | 11.74ms | 11.74ms | ✅ PASS |
| Ticket Detail (inc. comments/audit) | < 100ms | 6.25ms | 19.70ms | 19.70ms | ✅ PASS |
| Admin Audit Logs (20 items) | < 200ms | 1.26ms | 4.11ms | 4.11ms | ✅ PASS |

**Measurement Date**: 2025-12-23  
**Test Environment**: Local database with 1,000+ tickets  
**Iterations**: 10 per query type

## API Response Targets

| Endpoint | Target Latency (P95) | Notes |
|----------|----------------------|-------|
| GET /api/tickets | < 200ms | Includes ticket list query + serialization |
| POST /api/tickets | < 300ms | Includes validation + SLA calculation + notifications |
| POST /api/tickets/[id]/comments | < 200ms | Includes validation + audit logging |
| GET /api/tickets/[id]/audit | < 200ms | Includes audit event query + actor lookup |

## Performance Monitoring

### Query Timing

Database query performance is automatically logged when:
- `NODE_ENV=development` (always enabled in dev)
- `LOG_QUERY_TIME=true` (can be enabled in production)

Query timing is implemented via Prisma extension in `src/lib/prisma.ts`:
- Logs all database operations with execution time
- Format: `[Prisma Query] Model.operation took X.XXms`
- Uses `performance.now()` for high-precision timing

### Monitoring Approach

1. **Development**: Query timing is always enabled for debugging
2. **Production**: Enable with `LOG_QUERY_TIME=true` for performance analysis
3. **Metrics Collection**: Query logs can be collected and analyzed for:
   - Slow query detection (queries > 100ms)
   - Performance regression detection
   - Index usage verification

### Performance Budget Enforcement

- **Alert Threshold**: Queries exceeding 2x target latency
- **Critical Threshold**: Queries exceeding 5x target latency
- **Monitoring**: Review query logs weekly in production
- **Action**: Investigate and optimize queries exceeding thresholds

## Index Usage Verification

All critical query patterns are covered by indexes:

- ✅ **Ticket List**: `Ticket_organizationId_createdAt_idx` (DESC)
- ✅ **Ticket by Requester**: `Ticket_requesterId_createdAt_idx` (DESC)
- ✅ **Ticket by Status**: `Ticket_status_createdAt_idx` (DESC)
- ✅ **Ticket by Priority**: `Ticket_priority_createdAt_idx` (DESC)
- ✅ **Ticket Search**: `Ticket_search_idx` (organizationId, title, descriptionMd, category)
- ✅ **Comments**: `Comment_ticketId_createdAt_idx`
- ✅ **Attachments**: `Attachment_ticketId_idx`
- ✅ **Audit Events**: `AuditEvent_ticketId_createdAt_idx`
- ✅ **Admin Audit**: `AdminAudit_organizationId_createdAt_idx` (DESC)

## Optimization History

### 2025-12-23: Initial Database Indexing
- **Branch**: `feature/performance-optimization-02`
- **Changes**: 
    - Added compound indexes for Ticket (organizationId/createdAt, requesterId/createdAt, status, priority).
    - Added foreign key indexes for Comment, Attachment, and AuditEvent.
    - Fixed type discrepancy in SlaEscalationLevel (priority column).
- **Results**:
    - Search performance improved from 23ms to 7ms (~70% reduction).
    - Filtered list performance improved by ~15%.

### 2025-12-23: Performance Measurement & Monitoring
- **Branch**: `feature/task-9-performance-completion`
- **Changes**:
    - Added comprehensive performance measurement script
    - Enhanced performance budget documentation with actual measurements
    - Documented monitoring approach and query timing
    - Verified all performance targets are met
- **Results**:
    - All query types meet or exceed performance targets
    - P95 latencies well below targets (14.96ms vs 200ms target for ticket list)
    - Monitoring hooks in place for production performance tracking

