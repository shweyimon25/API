import prisma from "../client";

const proSeeder = async () => {
  console.log("Pros seeding ...");

  const pros = [
    {
      name: "Able to use social media",
      guard: "ablet-to-use-social-media",
    },
    {
      name: "Daily Provided workout videos",
      guard: "daily-provided-workout-vidoes",
    },
    {
      name: "Able to track daily calories",
      guard: "able-to-track-daily-calories",
    },
    {
      name: "Able to track daily water usage",
      guard: "able-to-track-daily-calories",
    },
    {
      name: "Able to view shop posts",
      guard: "able-to-view-shop-posts",
    },
  ];

  for (const pro of pros) {
    await prisma.pros.upsert({
      where: { guard: pro.guard },
      update: {
        name: pro.name,
        guard: pro.guard,
      },
      create: {
        name: pro.name,
        guard: pro.guard,
      },
    });
  }

  console.log("Cons seeded successfully");
};

export default proSeeder;
