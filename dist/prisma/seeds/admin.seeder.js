"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../../app/helpers/helper");
const client_1 = __importDefault(require("../client"));
const adminSeeder = async () => {
    console.log("Admin users seeding ...");
    await client_1.default.user.create({
        data: {
            name: "Admin",
            email: "admin@gmail.com",
            password: (0, helper_1.hashPassword)("@dminP@55"),
            role: "ADMIN",
            profile: {
                create: {
                    phone: null,
                    dob: null,
                    bio: null,
                    gender: null,
                },
            },
        },
    });
    console.log("Admin users seeding successfully");
};
exports.default = adminSeeder;
