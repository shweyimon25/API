import { Permission } from "@prisma/client";
import prisma from "../client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles = ["SuperAdmin", "Admin"];
  const allPermissions = await prisma.permission.findMany();

  for (const roleName of roles) {
    await prisma.role.create({
      data: {
        name: roleName,
        createdById: 1,
        permissions: {
          create: allPermissions.map((permission: Permission) => ({
            permission: { connect: { id: permission.id } },
          }))
        },
      },
    });

    console.log("Roles seeded successfully");
  }
};

export default roleSeeder;
