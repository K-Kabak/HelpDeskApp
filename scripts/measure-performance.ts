import { prisma } from "../src/lib/prisma";
import { getTicketPage } from "../src/lib/ticket-list";

interface MeasurementResult {
  query: string;
  duration: number;
  count: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

async function measurePerformance() {
  const user = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!user) {
    console.error("No admin user found. Please seed the database.");
    return;
  }

  const authenticatedUser = {
    id: user.id,
    role: user.role,
    organizationId: user.organizationId,
  };

  const measurements: MeasurementResult[] = [];
  const iterations = 10;

  console.log("=== Performance Measurement ===\n");
  console.log(`Running ${iterations} iterations per query...\n`);

  // 1. Ticket List (20 items) - Basic query
  console.log("1. Measuring Ticket List (20 items)...");
  const listDurations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await getTicketPage(authenticatedUser, { limit: 20 });
    const end = performance.now();
    listDurations.push(end - start);
  }
  listDurations.sort((a, b) => a - b);
  measurements.push({
    query: "Ticket List (20 items)",
    duration: listDurations[Math.floor(iterations / 2)],
    count: iterations,
    p50: listDurations[Math.floor(iterations * 0.5)],
    p95: listDurations[Math.floor(iterations * 0.95)],
    p99: listDurations[Math.floor(iterations * 0.99)],
  });

  // 2. Ticket List with Status Filter
  console.log("2. Measuring Ticket List with Status Filter...");
  const filteredDurations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await getTicketPage(authenticatedUser, { 
      limit: 20, 
      status: "NOWE" 
    });
    const end = performance.now();
    filteredDurations.push(end - start);
  }
  filteredDurations.sort((a, b) => a - b);
  measurements.push({
    query: "Ticket List with Status Filter",
    duration: filteredDurations[Math.floor(iterations / 2)],
    count: iterations,
    p50: filteredDurations[Math.floor(iterations * 0.5)],
    p95: filteredDurations[Math.floor(iterations * 0.95)],
    p99: filteredDurations[Math.floor(iterations * 0.99)],
  });

  // 3. Ticket Search
  console.log("3. Measuring Ticket Search...");
  const searchDurations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await getTicketPage(authenticatedUser, { 
      limit: 20, 
      search: "Load" 
    });
    const end = performance.now();
    searchDurations.push(end - start);
  }
  searchDurations.sort((a, b) => a - b);
  measurements.push({
    query: "Ticket Search",
    duration: searchDurations[Math.floor(iterations / 2)],
    count: iterations,
    p50: searchDurations[Math.floor(iterations * 0.5)],
    p95: searchDurations[Math.floor(iterations * 0.95)],
    p99: searchDurations[Math.floor(iterations * 0.99)],
  });

  // 4. Ticket Detail with Relations
  console.log("4. Measuring Ticket Detail with Relations...");
  const ticket = await prisma.ticket.findFirst();
  if (ticket) {
    const detailDurations: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const result = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          requester: true,
          assigneeUser: true,
          assigneeTeam: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
          attachments: {
            include: { uploader: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      const end = performance.now();
      detailDurations.push(end - start);
    }
    detailDurations.sort((a, b) => a - b);
    measurements.push({
      query: "Ticket Detail with Relations",
      duration: detailDurations[Math.floor(iterations / 2)],
      count: iterations,
      p50: detailDurations[Math.floor(iterations * 0.5)],
      p95: detailDurations[Math.floor(iterations * 0.95)],
      p99: detailDurations[Math.floor(iterations * 0.99)],
    });
  }

  // 5. Admin Audit Logs
  console.log("5. Measuring Admin Audit Logs...");
  const auditDurations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await prisma.adminAudit.findMany({
      where: { organizationId: user.organizationId ?? "" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    const end = performance.now();
    auditDurations.push(end - start);
  }
  auditDurations.sort((a, b) => a - b);
  measurements.push({
    query: "Admin Audit Logs (20 items)",
    duration: auditDurations[Math.floor(iterations / 2)],
    count: iterations,
    p50: auditDurations[Math.floor(iterations * 0.5)],
    p95: auditDurations[Math.floor(iterations * 0.95)],
    p99: auditDurations[Math.floor(iterations * 0.99)],
  });

  // Print results
  console.log("\n=== Results ===\n");
  console.log("Query Type".padEnd(35) + "P50".padEnd(10) + "P95".padEnd(10) + "P99".padEnd(10) + "Target".padEnd(10) + "Status");
  console.log("-".repeat(85));
  
  const targets: Record<string, number> = {
    "Ticket List (20 items)": 200,
    "Ticket List with Status Filter": 200,
    "Ticket Search": 100,
    "Ticket Detail with Relations": 100,
    "Admin Audit Logs (20 items)": 200,
  };

  measurements.forEach((m) => {
    const target = targets[m.query] || 200;
    const status = m.p95! <= target ? "✅ PASS" : "❌ FAIL";
    console.log(
      m.query.padEnd(35) +
      `${m.p50!.toFixed(2)}ms`.padEnd(10) +
      `${m.p95!.toFixed(2)}ms`.padEnd(10) +
      `${m.p99!.toFixed(2)}ms`.padEnd(10) +
      `<${target}ms`.padEnd(10) +
      status
    );
  });

  // Check if all targets are met
  const allPassed = measurements.every((m) => {
    const target = targets[m.query] || 200;
    return m.p95! <= target;
  });

  console.log("\n=== Summary ===");
  if (allPassed) {
    console.log("✅ All performance targets met!");
  } else {
    console.log("❌ Some performance targets not met. Review slow queries.");
  }

  return measurements;
}

measurePerformance()
  .catch(console.error)
  .finally(() => prisma.$disconnect());







