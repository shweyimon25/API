import prisma from "../client";

const PlaceSeeder = async () => {
    console.log("Place seeding ...");

    const places = [
        "Home",
        "Gym",
        "Park",
        "Other",
    ];

    for (const place of places) {
        await prisma.place.upsert({
            where: { name: place },
            update: {
                name: place,
            },
            create: {
                name: place,
            },
        });
    }

    console.log("Place seeded successfully");
};

export default PlaceSeeder;
