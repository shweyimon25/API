import { generateMemberCode, hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const memberUserSeeder = async () => {
  console.log("Member User seeding ...");

  const memberUsers = [
    {
      name: "Member",
      email: "member@member.com",
      password: hashPassword("Member@123"),
    },
  ];

  for (const memberUser of memberUsers) {
    const existing = await prisma.member.findFirst({
      where: { email: memberUser.email },
    });

    if (existing) {
      await prisma.member.update({
        where: { id: existing.id },
        data: {
          name: memberUser.name,
          password: memberUser.password,
        },
      });
    } else {
      await prisma.member.create({
        data: {
          name: memberUser.name,
          email: memberUser.email,
          code: await generateMemberCode(),
          password: memberUser.password,
        },
      });
    }
  }

  console.log("Member User seeded successfully");
};

export default memberUserSeeder;