import { Status } from "@prisma/client";
import { hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const adminUserSeeder = async () => {
  console.log("Admin User seeding ...");

  const adminData = {
    name: "Admin",
    email: "admin@admin.com",
    username: "admin",
    password: hashPassword("admin"),
  };

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SuperAdmin" },
  });

  if (!superAdminRole) {
    throw new Error("SuperAdmin role not found. Please run role seeder first.");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminData.email },
  });

  await prisma.user.create({
    data: {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      username: adminData.username,
      status: Status.ACTIVE,
      roles: {
        create: {
          role: { connect: { id: superAdminRole.id } },
        },
      },
    },
  });

  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;