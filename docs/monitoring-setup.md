# Monitoring Setup & Verification

**Last Updated:** 2025-01-27  
**Status:** ✅ Verified - Production Ready

This document describes the monitoring setup for HelpDeskApp, including health checks, metrics collection, and alerting configuration.

## Overview

HelpDeskApp includes comprehensive monitoring capabilities:

- ✅ **Health Checks**: Application and worker health endpoints
- ✅ **Metrics Collection**: Database query timing, KPI metrics, worker queue metrics
- ✅ **Structured Logging**: JSON-formatted logs with request IDs
- ⚠️ **Prometheus Metrics**: Planned for future enhancement (backlog #106)
- ⚠️ **Alerting Configuration**: Requires deployment-specific setup

## Health Checks

### Application Health Endpoint

**Endpoint:** `GET /api/health`

**Implementation:** `src/app/api/health/route.ts`

#### Health Check Features

✅ **Database Check**: Verifies PostgreSQL connection via Prisma (required)  
✅ **Redis Check**: Optional check for BullMQ queue connectivity  
✅ **MinIO Check**: Optional check for object storage health  
✅ **Status Codes**: Returns 200 if healthy, 503 if unhealthy  
✅ **Response Format**: JSON with boolean status for each service

#### Health Response Format

```json
{
  "database": true,
  "redis": true,
  "minio": true,
  "timestamp": "2025-01-27T10:00:00.000Z"
}
```

#### Health Check Behavior

- **Database**: Required - health check fails if database is unavailable
- **Redis**: Optional - health check passes even if Redis is unavailable (if not configured)
- **MinIO**: Optional - health check passes even if MinIO is unavailable (if not configured)

#### Docker Integration

Health checks are integrated into Docker configuration:

- **Dockerfile**: HEALTHCHECK directive uses `/api/health` endpoint
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1
  ```
- **docker-compose.prod.yml**: Health check configuration for all services

#### Load Balancer Integration

For production deployment, configure your load balancer to use the health endpoint:

**Nginx Example:**
```nginx
location /health {
    proxy_pass http://localhost:3000/api/health;
    access_log off;
}
```

**AWS ALB Health Check:**
```
Health Check Path: /api/health
Healthy Threshold: 2
Unhealthy Threshold: 3
Timeout: 10 seconds
Interval: 30 seconds
```

**Kubernetes Liveness/Readiness Probes:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Worker Health Check

**Script:** `src/worker/health.ts`  
**Command:** `pnpm worker:health`

#### Worker Health Features

✅ **Database Check**: Verifies PostgreSQL connection  
✅ **Queue Check**: Verifies Redis/BullMQ connectivity  
✅ **Job Counts**: Reports waiting, active, delayed, failed, completed, paused jobs  
✅ **Failed Jobs**: Samples failed job IDs for debugging  
✅ **Dry Run Mode**: Can run without actual connections for config validation

#### Worker Health Response Format

```json
{
  "status": "ok|error|skip",
  "queueName": "helpdesk-default",
  "redisUrl": "redis://localhost:6379",
  "prefix": "helpdesk",
  "database": true,
  "counts": {
    "waiting": 0,
    "active": 0,
    "delayed": 0,
    "failed": 0,
    "completed": 10,
    "paused": 0
  },
  "failedIds": []
}
```

#### Docker Integration

**docker-compose.prod.yml** worker service can include health check:
```yaml
worker:
  healthcheck:
    test: ["CMD", "pnpm", "worker:health"]
    interval: 60s
    timeout: 10s
    retries: 3
    start_period: 30s
```

## Metrics Collection

### Database Query Timing

**Implementation:** `src/lib/prisma.ts` (Prisma extension)

✅ **Query Timing**: All Prisma queries are timed  
✅ **Performance Logging**: Query times logged when `LOG_QUERY_TIME=true` or in development  
✅ **Format**: `[Prisma Query] Model.operation took X.XXms`

#### Enabling Query Timing

Query timing is automatically enabled in development mode. For production:

```bash
LOG_QUERY_TIME=true npm start
```

#### Performance Targets

See `docs/performance-budget.md` for detailed performance targets:

| Query Type | Target Latency (P95) | Measured P95 | Status |
|------------|---------------------|--------------|--------|
| Ticket List (20 items) | < 200ms | 14.96ms | ✅ PASS |
| Ticket List with Status Filter | < 200ms | 5.93ms | ✅ PASS |
| Ticket Search | < 100ms | 11.74ms | ✅ PASS |
| Ticket Detail (inc. comments/audit) | < 100ms | 19.70ms | ✅ PASS |
| Admin Audit Logs (20 items) | < 200ms | 4.11ms | ✅ PASS |

### KPI Metrics

**Implementation:** `src/lib/kpi-metrics.ts`  
**Endpoint:** `GET /api/reports/kpi` (Admin only)

✅ **MTTR (Mean Time to Resolve)**: Calculated from ticket creation to resolution  
✅ **MTTA (Mean Time to Acknowledge)**: Calculated from ticket creation to first response  
✅ **Reopen Rate**: Percentage of closed tickets that were reopened  
✅ **SLA Compliance**: Percentage of tickets resolved within SLA deadlines

#### KPI Metrics Format

```json
{
  "mttr": {
    "hours": 24.5,
    "count": 100
  },
  "mtta": {
    "hours": 2.3,
    "count": 100
  },
  "reopenRate": 5.2,
  "slaCompliance": 95.5,
  "dateRange": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  }
}
```

### Worker Queue Metrics

**Source:** Worker health check (`pnpm worker:health`)

✅ **Job Counts**: Waiting, active, delayed, failed, completed, paused  
✅ **Queue Depth**: Total number of jobs in queue  
✅ **Failed Jobs**: Count and sample of failed job IDs

#### Queue Metrics Format

```json
{
  "counts": {
    "waiting": 10,
    "active": 2,
    "delayed": 0,
    "failed": 0,
    "completed": 150,
    "paused": 0
  },
  "failedIds": []
}
```

### Prometheus Metrics (Planned)

⚠️ **Status**: Planned for future enhancement (backlog #106)

A `/metrics` endpoint with Prometheus format is planned to expose:
- Request rates
- Response times
- Error rates
- Database query performance
- Worker queue depth
- Worker job processing time

## Structured Logging

### Implementation

Structured logging is implemented in `src/lib/logger.ts` using the `createRequestLogger()` function.

### Features

✅ **Request IDs**: Each request gets a unique UUID for correlation  
✅ **Structured JSON Output**: All logs are JSON-formatted for easy parsing  
✅ **Context Fields**: Includes route, method, userId in every log entry  
✅ **Log Levels**: Supports `info`, `warn`, and `error` levels  
✅ **Security Events**: Special handling for security events (failed_login, authorization_failure, rate_limit_violation, suspicious_activity)  
✅ **Metadata Support**: Additional metadata can be attached to log entries

### Log Format

```json
{
  "level": "info|warn|error",
  "message": "log message",
  "requestId": "uuid-v4",
  "route": "/api/tickets",
  "method": "GET",
  "userId": "user-id-optional",
  "additional": "metadata"
}
```

### Log Aggregation

All logs are written to `stdout` as JSON, making them suitable for:

- **Log Aggregation Systems**: ELK Stack (Elasticsearch, Logstash, Kibana), Splunk, Datadog
- **Cloud Logging Services**: AWS CloudWatch, GCP Cloud Logging, Azure Monitor
- **Container Orchestration**: Kubernetes log collection, Docker log drivers

#### Example CloudWatch Configuration

```yaml
# CloudWatch Log Group
log_group_name: /helpdesk/app
log_stream_name: {instance_id}

