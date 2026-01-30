import { Status } from "@prisma/client";
import prisma from "../client";

const DietTypeSeeder = async () => {
  console.log("Diet type seeding ...");

  const dietTypes = [
    "traditional",
    "pescatarian",
    "keto",
    "fasting",
    "vegan",
    "keto vegan",
    "lactose free",
  ];

  for (const dietType of dietTypes) {
    await prisma.dietType.upsert({
      where: { name: dietType },
      update: { status: Status.ACTIVE },
      create: {
        name: dietType,
        createdById: 1,
      },
    });
  }

  console.log("Diet type seeded successfully");
};

export default DietTypeSeeder;
