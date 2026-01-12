import prisma from "../client";

const ProficientLevelSeeder = async () => {
    console.log("Proficient level seeding ...");

    const proficientLevels = ["Beginner", "Intermediate", "Advanced"];

    for (const proficientLevel of proficientLevels) {
        await prisma.proficientLevel.upsert({
            where: { name: proficientLevel },
            update: {
                name: proficientLevel,
            },
            create: {
                name: proficientLevel,
            },
        });
    }

    console.log("Proficient level seeded successfully");
};

export default ProficientLevelSeeder;
