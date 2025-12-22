import prisma from "../client";

const DietTypeSeeder = async () => {
    console.log("Diet type seeding ...");

    const dietTypes = [
        "traditional",
        "pescatarian",
        "keto",
        "fasting",
        "vegan",
        "keto vegan",
        "lactose free"
    ];

    for (const dietType of dietTypes) {
        await prisma.dietType.upsert({
            where: { name: dietType },
            update: {
                name: dietType,
            },
            create: {
                name: dietType,
            },
        });
    }

    console.log("Diet type seeded successfully");
};

export default DietTypeSeeder;
