import { faker } from "@faker-js/faker";
import prisma from "../client";

const drinkSeeder = async () => {
  console.log("Drinks seeding ...");

  for (let i = 0; i < 10; i++) {
    await prisma.drink.upsert({
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

  console.log("Drinks seeding successfully");
};

export default drinkSeeder;
