import { Status } from "@prisma/client";
import prisma from "../client";

const ShopLevelSeeder = async () => {
  console.log("Shop level seeding ...");

  const shopLevels = [
    { name: "Level 1", price: 10000, duration: 30, description: "Level 1", status: Status.ACTIVE },
    { name: "Level 2", price: 20000, duration: 60, description: "Level 2", status: Status.ACTIVE },
    { name: "Level 3", price: 30000, duration: 90, description: "Level 3", status: Status.ACTIVE },
  ];

  for (const shopLevel of shopLevels) {
    await prisma.shopLevel.upsert({
      where: { name: shopLevel.name },
      update: {
        price: shopLevel.price,
        duration: shopLevel.duration,
        description: shopLevel.description,
        status: shopLevel.status,
      },
      create: {
        ...shopLevel,
        createdById: 1,
      },
    });
  }

  console.log("Shop level seeded successfully");
};

export default ShopLevelSeeder;
