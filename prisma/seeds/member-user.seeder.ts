import { Gender } from "@prisma/client";
import { generateMemberCode, hashPassword } from "../../app/helpers/helper";
import prisma from "../client";

const memberUserSeeder = async () => {
  console.log("Member User seeding ...");

  const memberUsers = [
    {
      name: "Member",
      email: "member@member.com",
      password: hashPassword("Member@123"),
      phone: "0123456789",
      dob: new Date("1990-01-01"),
      gender: Gender.MALE,
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
          profile: {
            create: {
              gender: memberUser.gender,
            },
          }
        },
      });
    } else {
      await prisma.member.create({
        data: {
          name: memberUser.name,
          email: memberUser.email,
          code: await generateMemberCode(),
          password: memberUser.password,
          profile: {
            create: {
              gender: memberUser.gender,
            },
          }
        },
      });
    }
  }

  console.log("Member User seeded successfully");
};

export default memberUserSeeder;