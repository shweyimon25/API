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
        await prisma.tag.create({
            data: {
                name: tag,
                createdById: 1,
            }
        });
    }

    console.log("Tags seeded successfully");
};

export default tagSeeder;
