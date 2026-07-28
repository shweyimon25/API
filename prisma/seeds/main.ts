import dotenv from "dotenv";
import prisma from "../client";
import adminUserSeeder from "./admin-user.seeder";
import roleSeeder from "./role.seeder";

dotenv.config();

const main = async () => {
  try {
    await roleSeeder();
    await adminUserSeeder();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
