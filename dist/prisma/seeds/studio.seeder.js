"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const faker_1 = require("@faker-js/faker");
const helper_1 = require("../../app/helpers/helper");
const studioSeeder = async () => {
    console.log("Studios seeding ...");
    for (let i = 0; i < 10; i++) {
        await client_1.default.studio.create({
            data: {
                name: faker_1.faker.company.name(),
                slug: await (0, helper_1.generateSlug)(faker_1.faker.company.name(), "Studio"),
            },
        });
    }
    console.log("Studios seeding successfully");
};
exports.default = studioSeeder;
