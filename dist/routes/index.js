"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Admin Routes
const auth_route_1 = __importDefault(require("./admin/auth.route"));
const profile_route_1 = __importDefault(require("./admin/profile.route"));
const user_route_1 = __importDefault(require("./admin/user.route"));
// Client Routes
const auth_route_2 = __importDefault(require("./client/auth.route"));
const profile_route_2 = __importDefault(require("./client/profile.route"));
// Other Routes
const media_route_1 = __importDefault(require("./media.route"));
const router = (0, express_1.Router)();
// Admin Routes
router.use("/admin/auth", auth_route_1.default);
router.use("/admin/profile", profile_route_1.default);
router.use("/admin/users", user_route_1.default);
router.use("/admin/media", media_route_1.default);
// Client Routes
router.use("/client/auth", auth_route_2.default);
router.use("/client/profile", profile_route_2.default);
exports.default = router;
