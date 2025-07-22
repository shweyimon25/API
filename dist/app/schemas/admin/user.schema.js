"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const client_1 = __importDefault(require("../../../prisma/client"));
exports.createUserSchema = zod_1.default
    .object({
    name: zod_1.default
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
    email: zod_1.default
        .string()
        .email({ message: "Invalid email address" })
        .min(1, { message: "Email is required" })
        .refine(async (arg) => {
        const result = await client_1.default.user.findFirst({
            where: {
                email: arg,
            },
        });
        return !result;
    }, {
        message: "Email is already exist",
    }),
    dob: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    bio: zod_1.default.string().optional(),
    gender: zod_1.default.enum(["male", "female"]).optional(),
    role: zod_1.default.enum(["ADMIN", "USER"]).optional(),
    status: zod_1.default.boolean().optional(),
    provider: zod_1.default.enum(["email", "google", "facebook"]).optional(),
    password: zod_1.default
        .string()
        .min(8, { message: "Password is minimum 8 characters" }),
    passwordConfirm: zod_1.default.string(),
})
    .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});
exports.updateUserSchema = zod_1.default
    .object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().email().optional(),
    dob: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    bio: zod_1.default.string().optional(),
    gender: zod_1.default.enum(["male", "female"]).optional(),
    role: zod_1.default.enum(["ADMIN", "USER"]).optional(),
    status: zod_1.default.boolean().optional(),
    provider: zod_1.default.enum(["email", "google", "facebook"]).optional(),
    password: zod_1.default.string().optional(),
    passwordConfirm: zod_1.default.string().optional(),
})
    .refine((data) => {
    if (!data.password)
        return true;
    if (!data.passwordConfirm)
        return true;
    return data.password === data.passwordConfirm;
}, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});
