import { Permission } from "@prisma/client";
import prisma from "../client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles = ["SuperAdmin", "Admin"];
  const allPermissions = await prisma.permission.findMany();

  for (const roleName of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: roleName },
      include: { permissions: true },
    });

    if (existing) {
      const existingPermissionIds = new Set(
        existing.permissions.map((p) => p.permissionId)
      );
      const toConnect = allPermissions.filter(
        (p) => !existingPermissionIds.has(p.id)
      );
      if (toConnect.length > 0) {
        await prisma.rolePermission.createMany({
          data: toConnect.map((permission: Permission) => ({
            roleId: existing.id,
            permissionId: permission.id,
          })),
          skipDuplicates: true,
        });
      }
    } else {
      await prisma.role.create({
        data: {
          name: roleName,
          createdById: 1,
          permissions: {
            create: allPermissions.map((permission: Permission) => ({
              permission: { connect: { id: permission.id } },
            })),
          },
        },
      });
    }
  }

  console.log("Roles seeded successfully");
};

export default roleSeeder;
