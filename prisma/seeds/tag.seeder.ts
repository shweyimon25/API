import { Status } from "@prisma/client";
import prisma from "../client";

const tagSeeder = async () => {
  console.log("Tags seeding ...");

  const tags = ["Social", "Fitness", "Wellness", "Other"];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag },
      update: { status: Status.ACTIVE },
      create: {
        name: tag,
        createdById: 1,
      },
    });
  }

  console.log("Tags seeded successfully");
};

export default tagSeeder;
