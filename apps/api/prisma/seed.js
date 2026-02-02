const { PrismaClient } = require("@prisma/client");

const { randomBytes, scryptSync } = require("node:crypto");
const defaultPermissions = require("./default-permissions");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function resetSerial(table) {
  const sql =
    `SELECT setval(pg_get_serial_sequence('"${table}"','serialId'), ` +
    `COALESCE((SELECT MAX("serialId") FROM "${table}"), 0));`;
  await prisma.$executeRawUnsafe(sql);
}

const ids = {
  tenant: "00000000-0000-0000-0000-000000000001",
  orgUnit: "00000000-0000-0000-0000-000000000002",
  user: "00000000-0000-0000-0000-000000000003",
  role: "00000000-0000-0000-0000-000000000004",
  permission: "00000000-0000-0000-0000-000000000005",
  account: "00000000-0000-0000-0000-000000000006",
  contact: "00000000-0000-0000-0000-000000000007",
  lead: "00000000-0000-0000-0000-000000000008",
  opportunity: "00000000-0000-0000-0000-000000000009",
  activity: "00000000-0000-0000-0000-000000000010",
};

const serialIds = {
  tenant: 1,
  orgUnit: 1,
  user: 1,
  role: 1,
  account: 1,
  contact: 1,
  lead: 1,
  opportunity: 1,
  activity: 1,
};

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: ids.tenant },
    update: {
      serialId: serialIds.tenant,
    },
    create: {
      id: ids.tenant,
      serialId: serialIds.tenant,
      name: "Acme Corp",
      code: "ACME",
      timezone: "Asia/Shanghai",
      locale: "zh-CN",
      baseCurrency: "CNY",
    },
  });

  const orgUnit = await prisma.orgUnit.upsert({
    where: { id: ids.orgUnit },
    update: {
      serialId: serialIds.orgUnit,
    },
    create: {
      id: ids.orgUnit,
      serialId: serialIds.orgUnit,
      tenantId: tenant.id,
      name: "Sales CN",
      code: "SALES_CN",
      type: "Sales",
      path: "/Sales/CN",
    },
  });

  const user = await prisma.user.upsert({
    where: { id: ids.user },
    update: {
      serialId: serialIds.user,
      email: "admin@acme.test",
      name: "Admin",
      passwordHash: hashPassword("Admin#123"),
      status: "ACTIVE",
    },
    create: {
      id: ids.user,
      serialId: serialIds.user,
      tenantId: tenant.id,
      email: "admin@acme.test",
      name: "Admin",
      passwordHash: hashPassword("Admin#123"),
      status: "ACTIVE",
    },
  });

  const role = await prisma.role.upsert({
    where: { id: ids.role },
    update: {
      serialId: serialIds.role,
      tenantId: tenant.id,
      code: "ADMIN",
      name: "Admin",
      dataScope: "ALL",
      status: "ACTIVE",
    },
    create: {
      id: ids.role,
      serialId: serialIds.role,
      tenantId: tenant.id,
      code: "ADMIN",
      name: "Admin",
      dataScope: "ALL",
      status: "ACTIVE",
    },
  });

  const permissionRecords = [];
  for (const [index, permission] of defaultPermissions.entries()) {
    const record = await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        serialId: index + 1,
        name: permission.name,
        type: permission.type ?? "ACTION",
        description: permission.description ?? null,
      },
      create: {
        serialId: index + 1,
        code: permission.code,
        name: permission.name,
        type: permission.type ?? "ACTION",
        description: permission.description ?? null,
      },
    });
    permissionRecords.push(record);
  }

  for (const permission of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });

  await prisma.userOrgMembership.upsert({
    where: {
      userId_orgUnitId: {
        userId: user.id,
        orgUnitId: orgUnit.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      orgUnitId: orgUnit.id,
      roleInOrg: "Manager",
    },
  });

  const account = await prisma.account.upsert({
    where: { id: ids.account },
    update: {
      serialId: serialIds.account,
    },
    create: {
      id: ids.account,
      serialId: serialIds.account,
      tenantId: tenant.id,
      orgUnitId: orgUnit.id,
      ownerId: user.id,
      name: "Acme Manufacturing",
      type: "Customer",
      industry: "Manufacturing",
      rating: "A",
      lifecycleStatus: "Active",
    },
  });

  const contact = await prisma.contact.upsert({
    where: { id: ids.contact },
    update: {
      serialId: serialIds.contact,
    },
    create: {
      id: ids.contact,
      serialId: serialIds.contact,
      tenantId: tenant.id,
      orgUnitId: orgUnit.id,
      ownerId: user.id,
      accountId: account.id,
      name: "Li Wei",
      title: "Procurement Manager",
      email: "li.wei@acme.test",
      phone: "+86-10-5555-0001",
      role: "Decision Maker",
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: ids.lead },
    update: {
      serialId: serialIds.lead,
    },
    create: {
      id: ids.lead,
      serialId: serialIds.lead,
      tenantId: tenant.id,
      orgUnitId: orgUnit.id,
      ownerId: user.id,
      status: "NEW",
      name: "Acme Factory Expansion",
      source: "Web",
      rating: "Hot",
      expectedValue: 1200000,
      accountId: account.id,
      contactId: contact.id,
      description: "New production line purchase inquiry.",
    },
  });

  await prisma.opportunity.upsert({
    where: { id: ids.opportunity },
    update: {
      serialId: serialIds.opportunity,
    },
    create: {
      id: ids.opportunity,
      serialId: serialIds.opportunity,
      tenantId: tenant.id,
      orgUnitId: orgUnit.id,
      ownerId: user.id,
      status: "OPEN",
      name: "Acme Q2 Expansion Deal",
      stage: "Qualification",
      amount: 1500000,
      currency: "CNY",
      probability: 0.35,
      accountId: account.id,
      contactId: contact.id,
      leadId: lead.id,
    },
  });

  await prisma.activity.upsert({
    where: { id: ids.activity },
    update: {
      serialId: serialIds.activity,
    },
    create: {
      id: ids.activity,
      serialId: serialIds.activity,
      tenantId: tenant.id,
      orgUnitId: orgUnit.id,
      ownerId: user.id,
      status: "OPEN",
      type: "Call",
      subject: "Intro call with procurement",
      relatedType: "Lead",
      relatedId: lead.id,
    },
  });

  await Promise.all([
    resetSerial("Tenant"),
    resetSerial("OrgUnit"),
    resetSerial("User"),
    resetSerial("Role"),
    resetSerial("Permission"),
    resetSerial("Account"),
    resetSerial("Contact"),
    resetSerial("Lead"),
    resetSerial("Opportunity"),
    resetSerial("Activity"),
  ]);

  console.log("Seed completed:", {
    tenantId: tenant.id,
    orgUnitId: orgUnit.id,
    userId: user.id,
    accountId: account.id,
    contactId: contact.id,
    leadId: lead.id,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
