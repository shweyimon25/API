import prisma from "../client";

const conSeeder = async () => {
  console.log("Cons seeding ...");

  const cons = [
    {
      name: "not having face to face training with trainers",
      guard: "not-having-face-to-face-training-with-trainers",
    },
    {
      name: "not having face to face training with trainers",
      guard: "not-having-face-to-face-training-with-trainers",
    },
    {
      name: "no shop member levels",
      guard: "no-shop-member-levels",
    },
  ];

  for (const con of cons) {
    await prisma.cons.upsert({
      where: { guard: con.guard },
      update: {
        name: con.name,
        guard: con.guard,
      },
      create: {
        name: con.name,
        guard: con.guard,
      },
    });
  }

  console.log("Cons seeded successfully");
};

export default conSeeder;
