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

  await prisma.user.upsert({
    where: { email: adminData.email },
    update: {
      name: adminData.name,
      password: adminData.password,
      roles: {
        upsert: {
          where: {
            userId_roleId: {
              userId: 0,
              roleId: superAdminRole.id,
            },
          },
          create: {
            role: { connect: { id: superAdminRole.id } },
          },
          update: {},
        },
      },
    },
    create: {
      ...adminData,
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
