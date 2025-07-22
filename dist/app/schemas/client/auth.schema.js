"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerSchema = exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
const client_1 = __importDefault(require("../../../prisma/client"));
exports.signUpSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, { message: "Name is required" })
        .refine(async (arg) => {
        const result = await client_1.default.user.findFirst({
            where: { name: arg },
        });
        return !result;
    }, {
        message: "Name is already exist",
    }),
    email: zod_1.z
        .string()
        .email({ message: "Invalid email address" })
        .min(1, { message: "Email is required" })
        .refine(async (arg) => {
        const result = await client_1.default.user.findFirst({
            where: { email: arg },
        });
        return !result;
    }, {
        message: "Email is already exist",
    }),
    provider: zod_1.z.enum(["email", "google", "facebook"]).default("email"),
    password: zod_1.z
        .string()
        .min(8, { message: "Password is minimum 8 characters" }),
    passwordConfirm: zod_1.z.string(),
})
    .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});
exports.signInSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(1, { message: "Email is required" }),
    password: zod_1.z.string().min(1, { message: "Password is required" }),
});
exports.providerSchema = zod_1.z.object({
    providerType: zod_1.z.enum(["google", "facebook"]),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
});
