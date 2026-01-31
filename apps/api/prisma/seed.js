const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: ids.tenant },
    update: {},
    create: {
      id: ids.tenant,
      name: "Acme Corp",
      code: "ACME",
      timezone: "Asia/Shanghai",
      locale: "zh-CN",
      baseCurrency: "CNY",
    },
  });

  const orgUnit = await prisma.orgUnit.upsert({
    where: { id: ids.orgUnit },
    update: {},
    create: {
      id: ids.orgUnit,
      tenantId: tenant.id,
      name: "Sales CN",
      code: "SALES_CN",
      type: "Sales",
      path: "/Sales/CN",
    },
  });

  const user = await prisma.user.upsert({
    where: { id: ids.user },
    update: {},
    create: {
      id: ids.user,
      tenantId: tenant.id,
      email: "admin@acme.test",
      name: "Admin",
      status: "ACTIVE",
    },
  });

  const role = await prisma.role.upsert({
    where: { id: ids.role },
    update: {},
    create: {
      id: ids.role,
      tenantId: tenant.id,
      code: "ADMIN",
      name: "Admin",
      dataScope: "ALL",
      status: "ACTIVE",
    },
  });

  const permission = await prisma.permission.upsert({
    where: { id: ids.permission },
    update: {},
    create: {
      id: ids.permission,
      code: "crm:full_access",
      name: "CRM Full Access",
      type: "ACTION",
      description: "Full access to CRM modules",
    },
  });

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
    update: {},
    create: {
      id: ids.account,
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
    update: {},
    create: {
      id: ids.contact,
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
    update: {},
    create: {
      id: ids.lead,
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
    update: {},
    create: {
      id: ids.opportunity,
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
    update: {},
    create: {
      id: ids.activity,
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
