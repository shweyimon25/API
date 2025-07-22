"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_handler_1 = require("../app/middlewares/handlers/async.handler");
const media_controller_1 = __importDefault(require("../app/controllers/media.controller"));
const router = (0, express_1.Router)();
const mediaController = new media_controller_1.default();
router.post("/upload", [
    (0, async_handler_1.asyncHandler)(async (req, res) => await mediaController.upload(req, res)),
]);
exports.default = router;
