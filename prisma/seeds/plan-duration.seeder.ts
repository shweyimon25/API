import prisma from "../client";

const planDurationSeeder = async () => {
  console.log("Plan duration seeding ...");

  const durations = [
    { name: "3 Months", value: 3 },
    { name: "2 Months", value: 2 },
    { name: "6 Months", value: 6 },
    { name: "1 Month", value: 1 },
  ];

  for (const duration of durations) {
    const existing = await prisma.planDuration.findFirst({
      where: { value: duration.value },
    });

    if (existing) {
      await prisma.planDuration.update({
        where: { id: existing.id },
        data: { name: duration.name },
      });
      continue;
    }

    await prisma.planDuration.create({ data: duration });
  }

  console.log("Plan duration seeded successfully");
};

export default planDurationSeeder;
