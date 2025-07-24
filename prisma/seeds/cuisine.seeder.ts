import { faker } from "@faker-js/faker"
import prisma from "../client";

const cuisineSeeder = async () => {
    console.log("Cuisines seeding ...");

    for (let i = 0; i < 10; i++) {
        await prisma.cuisine.create({
            data: {
                name: faker.lorem.word()
            }
        })
    }

    console.log("Cuisines seeding successfully");
};

export default cuisineSeeder;
