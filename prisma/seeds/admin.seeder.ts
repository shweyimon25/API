import { hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const adminSeeder = async () => {
  console.log("Admin users seeding ...");

  const admins = [
    {
      name: "Admin",
      email: "admin@mail.com",
      password: hashPassword("@dminP@55"),
      roleId: 1
    },
    {
      name: "RestaurantAdmin",
      email: "restaurantadmin@mail.com",
      password: hashPassword("@dminP@55"),
      roleId: 2
    },
  ];

  for (let admin of admins) {
    await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        roles: {
          create: [
            {
              role: {
                connect: {
                  id: admin.roleId
                },
              },
            },
          ],
        },
      },
    });
  }

  console.log("Admin users seeding successfully");
};

export default adminSeeder;
