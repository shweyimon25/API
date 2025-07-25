import { Router } from "express";

// Admin Routes
import adminAuthRoute from "./admin/v1/auth.route";
import adminUserRoute from "./admin/v1/user.route";
import adminRoleRoute from "./admin/v1/role.route";
import adminPermissionRoute from "./admin/v1/permission.route";
import adminCuisineRoute from "./admin/v1/cuisine.route";
import adminPlaceRoute from "./admin/v1/place.route";
import adminDietaryRoute from "./admin/v1/dietary.route";
import adminDrinkRoute from "./admin/v1/drink.route";

// Other Routes
import mediaRoute from "./media.route";

const router = Router();

// Admin Routes
router.use("/admin/v1/auth", adminAuthRoute);
router.use("/admin/v1/users", adminUserRoute);
router.use("/admin/v1/roles", adminRoleRoute);
router.use("/admin/v1/permissions", adminPermissionRoute);
router.use("/admin/v1/cuisines", adminCuisineRoute);
router.use("/admin/v1/places", adminPlaceRoute);
router.use("/admin/v1/dietaries", adminDietaryRoute);
router.use("/admin/v1/drinks", adminDrinkRoute);
router.use("/admin/v1/media", mediaRoute);

export default router;
