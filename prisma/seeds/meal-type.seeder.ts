import { Status } from "@prisma/client";
import prisma from "../client";

const mealTypeSeeder = async () => {
  console.log("Meal type seeding ...");

  const mealTypes = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Pre-Workout",
    "Post-Workout",
  ];

  for (const mealTypeName of mealTypes) {
    await prisma.mealType.upsert({
      where: { name: mealTypeName },
      update: { status: Status.ACTIVE },
      create: {
        name: mealTypeName,
        createdById: 1,
      },
    });
  }

  console.log("Meal type seeded successfully");
};

export default mealTypeSeeder;
