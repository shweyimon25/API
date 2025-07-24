import dotenv from "dotenv";
import prisma from "../client";
import adminSeeder from "./admin.seeder";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import cuisineSeeder from "./cuisine.seeder";
import dietarySeeder from "./dietary.seeder";
import drinkSeeder from "./drink.seeder";
import placeSeeder from "./place.seeder";

dotenv.config();

const main = async () => {
  try {
    await permissionSeeder();
    await roleSeeder();
    await adminSeeder();
    await cuisineSeeder();
    await dietarySeeder();
    await drinkSeeder();
    await placeSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
