import prisma from "../client";

const tagSeeder = async () => {
    console.log("Tags seeding ...");

    const tags = [
        'Social',
        'Fitness',
        'Wellness',
        'Other'
    ];

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag },
            update: {
                name: tag
            },
            create: {
                name: tag
            },
        });
    }

    console.log("Tags seeded successfully");
};

export default tagSeeder;
