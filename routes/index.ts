import { Router } from "express";

// Admin Routes
import adminAuthRoute from "./admin/v1/auth.route";
import adminUserRoute from "./admin/v1/user.route";
import adminPermissionRoute from "./admin/v1/permission.route";
import adminRoleRoute from "./admin/v1/role.route";
import adminMemberTypeRoute from "./admin/v1/member-type.route";
import adminMemberPlanRoute from "./admin/v1/member-plan.route";
import adminMemberRoute from "./admin/v1/member.route";
import adminProsRoute from "./admin/v1/pros.route";
import adminConsRoute from "./admin/v1/cons.route";
import adminShopLevelRoute from "./admin/v1/shop-level.route";
import adminShopRoute from "./admin/v1/shop.route";
import adminTagRoute from "./admin/v1/tag.route";
import adminPostRoute from "./admin/v1/post.route";
import adminWorkoutRoute from "./admin/v1/workout.route";
import adminBankInformationRoute from "./admin/v1/bank-information.route";
import adminPhysicalLimitationRoute from "./admin/v1/physical-limitation.route";
import adminDietTypeRoute from "./admin/v1/diet-type.route";
import adminBodyAttentionAreaRoute from "./admin/v1/body-attention-area.route";
import adminMealTypeRoute from "./admin/v1/meal-type.route";
import adminMealRoute from "./admin/v1/meal.route";
import adminBadHabitRoute from "./admin/v1/bad-habit.route";
import adminWaterTrackerRoute from "./admin/v1/water-tracker.route";

// Member Routes
import memberAuthRoute from "./member/v1/auth.route";
import memberProfileRoute from "./member/v1/profile.route";
import memberPostRoute from "./member/v1/post.route";
import memberTagRoute from "./member/v1/tag.route";
import memberMemberPlanRoute from "./member/v1/member-plan.route";
import memberMemberTypeRoute from "./member/v1/member-type.route";

const router = Router();

// Admin Routes
router.use("/admin/v1/auth", adminAuthRoute);
router.use("/admin/v1/users", adminUserRoute);
router.use("/admin/v1/roles", adminRoleRoute);
router.use("/admin/v1/permissions", adminPermissionRoute);
router.use("/admin/v1/member-types", adminMemberTypeRoute);
router.use("/admin/v1/member-plans", adminMemberPlanRoute);
router.use("/admin/v1/members", adminMemberRoute);
router.use("/admin/v1/pros", adminProsRoute);
router.use("/admin/v1/cons", adminConsRoute);
router.use("/admin/v1/shop-levels", adminShopLevelRoute);
router.use("/admin/v1/shops", adminShopRoute);
router.use("/admin/v1/tags", adminTagRoute);
router.use("/admin/v1/posts", adminPostRoute);
router.use("/admin/v1/workouts", adminWorkoutRoute);
router.use("/admin/v1/bank-informations", adminBankInformationRoute);
router.use("/admin/v1/physical-limitations", adminPhysicalLimitationRoute);
router.use("/admin/v1/diet-types", adminDietTypeRoute);
router.use("/admin/v1/body-attention-areas", adminBodyAttentionAreaRoute);
router.use("/admin/v1/meal-types", adminMealTypeRoute);
router.use("/admin/v1/meals", adminMealRoute);
router.use("/admin/v1/bad-habits", adminBadHabitRoute);
router.use("/admin/v1/water-trackers", adminWaterTrackerRoute);

// Member Routes
router.use("/member/v1/auth", memberAuthRoute);
router.use("/member/v1", memberProfileRoute);
router.use("/member/v1/posts", memberPostRoute);
router.use("/member/v1/tags", memberTagRoute);
router.use("/member/v1/member-plans", memberMemberPlanRoute);
router.use("/member/v1/member-types", memberMemberTypeRoute);

export default router;
