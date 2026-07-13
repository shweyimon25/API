import { Status } from "@prisma/client";
import prisma from "../client";

const categorySeeder = async () => {
  console.log("Categories seeding ...");

  const postCategories = ["Music", "Travel", "Food", "Tech", "Religion"];

  for (const postCategory of postCategories) {
    await prisma.postCategory.upsert({
      where: { name: postCategory },
      update: {},
      create: {
        name: postCategory,
      },
    });
  }

  console.log("Categories seeded successfully");
};

export default categorySeeder;
