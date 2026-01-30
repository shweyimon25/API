import { Status } from "@prisma/client";
import prisma from "../client";

const PhysicalLimitaionSeeder = async () => {
  console.log("Physical limitation seeding ...");

  const physicalLimitations = ["none", "back pain", "knee pain", "limited mobility", "other"];

  for (const physicalLimitation of physicalLimitations) {
    await prisma.physicalLimitation.upsert({
      where: { name: physicalLimitation },
      update: { status: Status.ACTIVE },
      create: {
        name: physicalLimitation,
        createdById: 1,
      },
    });
  }

  console.log("Physical limitation seeded successfully");
};

export default PhysicalLimitaionSeeder;
