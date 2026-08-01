import { Router } from "express";

// Admin Routes
import adminAuthRoute from "./admin/v1/auth.route";
import adminProfileRoute from "./admin/v1/profile.route";
import adminOverviewRoute from "./admin/v1/overview.route";
import adminUserRoute from "./admin/v1/user.route";
import adminRoleRoute from "./admin/v1/role.route";
import adminProjectRoute from "./admin/v1/project.route";
import adminTaskRoute from "./admin/v1/task.route";

// Dashbboard Routes
import dashboardProjectRoute from "./dashboard/v1/project.route";

const router = Router();

// Admin Routes
router.use("/admin/v1/auth", adminAuthRoute);
router.use("/admin/v1", adminProfileRoute);
router.use("/admin/v1/overview", adminOverviewRoute);
router.use("/admin/v1/users", adminUserRoute);
router.use("/admin/v1/roles", adminRoleRoute);
router.use("/admin/v1/projects", adminProjectRoute);
router.use("/admin/v1/tasks", adminTaskRoute);

// Dashboard Routes
router.use("/dashboard/v1/projects", dashboardProjectRoute);

export default router;
