import dotenv from "dotenv";
import prisma from "../client";
import roleSeeder from "./role.seeder";
import permissionSeeder from "./permission.seeder";
import adminUserSeeder from "./admin-user.seeder";

dotenv.config();

const main = async () => {
  try {
    await roleSeeder();
    await permissionSeeder();
    await adminUserSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
