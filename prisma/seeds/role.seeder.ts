import prisma from "../client";

const roleSeeder = async () => {
  console.log("Roles seeding ...");

  const roles = [
    { name: "Developer", description: "Developer" },
    { name: "HOD", description: "Head of Department" },
    { name: "PM", description: "Product Manager" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log("Roles seeded successfully");
};

export default roleSeeder;
