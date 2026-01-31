const { PrismaClient } = require("@prisma/client");
const defaultPermissions = require("../prisma/default-permissions");

const prisma = new PrismaClient();

function parseArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function main() {
  const tenantId = process.env.TENANT_ID ?? parseArg("tenant");
  const adminUserId = process.env.ADMIN_USER_ID ?? parseArg("adminUserId");
  const adminEmail = process.env.ADMIN_EMAIL ?? parseArg("adminEmail");

  const permissionRecords = [];
  for (const permission of defaultPermissions) {
    const record = await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        type: permission.type ?? "ACTION",
        description: permission.description ?? null
      },
      create: {
        code: permission.code,
        name: permission.name,
        type: permission.type ?? "ACTION",
        description: permission.description ?? null
      }
    });
    permissionRecords.push(record);
  }

  if (tenantId) {
    const role = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId,
          code: "ADMIN"
        }
      },
      update: {
        name: "Admin",
        dataScope: "ALL",
        status: "ACTIVE"
      },
      create: {
        tenantId,
        code: "ADMIN",
        name: "Admin",
        dataScope: "ALL",
        status: "ACTIVE"
      }
    });

    for (const permission of permissionRecords) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }

    let user = null;
    if (adminUserId) {
      user = await prisma.user.findFirst({
        where: { id: adminUserId, tenantId }
      });
    } else if (adminEmail) {
      user = await prisma.user.findFirst({
        where: { email: adminEmail, tenantId }
      });
    }

    if (user) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id
        }
      });
    }
  }

  console.log("RBAC initialization completed.");
}

main()
  .catch((error) => {
    console.error("RBAC initialization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
