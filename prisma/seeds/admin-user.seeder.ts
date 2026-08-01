import { Status } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../client";

const adminUserSeeder = async () => {
  console.log("Admin User seeding ...");

  const developerRole = await prisma.role.findUnique({
    where: { name: "Developer" },
  });

  if (!developerRole) {
    throw new Error("Developer role not found. Seed roles first.");
  }

  const adminUsers = [
    {
      name: "SystemAdmin",
      email: "systemadmin@ayabank.com",
      employeeId: "00000",
      password: bcrypt.hashSync("@dminP@55", 10),
      status: Status.ACTIVE,
      roleId: developerRole.id,
    },
  ];

  for (const adminUser of adminUsers) {
    await prisma.user.upsert({
      where: { email: adminUser.email },
      update: {
        name: adminUser.name,
        employeeId: adminUser.employeeId,
        password: adminUser.password,
        status: adminUser.status,
        roleId: adminUser.roleId,
      },
      create: adminUser,
    });
  }

  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;
