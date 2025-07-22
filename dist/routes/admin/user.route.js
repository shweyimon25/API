"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../../app/controllers/admin/user.controller"));
const async_handler_1 = require("../../app/middlewares/handlers/async.handler");
const router = (0, express_1.Router)();
const userController = new user_controller_1.default();
router
    .route("/")
    .get([
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => await userController.findAll(req, res)),
])
    .post([
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => await userController.create(req, res)),
]);
router
    .route("/:id")
    .get([
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => await userController.findOne(req, res)),
])
    .put([
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => await userController.update(req, res)),
])
    .delete([
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => await userController.destroy(req, res)),
]);
exports.default = router;
