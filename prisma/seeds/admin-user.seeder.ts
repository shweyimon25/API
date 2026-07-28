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

  const adminData = {
    name: "Developer",
    email: "developer@ayabank.com",
    employeeId: "0000",
    password: bcrypt.hashSync("Developer@123", 10),
    status: Status.ACTIVE,
    roleId: developerRole.id,
  };

  await prisma.user.upsert({
    where: { email: adminData.email },
    update: {
      name: adminData.name,
      employeeId: adminData.employeeId,
      password: adminData.password,
      status: adminData.status,
      roleId: adminData.roleId,
    },
    create: adminData,
  });

  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;
