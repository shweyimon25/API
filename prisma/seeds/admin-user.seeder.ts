import { hashPassword } from './../../app/helpers/helper';
import prisma from "../client";

const adminUserSeeder = async () => {
  console.log("Admin User seeding ...");

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@admin.com",
      username: "admin",
      password: hashPassword("admin"),
      roles: {
        create: {
          role: {
            connect: {
              name: "SuperAdmin",
            },
          },
        },
      },
    },
  });

  console.log("Admin User seeding successfully");
};

export default adminUserSeeder;
