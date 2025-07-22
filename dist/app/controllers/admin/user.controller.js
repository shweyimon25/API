"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../helpers/response");
const user_service_1 = __importDefault(require("../../services/admin/user.service"));
const validator_1 = require("../../helpers/validator");
const user_schema_1 = require("../../schemas/admin/user.schema");
const exceptions_1 = require("../../helpers/exceptions");
const client_1 = __importDefault(require("../../../prisma/client"));
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.default();
    }
    async findAll(req, res) {
        const { page = 1, perPage = 10 } = req.query;
        if (page && perPage) {
            const users = await this.userService.findByPaginate(+page, +perPage);
            return (0, response_1.successResponse)(res, "User list successfully", users);
        }
        const users = await this.userService.findAll();
        return (0, response_1.successResponse)(res, "User list successfully", users);
    }
    async findOne(req, res) {
        const { id } = req.params;
        const user = await this.userService.findOne(+id);
        return (0, response_1.successResponse)(res, "User detail successfully", user);
    }
    async create(req, res) {
        const { data, error, success } = await (0, validator_1.validater)(user_schema_1.createUserSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("User created failed", error);
        }
        const user = await this.userService.create(data);
        return (0, response_1.successResponse)(res, "User created successfully", user);
    }
    async update(req, res) {
        const { id } = req.params;
        user_schema_1.updateUserSchema
            .refine(async (args) => {
            if (!req.body.name)
                return true;
            const result = await client_1.default.user.findFirst({
                where: { email: args.email, NOT: { id: +id } },
            });
            return !result;
        }, { message: "Email is already exist", path: ["email"] })
            .refine(async (args) => {
            if (!req.body.email)
                return true;
            const result = await client_1.default.user.findFirst({
                where: { name: args.name, NOT: { id: +id } },
            });
            return !result;
        }, { message: "Name is already exist", path: ["name"] });
        const { data, error, success } = await (0, validator_1.validater)(user_schema_1.updateUserSchema, req.body);
        if (!success) {
            throw new exceptions_1.ValidationException("User updated failed", error);
        }
        const user = await this.userService.update(+id, data);
        return (0, response_1.successResponse)(res, "User updated successfully", user);
    }
    async destroy(req, res) {
        const { id } = req.params;
        await this.userService.destroy(+id);
        return (0, response_1.successResponse)(res, "User deleted successfully");
    }
}
exports.default = UserController;
