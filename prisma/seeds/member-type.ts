import { Permission } from "@prisma/client";
import prisma from "../client";

const memberTypeSeeder = async () => {
  console.log("Member type seeding ...");

  const memberTypes = ["Gym Member", "Trainer Member"];

  for (const memberTypeName of memberTypes) {
    await prisma.memberType.upsert({
      where: { name: memberTypeName },
      update: {
        name: memberTypeName,
      },
      create: {
        name: memberTypeName,
      },
    });
  }

  console.log("Member type seeded successfully");
};

export default memberTypeSeeder;