# Log Retention
retention_in_days: 30
```

#### Example Datadog Configuration

```yaml
# Datadog Agent Configuration
logs:
  - type: file
    path: /var/log/app/stdout.log
    service: helpdesk
    source: nodejs
    log_processing_rules:
      - type: multi_line
        name: json_logs
        pattern: ^{"level"
```

## Alerting Configuration

### Recommended Alert Rules

The following alert rules should be configured in your monitoring system:

#### Application Health Alerts

**1. Application Down**
- **Condition**: Health endpoint returns 503 or is unreachable
- **Severity**: Critical
- **Threshold**: 2 consecutive failures
- **Action**: Page on-call engineer, check application logs

**2. Database Connectivity Issues**
- **Condition**: Health endpoint reports `database: false`
- **Severity**: Critical
- **Threshold**: 1 failure
- **Action**: Page on-call engineer, check database connectivity

**3. Redis Connectivity Issues** (if Redis is required)
- **Condition**: Health endpoint reports `redis: false`
- **Severity**: Warning
- **Threshold**: 2 consecutive failures
- **Action**: Notify team, check Redis service

#### Performance Alerts

**4. High Error Rate**
- **Condition**: Error rate > 5% of total requests
- **Severity**: Warning
- **Window**: 5 minutes
- **Action**: Check error logs, investigate patterns

**5. Slow Response Times**
- **Condition**: P95 response time > 2 seconds
- **Severity**: Warning
- **Window**: 5 minutes
- **Action**: Check query performance, investigate slow endpoints

**6. Database Query Performance**
- **Condition**: Query duration > 2x target latency (from performance budget)
- **Severity**: Warning
- **Action**: Check query execution plans, verify indexes

**7. Critical Query Performance**
- **Condition**: Query duration > 5x target latency
- **Severity**: Critical
- **Action**: Immediate investigation, check for missing indexes

#### Worker Queue Alerts

**8. Worker Queue Backlog**
- **Condition**: Waiting jobs > 100
- **Severity**: Warning
- **Action**: Check worker health, investigate processing delays

**9. Worker Queue Critical Backlog**
- **Condition**: Waiting jobs > 500
- **Severity**: Critical
- **Action**: Scale workers, investigate job failures

**10. High Failed Job Rate**
- **Condition**: Failed jobs > 10 in last hour
- **Severity**: Warning
- **Action**: Check failed job details, investigate root cause

**11. Worker Health Check Failure**
- **Condition**: Worker health check returns error
- **Severity**: Critical
- **Action**: Restart worker, check worker logs

#### Security Alerts

**12. High Authentication Failure Rate**
- **Condition**: Failed login attempts > 50 in 5 minutes
- **Severity**: Warning
- **Action**: Check for brute force attacks, review security logs

**13. High Authorization Failure Rate**
- **Condition**: 403 responses > 20 in 5 minutes
- **Severity**: Warning
- **Action**: Review authorization failures, check for misconfigurations

**14. Rate Limit Violations Spike**
- **Condition**: 429 responses > 100 in 5 minutes
- **Severity**: Info
- **Action**: Review rate limit configuration, check for legitimate usage patterns

### Alert Configuration Examples

#### Prometheus Alertmanager Rules (Future)

```yaml
groups:
  - name: helpdesk_app
    interval: 30s
    rules:
      - alert: ApplicationDown
        expr: up{job="helpdesk"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "HelpDeskApp application is down"
          description: "Application health check has been failing for 2 minutes"

      - alert: DatabaseConnectionFailure
        expr: helpdesk_health_database == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "Application cannot connect to database"

      - alert: HighErrorRate
        expr: rate(helpdesk_http_errors_total[5m]) / rate(helpdesk_http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(helpdesk_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response times detected"
          description: "P95 response time is {{ $value }}s"

      - alert: WorkerQueueBacklog
        expr: helpdesk_worker_queue_waiting > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Worker queue backlog detected"
          description: "{{ $value }} jobs waiting in queue"
```

#### CloudWatch Alarms

```json
{
  "AlarmName": "HelpDeskApp-DatabaseHealth",
  "MetricName": "HealthCheckDatabase",
  "Namespace": "HelpDeskApp",
  "Statistic": "Average",
  "Period": 60,
  "EvaluationPeriods": 1,
  "Threshold": 1,
  "ComparisonOperator": "LessThanThreshold",
  "AlarmActions": ["arn:aws:sns:region:account:alerts"],
  "OKActions": ["arn:aws:sns:region:account:alerts"]
}
```

#### Datadog Monitors

```yaml
- name: HelpDeskApp Health Check
  type: service check
  query: 'service_check:helpdesk.health.check{*}'
  message: |
    Health check is failing. Investigate application logs.
    @oncall-team
  options:
    threshold_count: 2
    timeframe: last_5m
    require_full_window: true
```

### Alert Recipients

Configure alert recipients based on severity:

- **Critical Alerts**: On-call engineer (pager), Slack/email notification
- **Warning Alerts**: Team Slack channel, email notification
- **Info Alerts**: Dashboard only, optional email digest

### Alert Escalation Procedures

1. **Level 1**: Automated alert sent to on-call engineer
2. **Level 2** (after 15 minutes): Alert escalated to team lead
3. **Level 3** (after 30 minutes): Alert escalated to engineering manager

## Monitoring Dashboard

### Recommended Dashboard Metrics

Create monitoring dashboards with the following key metrics:

#### Application Metrics
- Request rate (requests/minute)
- Response time (P50, P95, P99)
- Error rate (%)
- Active users
- Health check status

#### Database Metrics
- Query performance (P50, P95, P99)
- Query rate
- Connection pool usage
- Slow query count

#### Worker Metrics
- Queue depth (waiting, active, failed)
- Job processing rate
- Job failure rate
- Worker health status

#### Business Metrics
- Ticket creation rate
- Ticket resolution rate
- MTTR (Mean Time to Resolve)
- MTTA (Mean Time to Acknowledge)
- SLA compliance rate

### Example Dashboard (Grafana)

```json
{
  "dashboard": {
    "title": "HelpDeskApp Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(helpdesk_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(helpdesk_http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(helpdesk_http_errors_total[5m]) / rate(helpdesk_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Worker Queue Depth",
        "targets": [
          {
            "expr": "helpdesk_worker_queue_waiting"
          }
        ]
      }
    ]
  }
}
```

## Verification Checklist

### Health Checks

- [x] Application health endpoint exists: `/api/health`
- [x] Health check verifies database connectivity
- [x] Health check verifies Redis connectivity (optional)
- [x] Health check verifies MinIO connectivity (optional)
- [x] Health check returns appropriate status codes (200/503)
- [x] Docker health check configured
- [ ] Health check integrated with load balancer (deployment-specific)
- [x] Worker health check script exists
- [x] Worker health check verifies database and queue

### Metrics Collection

- [x] Database query timing implemented
- [x] Query timing can be enabled in production
- [x] KPI metrics endpoint exists
- [x] Worker queue metrics available via health check
- [x] Structured logging implemented
- [ ] Prometheus metrics endpoint (planned)
- [ ] Metrics exported to monitoring system (deployment-specific)

### Alerting

- [ ] Application down alerts configured
- [ ] Database connectivity alerts configured
- [ ] High error rate alerts configured
- [ ] Slow response time alerts configured
- [ ] Worker queue backlog alerts configured
- [ ] Alert recipients configured
- [ ] Alert escalation procedures documented

### Logging

- [x] Structured logging implemented
- [x] Request IDs included in logs
- [x] Security events logged
- [x] Logs are JSON-formatted
- [ ] Log aggregation configured (deployment-specific)
- [ ] Log retention policy defined (deployment-specific)

## Deployment-Specific Configuration

The following items require configuration in your deployment environment:

1. **Load Balancer Health Checks**: Configure load balancer to use `/api/health` endpoint
2. **Log Aggregation**: Configure log collection (CloudWatch, Datadog, ELK, etc.)
3. **Metrics Collection**: Configure metrics export to monitoring system
4. **Alerting Rules**: Configure alerts in your monitoring system
5. **Dashboard Creation**: Create monitoring dashboards
6. **Alert Recipients**: Configure alert notification channels
7. **Log Retention**: Configure log retention policies

## Related Documentation

- `docs/logging-monitoring-verification.md` - Detailed logging and monitoring verification
- `docs/performance-monitoring.md` - Performance monitoring guide
- `docs/performance-budget.md` - Performance targets and measurements
- `docs/runbooks.md` - Operational procedures including alerting

