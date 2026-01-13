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
        await prisma.place.create({
            data: {
                name: place,
                createdById: 1,
            },
        });
    }

    console.log("Place seeded successfully");
};

export default PlaceSeeder;
