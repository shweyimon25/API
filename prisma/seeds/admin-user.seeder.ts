import { Status } from "@prisma/client";
import { hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const adminUserSeeder = async () => {
  console.log("Admin User seeding ...");

  const adminData = {
    name: "Admin",
    email: "admin@admin.com",
    username: "admin",
    password: hashPassword("Admin@123"),
    status: Status.ACTIVE,
  };

  await prisma.user.upsert({
    where: { email: adminData.email },
    update: {
      name: adminData.name,
      username: adminData.username,
      password: adminData.password,
      status: adminData.status,
    },
    create: {
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      username: adminData.username,
      status: adminData.status,
    },
  });

  // Role assignment happens in main.ts (assignAdminRole) after roleSeeder runs
  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;