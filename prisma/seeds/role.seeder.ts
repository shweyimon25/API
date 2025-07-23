import { Permission } from "@prisma/client";
import prisma from "../client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles = [{ name: "SuperAdmin" }, { name: "RestaurantAdmin" }];
  const allPermissions = await prisma.permission.findMany();

  for (const role of roles) {
    await prisma.role.create({
      data: {
        name: role.name,
        permissions: {
          create: role.name == "RestaurantAdmin" ? [] : allPermissions.map((permission: Permission) => ({
            permission: {
              connect: {
                id: permission.id,
              },
            },
          })),
        },
      },
    });
  }

  console.log("Roles seeding successfully");
};

export default roleSeeder;
