import { prisma } from "../src/lib/prisma";

async function verifyIndexUsage() {
  console.log("=== Verifying Index Usage ===\n");

  // Get a sample ticket
  const ticket = await prisma.ticket.findFirst();
  if (!ticket) {
    console.error("No tickets found. Please seed the database.");
    return;
  }

  // 1. Ticket list query (organizationId, createdAt)
  console.log("1. Ticket List Query (organizationId, createdAt DESC):");
  const plan1 = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT t.*, u1.*, u2.*, tm.*
    FROM "Ticket" t
    LEFT JOIN "User" u1 ON t."requesterId" = u1.id
    LEFT JOIN "User" u2 ON t."assigneeUserId" = u2.id
    LEFT JOIN "Team" tm ON t."assigneeTeamId" = tm.id
    WHERE t."organizationId" = ${ticket.organizationId}
    ORDER BY t."createdAt" DESC, t.id DESC
    LIMIT 20;
  `;
  const plan1Json = plan1 as any[];
  if (plan1Json[0]?.[0]?.Plan) {
    const plan = plan1Json[0][0].Plan;
    const usesIndex = JSON.stringify(plan).includes("Ticket_organizationId_createdAt_idx");
    console.log(`   Index Used: ${usesIndex ? "✅ Yes" : "❌ No"}`);
    console.log(`   Execution Time: ${plan["Execution Time"]?.toFixed(2)}ms`);
  }

  // 2. Ticket search query
  console.log("\n2. Ticket Search Query (organizationId, title, descriptionMd):");
  const plan2 = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT * FROM "Ticket"
    WHERE "organizationId" = ${ticket.organizationId}
      AND (title ILIKE '%Load%' OR "descriptionMd" ILIKE '%Load%')
    ORDER BY "createdAt" DESC
    LIMIT 20;
  `;
  const plan2Json = plan2 as any[];
  if (plan2Json[0]?.[0]?.Plan) {
    const plan = plan2Json[0][0].Plan;
    const usesIndex = JSON.stringify(plan).includes("Ticket_search_idx");
    console.log(`   Index Used: ${usesIndex ? "✅ Yes" : "❌ No"}`);
    console.log(`   Execution Time: ${plan["Execution Time"]?.toFixed(2)}ms`);
  }

  // 3. Comment query (ticketId, createdAt)
  console.log("\n3. Comment Query (ticketId, createdAt):");
  const plan3 = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT * FROM "Comment"
    WHERE "ticketId" = ${ticket.id}
    ORDER BY "createdAt" ASC;
  `;
  const plan3Json = plan3 as any[];
  if (plan3Json[0]?.[0]?.Plan) {
    const plan = plan3Json[0][0].Plan;
    const usesIndex = JSON.stringify(plan).includes("Comment_ticketId_createdAt_idx");
    console.log(`   Index Used: ${usesIndex ? "✅ Yes" : "❌ No"}`);
    console.log(`   Execution Time: ${plan["Execution Time"]?.toFixed(2)}ms`);
  }

  // 4. Admin Audit query (organizationId, createdAt DESC)
  console.log("\n4. Admin Audit Query (organizationId, createdAt DESC):");
  const plan4 = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT * FROM "AdminAudit"
    WHERE "organizationId" = ${ticket.organizationId}
    ORDER BY "createdAt" DESC
    LIMIT 20;
  `;
  const plan4Json = plan4 as any[];
  if (plan4Json[0]?.[0]?.Plan) {
    const plan = plan4Json[0][0].Plan;
    const usesIndex = JSON.stringify(plan).includes("AdminAudit_organizationId_createdAt_idx");
    console.log(`   Index Used: ${usesIndex ? "✅ Yes" : "❌ No"}`);
    console.log(`   Execution Time: ${plan["Execution Time"]?.toFixed(2)}ms`);
  }

  console.log("\n=== Index Verification Complete ===");
}

verifyIndexUsage()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

