import { Status } from "@prisma/client";
import prisma from "../client";

const conSeeder = async () => {
  console.log("Cons seeding ...");

  const cons = [
    { name: "not having face to face training with trainers", guard: "not-having-face-to-face-training-with-trainers" },
    { name: "no shop member levels", guard: "no-shop-member-levels" },
  ];

  for (const con of cons) {
    await prisma.cons.upsert({
      where: { name: con.name },
      update: { guard: con.guard, status: Status.ACTIVE },
      create: {
        name: con.name,
        guard: con.guard,
        createdById: 1,
      },
    });
  }

  console.log("Cons seeded successfully");
};

export default conSeeder;
