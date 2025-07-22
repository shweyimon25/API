import { Router } from "express";

// Admin Routes
import adminAuthRoute from "./admin/v1/auth.route";
import adminUserRoute from "./admin/v1/user.route";
import adminRoleRoute from "./admin/v1/role.route";

// Other Routes
import mediaRoute from "./media.route";

const router = Router();

// Admin Routes
router.use("/admin/v1/auth", adminAuthRoute);
router.use("/admin/v1/users", adminUserRoute);
router.use("/admin/v1/roles", adminRoleRoute);

router.use("/admin/v1/media", mediaRoute);

export default router;
