import { faker } from "@faker-js/faker";
import prisma from "../client";

const typeSeeder = async () => {
  console.log("Types seeding ...");

  for (let i = 0; i < 10; i++) {
    await prisma.type.upsert({
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

  console.log("Types seeding successfully");
};

export default typeSeeder;
