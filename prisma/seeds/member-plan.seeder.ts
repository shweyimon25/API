import prisma from "../client";
import { Status } from "@prisma/client";

const memberPlanSeeder = async () => {
  console.log("Member plan seeding ...");

  // Fetch all pros and cons to get their actual IDs
  const allPros = await prisma.pros.findMany({
    orderBy: { id: "asc" },
  });
  const allCons = await prisma.cons.findMany({
    orderBy: { id: "asc" },
  });

  const memberPlans = [
    {
      memberTypeId: 1,
      name: "Gym Member (Video Group)",
      duration: 90,
      price: 30000,
      pros: [0, 1, 2, 3, 4],
      cons: [0, 1, 2],
      isVideoGroup: true,
      status: Status.ACTIVE,
    },
    {
      memberTypeId: 1,
      name: "Gym Member (No Video Group)",
      duration: 90,
      price: 30000,
      pros: [0, 1, 2, 3, 4],
      cons: [0, 1, 2],
      isVideoGroup: false,
      status: Status.ACTIVE,
    },
    {
      memberTypeId: 2,
      name: "Gym Trainer",
      duration: 90,
      price: 100000,
      pros: [0, 1, 2, 3, 4],
      cons: [0, 1, 2],
      isVideoGroup: false,
      status: Status.ACTIVE,
    },
  ];

  for (const memberPlan of memberPlans) {
    await prisma.memberPlan.create({
      data: {
        memberType: {
          connect: {
            id: memberPlan.memberTypeId,
          },
        },
        name: memberPlan.name,
        duration: memberPlan.duration,
        price: memberPlan.price,
        pros: {
          connect: memberPlan.pros
            .map((index) => allPros[index])
            .filter(Boolean)
            .map((pro) => ({ id: pro.id })),
        },
        cons: {
          connect: memberPlan.cons
            .map((index) => allCons[index])
            .filter(Boolean)
            .map((con) => ({ id: con.id })),
        },
        isVideoGroup: memberPlan.isVideoGroup,
        status: memberPlan.status,
      },
    });
  }

  console.log("Member plan seeded successfully");
};

export default memberPlanSeeder;
