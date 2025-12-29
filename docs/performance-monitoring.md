# Performance Monitoring Guide

This document describes the performance monitoring approach for HelpDeskApp.

## Overview

HelpDeskApp includes built-in performance monitoring for database queries to help identify slow queries and performance regressions.

## Query Timing

### Implementation

Query timing is implemented via a Prisma extension in `src/lib/prisma.ts`:

```typescript
export const prisma = prismaClient.$extends({
  query: {
    async $allOperations({ model, operation, args, query }) {
      const start = performance.now();
      const result = await query(args);
      const end = performance.now();
      const duration = end - start;
      
      if (process.env.LOG_QUERY_TIME === "true" || process.env.NODE_ENV === "development") {
        console.log(`[Prisma Query] ${model}.${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    },
  },
});
```

### Enabling Query Timing

Query timing is automatically enabled in development mode. For production:

```bash
LOG_QUERY_TIME=true npm start
```

### Log Format

Query timing logs follow this format:
```
[Prisma Query] Model.operation took X.XXms
```

Examples:
```
[Prisma Query] Ticket.findMany took 5.97ms
[Prisma Query] Comment.findMany took 2.34ms
[Prisma Query] User.findFirst took 1.26ms
```

## Performance Measurement

### Running Performance Tests

Use the performance measurement script to verify query performance:

```bash
npx tsx scripts/measure-performance.ts
```

This script:
- Runs 10 iterations of each query type
- Calculates P50, P95, and P99 latencies
- Compares results against performance targets
- Reports pass/fail status for each query type

### Performance Targets

See `docs/performance-budget.md` for detailed performance targets and current measurements.

## Monitoring in Production

### Log Collection

Query timing logs can be collected using:
- **Application Logs**: Query logs appear in application stdout/stderr
- **Log Aggregation**: Use tools like Datadog, New Relic, or CloudWatch to collect and analyze
- **Custom Metrics**: Extract query timing from logs and send to metrics systems

### Alerting

Set up alerts for:
- **Slow Queries**: Queries exceeding 2x target latency
- **Critical Queries**: Queries exceeding 5x target latency
- **Performance Regression**: Sudden increases in query latency

### Example Alert Rules

```yaml
# Example: Alert on slow ticket list queries
- alert: SlowTicketListQuery
  expr: query_duration_ms{query="Ticket.findMany"} > 400
  annotations:
    summary: "Ticket list query exceeds 2x target (200ms)"
    
# Example: Alert on critical query performance
- alert: CriticalQueryPerformance
  expr: query_duration_ms{query="Ticket.findMany"} > 1000
  annotations:
    summary: "Ticket list query exceeds 5x target (200ms)"
```

## Index Usage Verification

### Verifying Index Usage

Use the index verification script to check if queries are using indexes:

```bash
npx tsx scripts/verify-indexes.ts
```

This script uses PostgreSQL `EXPLAIN ANALYZE` to verify:
- Index usage for common query patterns
- Query execution time
- Index effectiveness

### Manual Verification

You can also verify index usage manually using PostgreSQL:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM "Ticket"
WHERE "organizationId" = '...'
ORDER BY "createdAt" DESC
LIMIT 20;
```

Look for `Index Scan` or `Index Only Scan` in the output.

## Performance Budget Enforcement

### Weekly Review

Review query performance logs weekly:
1. Identify slow queries (>100ms)
2. Check for performance regressions
3. Verify index usage
4. Optimize slow queries if needed

### Monthly Analysis

Monthly performance analysis should include:
1. Average query latency trends
2. P95/P99 latency trends
3. Query volume analysis
4. Index usage statistics
5. Performance optimization recommendations

## Troubleshooting

### Slow Queries

If queries are slow:
1. Check if indexes are being used (run `verify-indexes.ts`)
2. Review query execution plans
3. Check for missing indexes
4. Consider query optimization

### Missing Indexes

If indexes are not being used:
1. Verify indexes exist: `\d+ "Ticket"` in psql
2. Check query conditions match index columns
3. Consider adding composite indexes
4. Review index order (most selective first)

### Performance Regression

If performance degrades:
1. Compare current measurements with baseline
2. Check for new queries without indexes
3. Review database statistics (ANALYZE)
4. Check for table bloat (VACUUM)

## Best Practices

1. **Always measure**: Use the measurement script before and after optimizations
2. **Monitor continuously**: Enable query timing in production for ongoing monitoring
3. **Set alerts**: Configure alerts for slow queries
4. **Review regularly**: Weekly review of query performance
5. **Document changes**: Update performance budget doc when making optimizations

## Related Documentation

- `docs/performance-budget.md` - Performance targets and measurements
- `docs/query-optimization-review.md` - Query optimization analysis
- `docs/migration-review.md` - Database migration safety review











