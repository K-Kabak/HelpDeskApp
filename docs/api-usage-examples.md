# API Usage Examples

This document provides practical examples for using the HelpDesk API. All examples assume you have a valid authentication session cookie.

## Table of Contents

- [Authentication](#authentication)
- [Tickets](#tickets)
- [Comments](#comments)
- [Attachments](#attachments)
- [Admin - Users](#admin---users)
- [Admin - Teams](#admin---teams)
- [Admin - Automation Rules](#admin---automation-rules)
- [Admin - SLA Policies](#admin---sla-policies)
- [Notifications](#notifications)
- [Saved Views](#saved-views)
- [Reports](#reports)
- [Categories & Tags](#categories--tags)
- [SLA Preview](#sla-preview)
- [Health Check](#health-check)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Filtering](#filtering)

## Authentication

The API uses NextAuth cookie-based authentication. After logging in through the web interface, your browser automatically includes the session cookie in API requests.

### Using with cURL

```bash
# Login first (via web interface or API)
# Then use the session cookie in requests:

curl -X GET "https://example.com/api/tickets" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Using with JavaScript/Fetch

```javascript
// In browser context, cookies are automatically included
const response = await fetch('/api/tickets', {
  credentials: 'include'
});

// In Node.js or when making external requests, include cookie header
const response = await fetch('https://example.com/api/tickets', {
  headers: {
    'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN'
  }
});
```

## Tickets

### List Tickets

**Request:**
```http
GET /api/tickets?limit=20&status=W_TOKU&priority=WYSOKI
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "tickets": [
    {
      "id": "123e4567-e89b-12d3-a456-426655440000",
      "number": 42,
      "title": "Server outage in production",
      "descriptionMd": "The production server is down.",
      "status": "W_TOKU",
      "priority": "WYSOKI",
      "category": null,
      "requesterId": "user-123",
      "assigneeUserId": "agent-456",
      "assigneeTeamId": null,
      "organizationId": "org-789",
      "firstResponseAt": "2024-01-15T10:30:00Z",
      "firstResponseDue": "2024-01-15T12:00:00Z",
      "resolveDue": "2024-01-16T10:00:00Z",
      "resolvedAt": null,
      "closedAt": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "requester": {
        "id": "user-123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "REQUESTER",
        "organizationId": "org-789"
      },
      "assigneeUser": {
        "id": "agent-456",
        "email": "agent@example.com",
        "name": "Jane Agent",
        "role": "AGENT",
        "organizationId": "org-789"
      },
      "assigneeTeam": null
    }
  ]
}
```

### Create Ticket

**Request:**
```http
POST /api/tickets
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "title": "New support request",
  "descriptionMd": "I need help with my account.",
  "priority": "SREDNI",
  "category": null
}
```

**Response:**
```json
{
  "ticket": {
    "id": "123e4567-e89b-12d3-a456-426655440000",
    "number": 43,
    "title": "New support request",
    "descriptionMd": "I need help with my account.",
    "status": "NOWE",
    "priority": "SREDNI",
    "category": null,
    "requesterId": "user-123",
    "assigneeUserId": null,
    "assigneeTeamId": null,
    "organizationId": "org-789",
    "firstResponseAt": null,
    "firstResponseDue": "2024-01-15T14:00:00Z",
    "resolveDue": "2024-01-16T14:00:00Z",
    "resolvedAt": null,
    "closedAt": null,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Update Ticket

**Request:**
```http
PATCH /api/tickets/123e4567-e89b-12d3-a456-426655440000
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "status": "W_TOKU",
  "assigneeUserId": "agent-456"
}
```

**Response:**
```json
{
  "ticket": {
    "id": "123e4567-e89b-12d3-a456-426655440000",
    "number": 42,
    "title": "Server outage in production",
    "status": "W_TOKU",
    "assigneeUserId": "agent-456",
    "requester": { ... },
    "assigneeUser": { ... }
  }
}
```

### Bulk Update Tickets

**Request:**
```http
PATCH /api/tickets/bulk
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "ticketIds": [
    "123e4567-e89b-12d3-a456-426655440000",
    "223e4567-e89b-12d3-a456-426655440001"
  ],
  "action": "status",
  "value": "ZAMKNIETE"
}
```

**Response:**
```json
{
  "success": 2,
  "failed": 0,
  "errors": []
}
```

## Comments

### Create Comment

**Request:**
```http
POST /api/tickets/123e4567-e89b-12d3-a456-426655440000/comments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "bodyMd": "I've investigated the issue and found the root cause.",
  "isInternal": false
}
```

**Response:**
```json
{
  "comment": {
    "id": "323e4567-e89b-12d3-a456-426655440002",
    "ticketId": "123e4567-e89b-12d3-a456-426655440000",
    "authorId": "agent-456",
    "isInternal": false,
    "bodyMd": "I've investigated the issue and found the root cause.",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

## Attachments

### Initiate Attachment Upload

**Request:**
```http
POST /api/tickets/123e4567-e89b-12d3-a456-426655440000/attachments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "filename": "screenshot.png",
  "sizeBytes": 245760,
  "mimeType": "image/png"
}
```

**Response:**
```json
{
  "attachment": {
    "id": "423e4567-e89b-12d3-a456-426655440003",
    "ticketId": "123e4567-e89b-12d3-a456-426655440000",
    "filename": "screenshot.png",
    "originalName": "screenshot.png",
    "mimeType": "image/png",
    "sizeBytes": 245760,
    "uploadedById": "user-123",
    "visibility": "PUBLIC",
    "scanStatus": "PENDING",
    "createdAt": "2024-01-15T12:30:00Z"
  },
  "uploadUrl": "https://storage.example.com/upload?token=...",
  "expiresAt": "2024-01-15T13:00:00Z"
}
```

### Get Attachment

**Request:**
```http
GET /api/tickets/123e4567-e89b-12d3-a456-426655440000/attachments/423e4567-e89b-12d3-a456-426655440003
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "attachment": {
    "id": "423e4567-e89b-12d3-a456-426655440003",
    "ticketId": "123e4567-e89b-12d3-a456-426655440000",
    "filename": "screenshot.png",
    "originalName": "screenshot.png",
    "mimeType": "image/png",
    "sizeBytes": 245760,
    "uploadedById": "user-123",
    "uploadedBy": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "visibility": "PUBLIC",
    "scanStatus": "CLEAN",
    "createdAt": "2024-01-15T12:30:00Z"
  },
  "downloadUrl": "https://storage.example.com/download?token=..."
}
```

### Delete Attachment

**Request:**
```http
DELETE /api/tickets/123e4567-e89b-12d3-a456-426655440000/attachments/423e4567-e89b-12d3-a456-426655440003
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true
}
```

## Admin - Users

### List Users

**Request:**
```http
GET /api/admin/users
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "AGENT",
      "organizationId": "org-789",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "ticketCount": 15,
      "activeTicketCount": 3
    }
  ]
}
```

### Create User

**Request:**
```http
POST /api/admin/users
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "AGENT",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-456",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "AGENT",
    "organizationId": "org-789",
    "emailVerified": null,
    "createdAt": "2024-01-15T13:00:00Z",
    "updatedAt": "2024-01-15T13:00:00Z",
    "ticketCount": 0,
    "activeTicketCount": 0
  }
}
```

### Get User

**Request:**
```http
GET /api/admin/users/user-123
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "AGENT",
    "organizationId": "org-789",
    "ticketCount": 15,
    "activeTicketCount": 3
  }
}
```

### Update User

**Request:**
```http
PATCH /api/admin/users/user-123
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "John Updated",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Updated",
    "role": "ADMIN",
    "organizationId": "org-789"
  }
}
```

### Delete User

**Request:**
```http
DELETE /api/admin/users/user-123
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true
}
```

## Admin - Teams

### List Teams

**Request:**
```http
GET /api/admin/teams
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "teams": [
    {
      "id": "team-123",
      "name": "Support Team",
      "organizationId": "org-789",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "memberCount": 5,
      "activeTicketCount": 12
    }
  ]
}
```

### Create Team

**Request:**
```http
POST /api/admin/teams
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Engineering Team"
}
```

**Response:**
```json
{
  "team": {
    "id": "team-456",
    "name": "Engineering Team",
    "organizationId": "org-789",
    "createdAt": "2024-01-15T13:30:00Z",
    "updatedAt": "2024-01-15T13:30:00Z",
    "memberCount": 0,
    "activeTicketCount": 0
  }
}
```

### Add Team Member

**Request:**
```http
POST /api/admin/teams/team-123/memberships
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "membership": {
    "userId": "user-123",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "joinedAt": "2024-01-15T14:00:00Z"
  }
}
```

### Remove Team Member

**Request:**
```http
DELETE /api/admin/teams/team-123/memberships?userId=user-123
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true
}
```

## Admin - Automation Rules

### List Automation Rules

**Request:**
```http
GET /api/admin/automation-rules
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "rules": [
    {
      "id": "rule-123",
      "organizationId": "org-789",
      "name": "Auto-assign high priority",
      "enabled": true,
      "triggerConfig": {
        "type": "ticketCreated",
        "conditions": {
          "priority": "KRYTYCZNY"
        }
      },
      "actionConfig": {
        "type": "assign",
        "assigneeTeamId": "team-123"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Automation Rule

**Request:**
```http
POST /api/admin/automation-rules
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "Auto-assign high priority",
  "triggerConfig": {
    "type": "ticketCreated",
    "conditions": {
      "priority": "KRYTYCZNY"
    }
  },
  "actionConfig": {
    "type": "assign",
    "assigneeTeamId": "team-123"
  }
}
```

**Response:**
```json
{
  "rule": {
    "id": "rule-456",
    "organizationId": "org-789",
    "name": "Auto-assign high priority",
    "enabled": true,
    "triggerConfig": { ... },
    "actionConfig": { ... },
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

## Admin - SLA Policies

### List SLA Policies

**Request:**
```http
GET /api/admin/sla-policies
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "policies": [
    {
      "id": "sla-123",
      "organizationId": "org-789",
      "priority": "WYSOKI",
      "categoryId": null,
      "category": null,
      "firstResponseHours": 2,
      "resolveHours": 8,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create SLA Policy

**Request:**
```http
POST /api/admin/sla-policies
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "priority": "KRYTYCZNY",
  "categoryId": null,
  "firstResponseHours": 1,
  "resolveHours": 4
}
```

**Response:**
```json
{
  "policy": {
    "id": "sla-456",
    "organizationId": "org-789",
    "priority": "KRYTYCZNY",
    "categoryId": null,
    "firstResponseHours": 1,
    "resolveHours": 4,
    "createdAt": "2024-01-15T15:00:00Z",
    "updatedAt": "2024-01-15T15:00:00Z"
  }
}
```

## Notifications

### List Notifications

**Request:**
```http
GET /api/notifications
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-123",
      "userId": "user-123",
      "type": "ticketUpdate",
      "title": "Ticket Updated",
      "message": "Your ticket #42 has been updated",
      "readAt": null,
      "createdAt": "2024-01-15T12:00:00Z",
      "metadata": {
        "ticketId": "123e4567-e89b-12d3-a456-426655440000"
      }
    }
  ]
}
```

### Mark Notification as Read

**Request:**
```http
PATCH /api/notifications/notif-123/read
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "notification": {
    "id": "notif-123",
    "userId": "user-123",
    "type": "ticketUpdate",
    "title": "Ticket Updated",
    "message": "Your ticket #42 has been updated",
    "readAt": "2024-01-15T15:30:00Z",
    "createdAt": "2024-01-15T12:00:00Z",
    "metadata": {}
  }
}
```

## Saved Views

### List Saved Views

**Request:**
```http
GET /api/views
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "views": [
    {
      "id": "view-123",
      "userId": "user-123",
      "organizationId": "org-789",
      "name": "My Open Tickets",
      "filters": {
        "status": "W_TOKU",
        "priority": "WYSOKI"
      },
      "isDefault": false,
      "isShared": false,
      "isTeam": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Saved View

**Request:**
```http
POST /api/views
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "name": "High Priority Tickets",
  "filters": {
    "priority": "WYSOKI",
    "status": "NOWE"
  },
  "isShared": false,
  "isTeam": false
}
```

**Response:**
```json
{
  "view": {
    "id": "view-456",
    "userId": "user-123",
    "organizationId": "org-789",
    "name": "High Priority Tickets",
    "filters": {
      "priority": "WYSOKI",
      "status": "NOWE"
    },
    "isDefault": false,
    "isShared": false,
    "isTeam": false,
    "createdAt": "2024-01-15T16:00:00Z",
    "updatedAt": "2024-01-15T16:00:00Z"
  }
}
```

### Set Default View

**Request:**
```http
POST /api/views/view-123/set-default
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "success": true
}
```

## Reports

### Get KPI Metrics

**Request:**
```http
GET /api/reports/kpi?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "totalTickets": 150,
  "openTickets": 45,
  "resolvedTickets": 100,
  "averageResolutionTime": 86400,
  "slaCompliance": 0.95
}
```

### Get Analytics

**Request:**
```http
GET /api/reports/analytics?days=30
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "period": {
    "startDate": "2023-12-16T00:00:00Z",
    "endDate": "2024-01-15T23:59:59Z"
  },
  "ticketsByStatus": {
    "NOWE": 10,
    "W_TOKU": 25,
    "ROZWIAZANE": 50,
    "ZAMKNIETE": 65
  },
  "ticketsByPriority": {
    "NISKI": 20,
    "SREDNI": 60,
    "WYSOKI": 50,
    "KRYTYCZNY": 20
  }
}
```

### Get CSAT Analytics

**Request:**
```http
GET /api/reports/csat?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "summary": {
    "totalResponses": 80,
    "averageScore": 4.2,
    "responseRate": 0.8,
    "totalResolvedTickets": 100,
    "distribution": {
      "1": 2,
      "2": 5,
      "3": 10,
      "4": 30,
      "5": 33
    },
    "byPriority": {
      "WYSOKI": {
        "count": 40,
        "average": 4.5
      }
    },
    "byCategory": {
      "Technical": {
        "count": 50,
        "average": 4.0
      }
    }
  },
  "responses": [
    {
      "id": "csat-123",
      "ticketNumber": 42,
      "ticketId": "123e4567-e89b-12d3-a456-426655440000",
      "score": 5,
      "comment": "Great service!",
      "createdAt": "2024-01-15T10:00:00Z",
      "ticketPriority": "WYSOKI",
      "ticketCategory": "Technical"
    }
  ]
}
```

### Export Tickets

**Request:**
```http
GET /api/reports/export/tickets?status=ZAMKNIETE&startDate=2024-01-01T00:00:00Z
Cookie: next-auth.session-token=...
```

**Response:**
```
Content-Type: text/csv

