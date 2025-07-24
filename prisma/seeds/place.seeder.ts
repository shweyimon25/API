import { faker } from "@faker-js/faker"
import prisma from "../client";

const placeSeeder = async () => {
    console.log("Places seeding ...");

    for (let i = 0; i < 10; i++) {
        await prisma.place.create({
            data: {
                name: faker.lorem.word()
            }
        })
    }

    console.log("Places seeding successfully");
};

export default placeSeeder;
