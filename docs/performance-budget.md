# Performance Budget

This document outlines the performance targets for the HelpDeskApp database and API.

## Database Query Targets

| Query Type | Target Latency (P95) | Current (1k tickets) |
|------------|----------------------|-----------------------|
| Ticket List (20 items) | < 50ms | ~6ms |
| Ticket Search | < 100ms | ~7ms |
| Ticket Detail (inc. comments/audit) | < 100ms | TBD |
| Admin Audit Logs | < 200ms | TBD |

## API Response Targets

| Endpoint | Target Latency |
|----------|----------------|
| GET /api/tickets | < 200ms |
| POST /api/tickets | < 300ms |
| POST /api/tickets/[id]/comments | < 200ms |

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

