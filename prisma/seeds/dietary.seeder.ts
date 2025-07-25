import { faker } from "@faker-js/faker";
import prisma from "../client";

const dietarySeeder = async () => {
  console.log("Dietary seeding ...");

  for (let i = 0; i < 10; i++) {
    await prisma.dietary.upsert({
      where: {
        id: i,
      },
      update: {
        name: faker.lorem.word(),
      },
      create: {
        name: faker.lorem.word(),
      },
    });
  }

  console.log("Dietary seeding successfully");
};

export default dietarySeeder;
