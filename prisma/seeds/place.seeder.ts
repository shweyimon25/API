import { Status } from "@prisma/client";
import prisma from "../client";

const PlaceSeeder = async () => {
  console.log("Place seeding ...");

  const places = ["Home", "Gym", "Park", "Other"];

  for (const place of places) {
    await prisma.place.upsert({
      where: { name: place },
      update: { status: Status.ACTIVE },
      create: {
        name: place,
        createdById: 1,
      },
    });
  }

  console.log("Place seeded successfully");
};

export default PlaceSeeder;
