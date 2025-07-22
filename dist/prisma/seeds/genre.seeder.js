"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const helper_1 = require("../../app/helpers/helper");
const genreSeeder = async () => {
    console.log("Genres seeding ...");
    const genres = [
        "Action",
        "Adventure",
        "Animation",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Music",
        "Mystery",
        "Romance",
        "Science Fiction",
        "Thriller",
        "War",
        "Western",
    ];
    for (const genre of genres) {
        await client_1.default.genre.create({
            data: {
                name: genre,
                slug: await (0, helper_1.generateSlug)(genre, "Genre"),
            },
        });
    }
    console.log("Genres seeding successfully");
};
exports.default = genreSeeder;
