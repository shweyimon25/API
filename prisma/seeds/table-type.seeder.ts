import { faker } from "@faker-js/faker";
import prisma from "../client";

const tableTypeSeeder = async () => {
  console.log("Table types seeding ...");

  for (let i = 0; i < 10; i++) {
    await prisma.tableType.upsert({
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

  console.log("Table types seeding successfully");
};

export default tableTypeSeeder;
