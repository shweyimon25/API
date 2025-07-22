import prisma from "../client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles = [{ name: "SuperAdmin" }, { name: "RestaurantAdmin" }];

  for (const role of roles) {
    await prisma.role.create({
      data: {
        name: role.name,
      },
    });
  }

  console.log("Roles seeding successfully");
};

export default roleSeeder;
