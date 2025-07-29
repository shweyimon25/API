import dotenv from "dotenv";
import prisma from "../client";
import adminSeeder from "./admin.seeder";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import cuisineSeeder from "./cuisine.seeder";
import dietarySeeder from "./dietary.seeder";
import drinkSeeder from "./drink.seeder";
import placeSeeder from "./place.seeder";
import floorSeeder from "./floor.seeder";
import typeSeeder from "./type.seeder";
import tableTypeSeeder from "./table-type.seeder";

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
    await floorSeeder();
    await typeSeeder();
    await tableTypeSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
