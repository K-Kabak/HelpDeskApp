/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Role, TicketPriority, TicketStatus } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { name: "Demo" },
    update: {},
    create: { name: "Demo" },
  });

  const adminPassword = await bcrypt.hash("Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@serwisdesk.local" },
    update: {},
    create: {
      email: "admin@serwisdesk.local",
      name: "Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });

  const requesterPassword = await bcrypt.hash("Requester123!", 10);
  const agentPassword = await bcrypt.hash("Agent123!", 10);

  const requester = await prisma.user.upsert({
    where: { email: "requester@serwisdesk.local" },
    update: {},
    create: {
      email: "requester@serwisdesk.local",
      name: "Requester",
      passwordHash: requesterPassword,
      role: Role.REQUESTER,
      organizationId: org.id,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@serwisdesk.local" },
    update: {},
    create: {
      email: "agent@serwisdesk.local",
      name: "Agent",
      passwordHash: agentPassword,
      role: Role.AGENT,
      organizationId: org.id,
    },
  });

  await prisma.notificationPreference.createMany({
    data: [
      { userId: admin.id },
      { userId: requester.id },
      { userId: agent.id },
    ],
    skipDuplicates: true,
  });

  const team = await prisma.team.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: "IT Support",
      },
    },
    update: {},
    create: {
      name: "IT Support",
      organizationId: org.id,
      memberships: {
        create: [{ userId: agent.id }],
      },
    },
  });

  const managementTeam = await prisma.team.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: "IT Managers",
      },
    },
    update: {},
    create: {
      name: "IT Managers",
      organizationId: org.id,
    },
  });

  await prisma.tag.createMany({
    data: [
      { name: "VPN", organizationId: org.id },
      { name: "Laptop", organizationId: org.id },
      { name: "Sieć", organizationId: org.id },
    ],
    skipDuplicates: true,
  });


  await prisma.category.createMany({
    data: [
      { name: "Networking", description: "Connectivity, VPN, Wi-Fi, firewalls", organizationId: org.id },
      { name: "Hardware", description: "Laptops, peripherals, printers", organizationId: org.id },
      { name: "Software", description: "Applications, licensing, configuration", organizationId: org.id },
    ],
    skipDuplicates: true,
  });

  const networkingCategory = await prisma.category.findFirst({
    where: { organizationId: org.id, name: "Networking" },
    select: { id: true },
  });

  const slaData = [
    { priority: TicketPriority.NISKI, firstResponseHours: 24, resolveHours: 72 },
    { priority: TicketPriority.SREDNI, firstResponseHours: 8, resolveHours: 48 },
    { priority: TicketPriority.WYSOKI, firstResponseHours: 4, resolveHours: 24 },
    { priority: TicketPriority.KRYTYCZNY, firstResponseHours: 1, resolveHours: 8 },
  ];
  for (const entry of slaData) {
    const existing = await prisma.slaPolicy.findFirst({
      where: {
        organizationId: org.id,
        priority: entry.priority,
        categoryId: null,
      },
    });
    if (existing) {
      await prisma.slaPolicy.update({
        where: { id: existing.id },
        data: {
          firstResponseHours: entry.firstResponseHours,
          resolveHours: entry.resolveHours,
        },
      });
    } else {
      await prisma.slaPolicy.create({
        data: {
          organizationId: org.id,
          priority: entry.priority,
          firstResponseHours: entry.firstResponseHours,
          resolveHours: entry.resolveHours,
        },
      });
    }
  }

  if (networkingCategory) {
    const existingNetworking = await prisma.slaPolicy.findFirst({
      where: {
        organizationId: org.id,
        priority: TicketPriority.WYSOKI,
        categoryId: networkingCategory.id,
      },
    });
    if (existingNetworking) {
      await prisma.slaPolicy.update({
        where: { id: existingNetworking.id },
        data: { firstResponseHours: 2, resolveHours: 12 },
      });
    } else {
      await prisma.slaPolicy.create({
        data: {
          organizationId: org.id,
          priority: TicketPriority.WYSOKI,
          categoryId: networkingCategory.id,
          firstResponseHours: 2,
          resolveHours: 12,
        },
      });
    }
  }

  await prisma.slaEscalationLevel.createMany({
    data: [
      {
        organizationId: org.id,
        priority: TicketPriority.WYSOKI,
        categoryId: networkingCategory?.id ?? null,
        level: 1,
        teamId: team.id,
      },
      {
        organizationId: org.id,
        priority: TicketPriority.WYSOKI,
        categoryId: networkingCategory?.id ?? null,
        level: 2,
        teamId: managementTeam.id,
      },
    ],
    skipDuplicates: true,
  });

  const demoTicket = await prisma.ticket.create({
    data: {
      title: "Brak dostępu do VPN",
      descriptionMd: "Nie mogę połączyć się z VPN od rana.",
      status: TicketStatus.NOWE,
      priority: TicketPriority.WYSOKI,
      category: "Sieć",
      requesterId: requester.id,
      organizationId: org.id,
      assigneeTeamId: team.id,
      tags: {
        create: [
          {
            tag: {
              connect: {
                organizationId_name: { organizationId: org.id, name: "VPN" },
              },
            },
          },
        ],
      },
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: demoTicket.id,
      authorId: requester.id,
      bodyMd: "Problem pojawił się po aktualizacji.",
      isInternal: false,
    },
  });

  await prisma.auditEvent.create({
    data: {
      ticketId: demoTicket.id,
      actorId: admin.id,
      action: "TICKET_CREATED",
      data: { status: TicketStatus.NOWE, priority: TicketPriority.WYSOKI },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
