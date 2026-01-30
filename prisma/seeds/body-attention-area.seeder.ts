import { Status } from "@prisma/client";
import prisma from "../client";

const BodyAttentionAreaSeeder = async () => {
  console.log("Body attention area seeding ...");

  const bodyAttentionAreas = ["Back", "Chest", "Arms", "Abs", "Butt", "Legs"];

  for (const bodyAttentionArea of bodyAttentionAreas) {
    await prisma.bodyAttentionArea.upsert({
      where: { name: bodyAttentionArea },
      update: { status: Status.ACTIVE },
      create: {
        name: bodyAttentionArea,
        createdById: 1,
      },
    });
  }

  console.log("Body attention area seeded successfully");
};

export default BodyAttentionAreaSeeder;
