import { Router } from "express";

// Admin Routes
import adminAuthRoute from "./admin/v1/auth.route";
import adminUserRoute from "./admin/v1/user.route";
import adminRoleRoute from "./admin/v1/role.route";
import adminProjectRoute from "./admin/v1/project.route";
import adminDeliveriableRoute from "./admin/v1/deliveriable.route";

const router = Router();

// Admin Routes
router.use("/admin/v1/auth", adminAuthRoute);
router.use("/admin/v1/users", adminUserRoute);
router.use("/admin/v1/roles", adminRoleRoute);
router.use("/admin/v1/projects", adminProjectRoute);
router.use("/admin/v1/deliveriables", adminDeliveriableRoute);

export default router;
