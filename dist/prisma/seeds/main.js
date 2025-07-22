"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = __importDefault(require("../client"));
const user_seeder_1 = __importDefault(require("./user.seeder"));
const admin_seeder_1 = __importDefault(require("./admin.seeder"));
const genre_seeder_1 = __importDefault(require("./genre.seeder"));
const actor_seeder_1 = __importDefault(require("./actor.seeder"));
const director_seeder_1 = __importDefault(require("./director.seeder"));
const studio_seeder_1 = __importDefault(require("./studio.seeder"));
const movie_seeder_1 = __importDefault(require("./movie.seeder"));
dotenv_1.default.config();
const main = async () => {
    try {
        await (0, admin_seeder_1.default)();
        await (0, user_seeder_1.default)();
        await (0, genre_seeder_1.default)();
        await (0, actor_seeder_1.default)();
        await (0, director_seeder_1.default)();
        await (0, studio_seeder_1.default)();
        await (0, movie_seeder_1.default)();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
    finally {
        await client_1.default.$disconnect();
    }
};
main();