number,title,status,priority,createdAt,resolvedAt
42,Server outage,W_TOKU,WYSOKI,2024-01-15T10:00:00Z,2024-01-15T14:00:00Z
43,Account issue,ZAMKNIETE,SREDNI,2024-01-14T09:00:00Z,2024-01-14T16:00:00Z
```

### Export Comments

**Request:**
```http
GET /api/reports/export/comments?ticketId=123e4567-e89b-12d3-a456-426655440000
Cookie: next-auth.session-token=...
```

**Response:**
```
Content-Type: text/csv

ticketId,authorId,bodyMd,isInternal,createdAt
123e4567-e89b-12d3-a456-426655440000,user-123,Initial comment,false,2024-01-15T10:00:00Z
123e4567-e89b-12d3-a456-426655440000,agent-456,Internal note,true,2024-01-15T11:00:00Z
```

## Categories & Tags

### List Categories

**Request:**
```http
GET /api/categories
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "categories": [
    {
      "id": "cat-123",
      "name": "Technical",
      "description": "Technical support issues",
      "organizationId": "org-789",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### List Tags

**Request:**
```http
GET /api/tags
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-123",
      "name": "urgent",
      "organizationId": "org-789",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## SLA Preview

### Preview SLA Deadlines

**Request:**
```http
POST /api/sla/preview
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "priority": "WYSOKI",
  "category": null
}
```

**Response:**
```json
{
  "firstResponseDue": "2024-01-15T18:00:00Z",
  "resolveDue": "2024-01-16T14:00:00Z"
}
```

## Health Check

### Check System Health

**Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "database": true,
  "redis": true,
  "minio": true,
  "timestamp": "2024-01-15T16:30:00Z"
}
```

## Error Handling

All errors follow a consistent format:

### 400 Bad Request (Validation Error)

**Request:**
```http
POST /api/tickets
Content-Type: application/json

{
  "title": "AB"
}
```

**Response:**
```json
{
  "error": {
    "fieldErrors": {
      "title": ["String must contain at least 3 character(s)"],
      "descriptionMd": ["Required"],
      "priority": ["Required"]
    }
  }
}
```

### 401 Unauthorized

**Request:**
```http
GET /api/tickets
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

**Request:**
```http
GET /api/admin/users
Cookie: next-auth.session-token=... (non-admin user)
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

**Request:**
```http
GET /api/tickets/nonexistent-id
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "error": "Not found"
}
```

### 409 Conflict

**Request:**
```http
POST /api/tickets/123e4567-e89b-12d3-a456-426655440000/csat
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "score": 5
}
```

**Response (if CSAT already submitted):**
```json
{
  "error": "CSAT response already submitted for this ticket"
}
```

## Pagination

### Cursor-based Pagination (Tickets)

**Request:**
```http
GET /api/tickets?limit=20&cursor=eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjY1NTQ0MDAwMCIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMTVUMTA6MDA6MDBaIn0=
```

**Response:**
```json
{
  "tickets": [ ... ],
  "nextCursor": "eyJpZCI6IjIyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjY1NTQ0MDAwMSIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMTVUMTE6MDA6MDBaIn0=",
  "prevCursor": null
}
```

### Offset-based Pagination (Admin Audit Events)

**Request:**
```http
GET /api/admin/audit-events?limit=20&offset=40
```

**Response:**
```json
{
  "events": [ ... ],
  "page": {
    "limit": 20,
    "offset": 40,
    "total": 150
  }
}
```

## Filtering

### Filter Tickets by Multiple Criteria

**Request:**
```http
GET /api/tickets?status=W_TOKU&priority=WYSOKI&category=cat-123&tags=tag-123,tag-456&q=server&createdAtFrom=2024-01-01T00:00:00Z&createdAtTo=2024-01-31T23:59:59Z&assigneeUserId=user-123&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `status`: Filter by ticket status (NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE)
- `priority`: Filter by priority (NISKI, SREDNI, WYSOKI, KRYTYCZNY)
- `category`: Filter by category ID
- `tags`: Comma-separated tag IDs
- `q`: Search in title and description (case-insensitive)
- `createdAtFrom`: Filter tickets created on or after this date (ISO 8601)
- `createdAtTo`: Filter tickets created on or before this date (ISO 8601)
- `updatedAtFrom`: Filter tickets updated on or after this date
- `updatedAtTo`: Filter tickets updated on or before this date
- `resolvedAtFrom`: Filter tickets resolved on or after this date
- `resolvedAtTo`: Filter tickets resolved on or before this date
- `assigneeUserId`: Filter by assigned user ID
- `assigneeTeamId`: Filter by assigned team ID
- `sortBy`: Field to sort by (createdAt, updatedAt, resolvedAt, priority, status)
- `sortOrder`: Sort order (asc, desc)

### Filter Admin Audit Events

**Request:**
```http
GET /api/admin/audit-events?resourceId=user-123&actorId=admin-456&limit=20&offset=0
```

**Query Parameters:**
- `resourceId`: Filter by resource ID
- `actorId`: Filter by actor user ID
- `limit`: Number of results per page (1-100, default: 20)
- `offset`: Number of results to skip (default: 0)

## CSAT Submission

### Submit CSAT with Token

**Request:**
```http
POST /api/tickets/123e4567-e89b-12d3-a456-426655440000/csat?token=csat-token-abc123
Content-Type: application/json

{
  "score": 5,
  "comment": "Excellent service!"
}
```

**Response:**
```json
{
  "response": {
    "id": "csat-789",
    "ticketId": "123e4567-e89b-12d3-a456-426655440000",
    "score": 5,
    "comment": "Excellent service!",
    "createdAt": "2024-01-15T17:00:00Z"
  }
}
```

### Submit CSAT with Session

**Request:**
```http
POST /api/tickets/123e4567-e89b-12d3-a456-426655440000/csat
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "score": 4,
  "comment": "Good service"
}
```

## Ticket Audit Timeline

### Get Ticket Audit Events

**Request:**
```http
GET /api/tickets/123e4567-e89b-12d3-a456-426655440000/audit
Cookie: next-auth.session-token=...
```

**Response:**
```json
{
  "auditEvents": [
    {
      "id": "audit-123",
      "action": "STATUS_CHANGE",
      "actorId": "agent-456",
      "actor": {
        "id": "agent-456",
        "email": "agent@example.com",
        "name": "Jane Agent"
      },
      "details": {
        "oldStatus": "NOWE",
        "newStatus": "W_TOKU"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "audit-124",
      "action": "COMMENT_ADDED",
      "actorId": "agent-456",
      "actor": { ... },
      "details": {
        "commentId": "323e4567-e89b-12d3-a456-426655440002"
      },
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All UUIDs follow the standard UUID v4 format
- Status values are in Polish: NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE
- Priority values are in Polish: NISKI, SREDNI, WYSOKI, KRYTYCZNY
- Role values: REQUESTER, AGENT, ADMIN
- All authenticated endpoints require the `next-auth.session-token` cookie
- Admin endpoints require ADMIN role
- Some endpoints (like bulk operations) require AGENT or ADMIN role
- REQUESTER role can only access their own tickets and close/reopen them

