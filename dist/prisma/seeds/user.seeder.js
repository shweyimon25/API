"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const helper_1 = require("../../app/helpers/helper");
const userSeeder = async () => {
    console.log("Users seeding ...");
    await client_1.default.user.create({
        data: {
            name: "User",
            email: "user@gmail.com",
            password: (0, helper_1.hashPassword)("@userP@55"),
            role: "USER",
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
    console.log("Users seeding successfully");
};
exports.default = userSeeder;
