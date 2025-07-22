"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
const profile_controller_1 = __importDefault(require("../../app/controllers/admin/profile.controller"));
const async_handler_1 = require("../../app/middlewares/handlers/async.handler");
const router = (0, express_1.Router)();
const profileController = new profile_controller_1.default();
router.get("/", [
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => {
        await profileController.me(req, res);
    }),
]);
router.post("/", [
    passport_1.default.authenticate("jwt", { session: false }),
    (0, async_handler_1.asyncHandler)(async (req, res) => {
        await profileController.update(req, res);
    }),
]);
exports.default = router;
