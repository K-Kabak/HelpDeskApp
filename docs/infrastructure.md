# Infrastructure Documentation

This document provides comprehensive documentation for the HelpDeskApp infrastructure architecture, dependencies, scaling considerations, and deployment topologies.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Service Dependencies](#service-dependencies)
- [Network Configuration](#network-configuration)
- [Storage Requirements](#storage-requirements)
- [Scaling Considerations](#scaling-considerations)
- [Resource Requirements](#resource-requirements)
- [Deployment Topologies](#deployment-topologies)
- [Database Monitoring](#database-monitoring)

---

## Architecture Overview

HelpDeskApp is a multi-service application with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer / Reverse Proxy           │
│                      (Nginx / Cloud Load Balancer)            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS (443)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────┐                        ┌───────────────┐
│   Next.js     │                        │   Worker      │
│   Application │                        │   Process     │
│   (Port 3000) │                        │               │
└───────┬───────┘                        └───────┬───────┘
        │                                         │
        │                                         │
        ├─────────────┬──────────────────────────┤
        │             │                          │
        ▼             ▼                          ▼
┌──────────────┐  ┌──────────┐          ┌──────────────┐
│ PostgreSQL  │  │  Redis   │          │    MinIO     │
│  Database   │  │  Queue   │          │  (Optional)  │
│  (Port 5432)│  │(Port 6379)│          │  (Port 9000) │
└──────────────┘  └──────────┘          └──────────────┘
```

### Components

1. **Next.js Application**: Main web application serving HTTP requests
2. **Worker Process**: Background job processor for async tasks (SLA monitoring, notifications)
3. **PostgreSQL Database**: Primary data store for all application data
4. **Redis**: Message queue for BullMQ job processing
5. **MinIO** (Optional): S3-compatible object storage for file attachments

---

## Service Dependencies

### Application Service (`app`)

**Dependencies:**
- **PostgreSQL** (Required): Database connection for all data operations
  - Connection string: `DATABASE_URL`
  - Health check: Verifies connection via `/api/health` endpoint
  - Startup dependency: Application waits for database to be healthy

- **Redis** (Optional): Used for session storage and caching (if configured)
  - Connection string: `REDIS_URL`
  - Health check: Optional check in `/api/health` endpoint

- **MinIO** (Optional): Object storage for file attachments
  - Endpoint: `MINIO_ENDPOINT` or `STORAGE_BASE_URL`
  - Health check: Optional check in `/api/health` endpoint

**Startup Order:**
1. Database must be healthy before application starts
2. Redis should be available (optional, but recommended for production)
3. MinIO can be started independently (optional)

### Worker Service (`worker`)

**Dependencies:**
- **PostgreSQL** (Required): Database connection for job processing
  - Connection string: `DATABASE_URL`
  - Health check: Worker health check verifies database connection
  - Startup dependency: Worker waits for database to be healthy

- **Redis** (Required): BullMQ job queue
  - Connection string: `REDIS_URL`
  - Health check: Worker health check verifies Redis connection
  - Startup dependency: Worker waits for Redis to be healthy

**Startup Order:**
1. Database must be healthy before worker starts
2. Redis must be healthy before worker starts

### Database Service (`db`)

**Dependencies:**
- None (standalone service)

**Startup Order:**
- Should start first, as other services depend on it

### Redis Service (`redis`)

**Dependencies:**
- None (standalone service)

**Startup Order:**
- Should start early, as worker depends on it

### MinIO Service (`minio`)

**Dependencies:**
- None (standalone service)

**Startup Order:**
- Can start independently (optional service)

---

## Network Configuration

### Docker Compose Network

All services run on a private Docker network (`helpdesk-network`) with bridge driver:

```yaml
networks:
  helpdesk-network:
    driver: bridge
```

### Internal Service Communication

Services communicate using Docker service names as hostnames:

- **Database**: `postgresql://postgres:password@db:5432/helpdesk`
- **Redis**: `redis://redis:6379`
- **MinIO**: `http://minio:9000`
- **Application**: Accessible via `app:3000` (internal) or exposed port (external)

### Port Exposures

**Production Recommendations:**
- **Database (5432)**: Should NOT be exposed externally. Use internal network only.
- **Redis (6379)**: Should NOT be exposed externally. Use internal network only.
- **MinIO (9000/9001)**: Should NOT be exposed externally. Use internal network only.
- **Application (3000)**: Exposed via reverse proxy/load balancer, not directly.

**Development:**
- Ports may be exposed for local development convenience
- Always use internal network in production

### Security Considerations

1. **Network Isolation**: Use Docker networks to isolate services
2. **No External Database Access**: Database should only be accessible from application and worker
3. **TLS/SSL**: Use encrypted connections for database and Redis in production
4. **Firewall Rules**: Restrict access to only necessary ports
5. **Reverse Proxy**: Use Nginx or cloud load balancer for HTTPS termination

---

## Storage Requirements

### Database Storage

**PostgreSQL Data:**
- **Volume**: `db_data` (Docker volume)
- **Location**: `/var/lib/postgresql/data` (container)
- **Persistence**: Required for production
- **Backup**: Regular backups required (see `docs/backup-restore.md`)

**Storage Estimation:**
- Small deployment (< 1000 tickets): ~1-5 GB
- Medium deployment (1000-10000 tickets): ~5-50 GB
- Large deployment (10000+ tickets): ~50-500 GB+

**Growth Factors:**
- Ticket data (title, description, metadata)
- Comments (text content)
- Audit events (change history)
- Attachments (if stored in database - not recommended)

### Redis Storage

**Redis Data:**
- **Volume**: `redis_data` (Docker volume)
- **Location**: `/data` (container)
- **Persistence**: AOF (Append-Only File) enabled
- **Purpose**: Job queue data, session storage (if configured)

**Storage Estimation:**
- Typically small: ~100 MB - 1 GB
- Grows with queue depth and session count
- Auto-cleanup of completed jobs

### MinIO Storage (Optional)

**MinIO Data:**
- **Volume**: `minio_data` (Docker volume)
- **Location**: `/data` (container)
- **Purpose**: File attachments

**Storage Estimation:**
- Depends on attachment usage
- Plan for 10-100 GB+ depending on usage
- Consider lifecycle policies for old attachments

### Backup Storage

**Requirements:**
- Separate storage for database backups
- Retention policy (e.g., 30 days)
- Off-site backup storage recommended
- See `docs/backup-restore.md` for backup procedures

---

## Scaling Considerations

### Horizontal Scaling

#### Application Scaling

**Stateless Design:**
- Next.js application is stateless (no in-memory state)
- Can scale horizontally by running multiple instances
- Use load balancer to distribute traffic

**Scaling Strategy:**
```yaml
# Docker Compose example (not production-ready, use orchestration)
services:
  app:
    deploy:
      replicas: 3  # Run 3 instances
```

**Considerations:**
- Database connection pool: Each instance maintains its own pool
  - Total connections = `connection_limit × number_of_instances`
  - Ensure database `max_connections` is sufficient
- Session storage: Use Redis for shared sessions if scaling
- File uploads: Use shared storage (MinIO/S3) for attachments

**Recommended Scaling:**
- Start with 1-2 instances
- Scale to 3-5 instances for medium traffic
- Scale to 10+ instances for high traffic (with database read replicas)

#### Worker Scaling

**Stateless Workers:**
- Worker processes are stateless
- Can run multiple worker instances
- BullMQ handles job distribution automatically

**Scaling Strategy:**
```yaml
services:
  worker:
    deploy:
      replicas: 2  # Run 2 worker instances
```

**Considerations:**
- Concurrency: Each worker processes `WORKER_CONCURRENCY` jobs simultaneously
- Total capacity = `WORKER_CONCURRENCY × number_of_workers`
- Monitor queue depth to determine if more workers are needed

**Recommended Scaling:**
- Start with 1 worker (concurrency: 5)
- Scale to 2-3 workers for medium load
- Scale to 5+ workers for high load

### Vertical Scaling

**Database Scaling:**
- Increase CPU and memory for PostgreSQL
- Add read replicas for read-heavy workloads
- Optimize queries and indexes (see `docs/query-optimization-review.md`)

**Redis Scaling:**
- Redis is typically memory-bound
- Increase memory allocation if queue grows large
- Consider Redis Cluster for high availability

**Application Scaling:**
- Increase CPU and memory per instance
- Monitor resource usage to determine optimal instance size

### Database Read Replicas

**When to Use:**
- High read-to-write ratio
- Read-heavy workloads (ticket lists, reports)
- Geographic distribution

**Implementation:**
- Configure Prisma to use read replicas
- Route read queries to replicas
- Keep writes on primary database

**Example Configuration:**
```typescript
// Prisma schema or connection string
DATABASE_URL=postgresql://user:pass@primary:5432/db
DATABASE_READ_URL=postgresql://user:pass@replica:5432/db
```

### Load Balancing

**Application Load Balancer:**
- Distribute HTTP requests across multiple app instances
- Health check: `/api/health`
- Session affinity: Not required (stateless)

**Database Load Balancer:**
- Route read queries to read replicas
- Route write queries to primary database
- Use connection pooling (PgBouncer) if needed

---

## Resource Requirements

### Minimum Requirements (Development)

**Single Server Deployment:**
- **CPU**: 2 cores
- **Memory**: 4 GB RAM
- **Storage**: 20 GB (database + application)
- **Network**: 100 Mbps

**Service Breakdown:**
- Application: 512 MB RAM
- Worker: 256 MB RAM
- Database: 1 GB RAM
- Redis: 256 MB RAM
- MinIO: 512 MB RAM
- System overhead: ~1.5 GB

### Recommended Requirements (Production - Small)

**Single Server Deployment:**
- **CPU**: 4 cores
- **Memory**: 8 GB RAM
- **Storage**: 100 GB SSD (database + application + backups)
- **Network**: 1 Gbps

**Service Breakdown:**
- Application: 2 GB RAM (1-2 instances)
- Worker: 512 MB RAM (1 instance)
- Database: 2 GB RAM
- Redis: 512 MB RAM
- MinIO: 1 GB RAM
- System overhead: ~2 GB

### Recommended Requirements (Production - Medium)

**Multi-Server Deployment:**
- **Application Servers** (2-3 instances):
  - CPU: 4 cores per instance
  - Memory: 4 GB RAM per instance
  - Storage: 50 GB SSD per instance

- **Database Server**:
  - CPU: 8 cores
  - Memory: 16 GB RAM
  - Storage: 500 GB SSD (with backups)

- **Redis Server**:
  - CPU: 2 cores
  - Memory: 2 GB RAM
  - Storage: 50 GB SSD

- **MinIO Server** (if used):
  - CPU: 4 cores
  - Memory: 4 GB RAM
  - Storage: 1 TB (depends on attachment usage)

### Recommended Requirements (Production - Large)

**Distributed Deployment:**
- **Application Servers** (5-10 instances):
  - CPU: 8 cores per instance
  - Memory: 8 GB RAM per instance
  - Load balancer in front

- **Database Cluster**:
  - Primary: 16 cores, 32 GB RAM, 1 TB SSD
  - Read Replicas (2-3): 8 cores, 16 GB RAM each

- **Redis Cluster**:
  - 3 nodes: 4 cores, 8 GB RAM each

- **MinIO Cluster** (if used):
  - Distributed storage: 10+ TB

### Resource Monitoring

**Key Metrics to Monitor:**
- CPU usage per service
- Memory usage per service
- Database connection pool usage
- Redis memory usage
- Disk I/O and storage growth
- Network bandwidth

**Tools:**
- Docker stats: `docker stats`
- Prometheus + Grafana (recommended)
- Cloud provider monitoring (AWS CloudWatch, etc.)

---

## Deployment Topologies

### Topology 1: Single Server (Development/Small Production)

**Architecture:**
```
┌─────────────────────────────────────┐
│         Single Server               │
│  ┌──────────┐  ┌──────────┐        │
│  │   App    │  │  Worker  │        │
│  └────┬─────┘  └────┬─────┘        │
│       │             │               │
│       ├─────────────┤               │
│       ▼             ▼               │
│  ┌──────────┐  ┌──────────┐        │
│  │   DB     │  │  Redis   │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

**Use Cases:**
- Development environments
- Small production deployments (< 100 users)
- Low traffic applications

**Pros:**
- Simple to deploy and manage
- Low cost
- All services on one machine

**Cons:**
- Single point of failure
- Limited scalability
- Resource contention

### Topology 2: Separated Services (Medium Production)

**Architecture:**
```
┌──────────────┐    ┌──────────────┐
│  App Server  │    │ Worker Server │
│  (2 instances)│    │  (1 instance) │
└──────┬───────┘    └──────┬────────┘
       │                   │
       └─────────┬─────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────┐            ┌──────────┐
│   DB     │            │  Redis   │
│  Server  │            │  Server  │
└──────────┘            └──────────┘
```

**Use Cases:**
- Medium production deployments (100-1000 users)
- Moderate traffic
- Better availability

**Pros:**
- Service isolation
- Better resource allocation
- Can scale services independently

**Cons:**
- More complex deployment
- Network latency between services
- Higher infrastructure cost

### Topology 3: Distributed Cluster (Large Production)

**Architecture:**
```
┌─────────────────────────────────────┐
│      Load Balancer / Gateway       │
└──────────────┬─────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐        ┌──────────┐
│ App Pool │        │Worker Pool│
│(5-10 inst)│        │(3-5 inst) │
└──────────┘        └──────────┘
    │                     │
    └──────────┬──────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐        ┌──────────┐
│DB Cluster│        │Redis     │
│Primary + │        │Cluster   │
│Replicas  │        │(3 nodes) │
└──────────┘        └──────────┘
```

**Use Cases:**
- Large production deployments (1000+ users)
- High traffic
- High availability requirements

**Pros:**
- High availability
- Horizontal scalability
- Geographic distribution possible
- Fault tolerance

**Cons:**
- Complex deployment and management
- Higher infrastructure cost
- Requires orchestration (Kubernetes, etc.)

### Topology 4: Cloud-Native (Kubernetes)

**Architecture:**
```
┌─────────────────────────────────────┐
│     Kubernetes Cluster              │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ App Pods │  │Worker Pods│       │
│  │(Replicas)│  │(Replicas)│       │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │DB (State)│  │Redis     │        │
│  │fulSet    │  │(Stateful)│        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

**Use Cases:**
- Enterprise deployments
- Auto-scaling requirements
- Multi-region deployments

**Pros:**
- Auto-scaling
- Self-healing
- Rolling updates
- Resource efficiency

**Cons:**
- Requires Kubernetes expertise
- Complex setup
- Higher operational overhead

---

## Database Monitoring

### Connection Pool Monitoring

**Key Metrics:**
- Active connections: `SELECT count(*) FROM pg_stat_activity WHERE state = 'active';`
- Idle connections: `SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';`
- Total connections: `SELECT count(*) FROM pg_stat_activity;`
- Max connections: `SHOW max_connections;`

**Monitoring Query:**
```sql
SELECT 
  datname,
  count(*) as connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
GROUP BY datname;
```

**Prisma Connection Pool:**
- Monitor pool usage via application logs
- Watch for "Connection pool timeout" errors
- Adjust `connection_limit` in `DATABASE_URL` if needed

### Query Performance Monitoring

**Key Metrics:**
- Slow queries: Queries taking > 200ms (see `docs/query-optimization-review.md`)
- Query execution time: Average and p95/p99 latencies
- Database CPU usage: Should be < 80% under normal load
- Database I/O: Disk read/write operations

**Monitoring Tools:**
- **pg_stat_statements**: Built-in PostgreSQL extension for query statistics
- **pgAdmin**: GUI tool for database monitoring
- **Prometheus + postgres_exporter**: Metrics collection
- **Grafana**: Visualization and dashboards

**Enable Query Logging:**
```sql
-- Enable slow query log
ALTER DATABASE helpdesk SET log_min_duration_statement = 200;
```

### Database Size Monitoring

**Monitor Database Growth:**
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('helpdesk'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Growth Factors:**
- Ticket data (title, description, metadata)
- Comments (text content)
- Audit events (change history)
- Attachments (if stored in database - not recommended)

### Replication Lag (if using read replicas)

**Monitor Replication:**
```sql
-- On replica
SELECT 
  pg_last_wal_receive_lsn(),
  pg_last_wal_replay_lsn(),
  pg_last_wal_replay_lsn() - pg_last_wal_receive_lsn() AS lag_bytes;
```

**Alert Thresholds:**
- Warning: Lag > 1 MB
- Critical: Lag > 10 MB or replication stopped

### Recommended Monitoring Tools

1. **pgAdmin**: GUI tool for PostgreSQL administration
2. **Prometheus + postgres_exporter**: Metrics collection and alerting
3. **Grafana**: Visualization dashboards
4. **pg_stat_statements**: Query performance analysis
5. **Cloud Provider Tools**: AWS RDS Monitoring, Google Cloud SQL Insights, etc.

### Alerting Recommendations

**Critical Alerts:**
- Database connection failures
- Database disk space < 20%
- Replication lag > 10 MB (if using replicas)
- Query execution time > 1 second (p95)

**Warning Alerts:**
- Connection pool usage > 80%
- Database CPU usage > 80%
- Database disk space < 40%
- Query execution time > 500ms (p95)

---

## Related Documentation

- [Deployment Guide](./deployment.md) - Step-by-step deployment instructions
- [Environment Variables](./environment-variables.md) - Configuration reference
- [Backup and Restore](./backup-restore.md) - Database backup procedures
- [Database Migrations](./database-migrations.md) - Migration procedures
- [Query Optimization Review](./query-optimization-review.md) - Performance guidelines



