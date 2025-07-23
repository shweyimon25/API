import dotenv from "dotenv";
import prisma from "../client";
import adminSeeder from "./admin.seeder";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";

dotenv.config();

const main = async () => {
  try {
    await permissionSeeder();
    await roleSeeder();
    await adminSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
