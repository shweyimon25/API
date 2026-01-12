import dotenv from "dotenv";
import prisma from "../client";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import adminUserSeeder from "./admin-user.seeder";
import memberTypeSeeder from "./member-type.seeder";
import proSeeder from "./pros.seeder";
import conSeeder from "./cons.seeder";
import tagSeeder from "./tag.seeder";
import mealTypeSeeder from "./meal-type.seeder";
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

dotenv.config();

const main = async () => {
  try {
    await permissionSeeder();
    await roleSeeder();
    await bankInformationSeeder();
    await adminUserSeeder();
    await memberTypeSeeder();
    await shopLevelSeeder();
    await proSeeder();
    await conSeeder();
    await tagSeeder();
    await mealTypeSeeder();
    await physicalLimitaionSeeder();
    await dietTypeSeeder();
    await bodyAttentionAreaSeeder();
    await proficientLevelSeeder();
    await placeSeeder();
    await badHabitSeeder();
    await bodyGoalSeeder();
    await categorySeeder();
    await memberPlanSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
