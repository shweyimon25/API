import prisma from "../client";

const permissionSeeder = async () => {
  console.log("Permissions seeding ...");

  const permissions = [
    { name: "Create Role" },
    { name: "Read Role" },
    { name: "Update Role" },
    { name: "Delete Role" },
    { name: "Create Permission" },
    { name: "Read Permission" },
    { name: "Update Permission" },
    { name: "Delete Permission" },
    { name: "Create User" },
    { name: "Read User" },
    { name: "Update User" },
  ];

  for (const permission of permissions) {
    await prisma.permission.create({
      data: {
        name: permission.name,
      },
    });
  }

  console.log("Permissions seeding successfully");
};

export default permissionSeeder;
