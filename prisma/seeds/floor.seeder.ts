import { faker } from "@faker-js/faker";
import prisma from "../client";

const floorSeeder = async () => {
  console.log("Floors seeding ...");

  for (let i = 0; i < 10; i++) {
    await prisma.floor.upsert({
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

  console.log("Floors seeding successfully");
};

export default floorSeeder;
