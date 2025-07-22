"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../../helpers/helper");
const response_1 = require("../../helpers/response");
const validator_1 = require("../../helpers/validator");
const auth_schema_1 = require("../../schemas/client/auth.schema");
const exceptions_1 = require("../../helpers/exceptions");
const client_1 = __importDefault(require("../../../prisma/client"));
class AuthController {
    async signUp(req, res) {
        const { data, error, success } = await (0, validator_1.validater)(auth_schema_1.signUpSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("User sign up failed", error);
        }
        const user = await client_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: (0, helper_1.hashPassword)(data.password),
                role: "USER",
                provider: data.provider,
                profile: {
                    create: {
                        dob: null,
                        phone: null,
                        bio: null,
                        gender: null,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
            },
        });
        const token = (0, helper_1.generateToken)(user, "30d");
        return (0, response_1.successResponse)(res, "User sign up successfully", {
            user,
            token,
        });
    }
    async signIn(req, res) {
        const { data, error, success } = await (0, validator_1.validater)(auth_schema_1.signInSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("Unauthorized", error);
        }
        const user = await client_1.default.user.findFirst({
            where: {
                email: data.email,
                role: "USER",
            },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new exceptions_1.UnauthorizedException();
        }
        const passwordCompress = (0, helper_1.comparePassword)(data.password, user.password);
        if (!passwordCompress) {
            throw new exceptions_1.UnauthorizedException();
        }
        const token = (0, helper_1.generateToken)(user, "30d");
        return (0, response_1.successResponse)(res, "User sign in successfully", {
            user: await client_1.default.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: true,
                },
            }),
            token,
        });
    }
    async provider(req, res) {
        const { data, error, success } = await (0, validator_1.validater)(auth_schema_1.providerSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("Unauthorized", error);
        }
        const user = await client_1.default.user.findFirst({
            where: {
                email: data.email,
                role: "USER",
                provider: data.providerType,
            },
            include: {
                profile: true,
            },
        });
        if (!user) {
            const user = await client_1.default.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: (0, helper_1.hashPassword)("google"),
                    role: "USER",
                    provider: data.providerType,
                    profile: {
                        create: {
                            dob: null,
                            phone: null,
                            bio: null,
                            gender: null,
                        },
                    },
                },
            });
            return (0, response_1.successResponse)(res, "Provider successfully", {
                user: await client_1.default.user.findUnique({
                    where: {
                        id: user.id,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                        profile: true,
                    },
                }),
                token: (0, helper_1.generateToken)(user, "30d"),
            });
        }
        const token = (0, helper_1.generateToken)(user, "30d");
        return (0, response_1.successResponse)(res, "Provider successfully", {
            user: await client_1.default.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: true,
                },
            }),
            token,
        });
    }
}
exports.default = AuthController;
