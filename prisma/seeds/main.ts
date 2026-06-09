import dotenv from "dotenv";
import prisma from "../client";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import adminUserSeeder from "./admin-user.seeder";
import memberTypeSeeder from "./member-type.seeder";
import proSeeder from "./pros.seeder";
import conSeeder from "./cons.seeder";
import tagSeeder from "./tag.seeder";
import physicalLimitaionSeeder from "./physical-limitation.seeder";
import dietTypeSeeder from "./diet-type.seeder";
import bodyAttentionAreaSeeder from "./body-attention-area.seeder";
import badHabitSeeder from "./bad-habit.seeder";
import categorySeeder from "./category.seeder";
import memberPlanSeeder from "./member-plan.seeder";
import bankInformationSeeder from "./bank-information.seeder";
import shopLevelSeeder from "./shop-level.seeder";
import bodyGoalSeeder from "./body-goal.seeder";
import proficientLevelSeeder from "./proficient-level.seeder";
import placeSeeder from "./place.seeder";
import mealSeeder from "./meal.seeder";
import planDurationSeeder from "./plan-duration.seeder";

dotenv.config();

const assignAdminRole = async () => {
  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@admin.com" },
  });

  const superAdminRole = await prisma.role.findFirst({
    where: { name: "SuperAdmin" },
  });

  if (adminUser && superAdminRole) {
    // Check if role is already assigned
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });

    if (!existingUserRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      });
      console.log("SuperAdmin role assigned to admin user");
    }
  }
};

const main = async () => {
  try {
    await permissionSeeder();
    await adminUserSeeder();
    await roleSeeder();
    await assignAdminRole();
    await bankInformationSeeder();
    await memberTypeSeeder();
    await shopLevelSeeder();
    await proSeeder();
    await conSeeder();
    await tagSeeder();
    await physicalLimitaionSeeder();
    await dietTypeSeeder();
    await bodyAttentionAreaSeeder();
    await proficientLevelSeeder();
    await placeSeeder();
    await badHabitSeeder();
    await bodyGoalSeeder();
    await categorySeeder();
    await memberPlanSeeder();
    await mealSeeder();
    await planDurationSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
