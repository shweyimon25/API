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
import adminFloorRoute from "./admin/v1/floor.route";
import adminCustomerRoute from "./admin/v1/customer.route";
import adminTypeRoute from "./admin/v1/type.route";
import adminTableTypeRoute from "./admin/v1/table-type.route";
import adminRestaurantRoute from "./admin/v1/restaurant.route";

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
router.use("/admin/v1/floors", adminFloorRoute);
router.use("/admin/v1/customers", adminCustomerRoute);
router.use("/admin/v1/types", adminTypeRoute);
router.use("/admin/v1/table-types", adminTableTypeRoute);
router.use("/admin/v1/restaurants", adminRestaurantRoute);

// Other Routes
router.use("/admin/v1/media", mediaRoute);

export default router;
