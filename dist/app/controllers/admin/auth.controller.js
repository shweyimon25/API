"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../../helpers/helper");
const response_1 = require("../../helpers/response");
const validator_1 = require("../../helpers/validator");
const auth_schema_1 = require("../../schemas/admin/auth.schema");
const exceptions_1 = require("../../helpers/exceptions");
const client_1 = __importDefault(require("../../../prisma/client"));
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
class AuthController {
    userService;
    constructor() {
        this.userService = new user_service_1.default();
    }
    async signIn(req, res) {
        const { data, error, success } = await (0, validator_1.validater)(auth_schema_1.signInSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("Unauthorized", error);
        }
        const user = await client_1.default.user.findFirst({
            where: {
                email: data.email,
                role: "ADMIN",
                status: true,
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
            user: await this.userService.findOne(user.id),
            token,
        });
    }
}
exports.default = AuthController;
