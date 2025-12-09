import dotenv from "dotenv";
import prisma from "../client";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import adminUserSeeder from "./admin-user.seeder";
import memberTypeSeeder from "./member-type";
import proSeeder from "./pros.seeder";
import conSeeder from "./cons.seeder";
import tagSeeder from "./tag.seeder";

dotenv.config();

const main = async () => {
  try {
    await roleSeeder();
    await permissionSeeder();
    await adminUserSeeder();
    await memberTypeSeeder();
    await proSeeder();
    await conSeeder();
    await tagSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
