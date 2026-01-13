import prisma from "../client";

const CategorySeeder = async () => {
    console.log("Category seeding ...");

    const categories = [
        "Category1",
        "Category2",
        "Category3",
        "Category4",
        "Category5",
    ];

    for (const category of categories) {
        await prisma.category.create({
            data: {
                name: category,
                createdById: 1,
            },
        });
    }

    console.log("Category seeded successfully");
};

export default CategorySeeder;
