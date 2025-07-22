import { hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const adminSeeder = async () => {
  console.log("Admin users seeding ...");

  const admins = [
    {
      name: "Admin",
      email: "admin@admin.com",
      password: hashPassword("@dminP@55"),
    },
    {
      name: "RestaurantAdmin",
      email: "restaurantadmin@restaurantadmin.com",
      password: hashPassword("@dminP@55"),
    },
  ];

  for (const admin of admins) {
    await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        roles: {
          connect: {
            id: admin.name === "Admin" ? 0 : 1,
          },
        },
      },
    });
  }

  console.log("Admin users seeding successfully");
};

export default adminSeeder;
