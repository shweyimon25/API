"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const faker_1 = require("@faker-js/faker");
const client_2 = require("@prisma/client");
const helper_1 = require("../../app/helpers/helper");
const movieSeeder = async () => {
    console.log("Movies seeding ...");
    for (let i = 0; i < 100; i++) {
        await client_1.default.movie.create({
            data: {
                title: faker_1.faker.person.firstName(),
                slug: await (0, helper_1.generateSlug)(faker_1.faker.person.firstName(), "Movie"),
                description: faker_1.faker.lorem.sentence(),
                review: faker_1.faker.lorem.sentence(),
                posterUrl: faker_1.faker.image.url(),
                trailerUrl: faker_1.faker.image.url(),
                releaseDate: faker_1.faker.date.past().toISOString(),
                rating: faker_1.faker.number.int({ min: 0, max: 10 }),
                type: faker_1.faker.helpers.enumValue(client_2.MovieType),
                duration: faker_1.faker.number.int({ min: 60, max: 180 }).toString(),
                genres: {
                    connect: {
                        id: faker_1.faker.number.int({ min: 1, max: 18 }),
                    },
                },
                actors: {
                    connect: {
                        id: faker_1.faker.number.int({ min: 1, max: 10 }),
                    },
                },
                directors: {
                    connect: {
                        id: faker_1.faker.number.int({ min: 1, max: 10 }),
                    },
                },
                studios: {
                    connect: {
                        id: faker_1.faker.number.int({ min: 1, max: 10 }),
                    },
                },
            },
        });
    }
    console.log("Movies seeding successfully");
};
exports.default = movieSeeder;
