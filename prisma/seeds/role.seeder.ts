import prisma from "../client";
import { Permission } from "@prisma/client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles: {
    name: string;
    description: string;
    permission: Permission;
  }[] = [
    {
      name: "Developer",
      description: "Developer",
      permission: Permission.FULL_CONTROL,
    },
    {
      name: "HOD",
      description: "Head of Department",
      permission: Permission.FULL_CONTROL,
    },
    {
      name: "PM",
      description: "Product Manager",
      permission: Permission.PROJECT_MANAGEMENT,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permission: role.permission,
      },
      create: {
        name: role.name,
        description: role.description,
        permission: role.permission,
      },
    });
  }

  console.log("Roles seeded successfully");
};

export default roleSeeder;
