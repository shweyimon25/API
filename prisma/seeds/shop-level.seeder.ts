import { Status } from "@prisma/client";
import prisma from "../client";

const ShopLevelSeeder = async () => {
  console.log("Shop level seeding ...");

  const shopLevels = [
    {
      name: "Level 3",
      price: 25000,
      duration: 3,
      postLimit: 20,
      description: JSON.stringify({
        pros: "can have post count for shop posts, can post all monthly items, No limited posts",
        cons: "No cons at all",
      }),
      status: Status.ACTIVE,
    },
    {
      name: "Level 2",
      price: 5000,
      duration: 2,
      postLimit: 10,
      description: JSON.stringify({
        pros: "can have post count for shop posts, can post some monthly items",
        cons: "10 Limited shop posts, can be difficult to post all items",
      }),
      status: Status.ACTIVE,
    },
    {
      name: "Level 1",
      price: 15000,
      duration: 1,
      postLimit: 15,
      description: JSON.stringify({
        pros: "can have post count for shop posts, can post half of monthly items",
        cons: "15 Limited shop posts, can be difficult to post all items",
      }),
      status: Status.ACTIVE,
    },
    {
      name: "Shop Plan-1",
      price: 1000,
      duration: 3,
      postLimit: 15,
      description: JSON.stringify({
        pros: "15 Limited shop posts, can be difficult to post all items",
        cons: null,
      }),
      status: Status.ACTIVE,
    },
    {
      name: "Free",
      price: 0,
      duration: 0,
      postLimit: 10,
      description: null,
      status: Status.ACTIVE,
    },
  ];

  for (const shopLevel of shopLevels) {
    await prisma.shopLevel.upsert({
      where: { name: shopLevel.name },
      update: {
        price: shopLevel.price,
        duration: shopLevel.duration,
        postLimit: shopLevel.postLimit,
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
