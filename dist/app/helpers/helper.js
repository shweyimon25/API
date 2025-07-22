"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = exports.decodeToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = __importDefault(require("../../prisma/client"));
const slugify_1 = __importDefault(require("slugify"));
const exceptions_1 = require("./exceptions");
dotenv_1.default.config();
const hashPassword = (password) => bcrypt_1.default.hashSync(password, 10);
exports.hashPassword = hashPassword;
const comparePassword = (password, hashPassword) => bcrypt_1.default.compareSync(password, hashPassword);
exports.comparePassword = comparePassword;
const generateToken = (user, expiresIn) => {
    return jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, {
        expiresIn: expiresIn || "30d",
    });
};
exports.generateToken = generateToken;
const decodeToken = (token) => jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
exports.decodeToken = decodeToken;
const generateSlug = async (columnName, modelName) => {
    const baseSlug = (0, slugify_1.default)(columnName, { lower: true, strict: true });
    const model = client_1.default[modelName];
    if (!model) {
        throw new exceptions_1.BadRequestException(`Model '${modelName}' does not exist on Prisma client.`);
    }
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await model.findUnique({
            where: { slug },
        });
        if (!existing)
            break;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
exports.generateSlug = generateSlug;
