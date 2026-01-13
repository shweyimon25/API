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

  // Check if admin user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: adminData.email },
  });

  if (existingUser) {
    console.log("Admin User already exists, skipping...");
    return;
  }

  // Create admin user first without role (role will be assigned later)
  const adminUser = await prisma.user.create({
    data: {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      username: adminData.username,
      status: Status.ACTIVE,
    },
  });

  // Assign SuperAdmin role if it exists
  const superAdminRole = await prisma.role.findFirst({
    where: { name: "SuperAdmin" },
  });

  if (superAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;