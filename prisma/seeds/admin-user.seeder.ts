import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Status } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../client";

const AVATAR_EXTENSIONS = /\.(png|jpe?g|webp|gif)$/i;

const getRandomAvatarPath = () => {
  const avatarsDir = join(process.cwd(), "public/avatars");
  const avatars = readdirSync(avatarsDir).filter((file) =>
    AVATAR_EXTENSIONS.test(file),
  );

  if (avatars.length === 0) {
    throw new Error("No avatar images found in public/avatars");
  }

  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  return `/public/avatars/${encodeURIComponent(randomAvatar)}`;
};

const adminUserSeeder = async () => {
  console.log("Admin User seeding ...");

  const developerRole = await prisma.role.findUnique({
    where: { name: "Developer" },
  });

  if (!developerRole) {
    throw new Error("Developer role not found. Seed roles first.");
  }

  const adminUsers = [
    {
      name: "SystemAdmin",
      email: "systemadmin@ayabank.com",
      employeeId: "00000",
      password: bcrypt.hashSync("@dminP@55", 10),
      profileCover: getRandomAvatarPath(),
      status: Status.ACTIVE,
      roleId: developerRole.id,
    },
  ];

  for (const adminUser of adminUsers) {
    await prisma.user.upsert({
      where: { email: adminUser.email },
      update: {
        name: adminUser.name,
        employeeId: adminUser.employeeId,
        password: adminUser.password,
        profileCover: adminUser.profileCover,
        status: adminUser.status,
        roleId: adminUser.roleId,
      },
      create: adminUser,
    });
  }

  console.log("Admin User seeded successfully");
};

export default adminUserSeeder;
