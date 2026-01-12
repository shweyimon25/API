import { Prisma, ProviderType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword, generateMemberCode } from "../../../helpers/helper";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "../../../schemas/admin/v1/member.schema";

class MemberService {
  async findAll(where?: Prisma.MemberWhereInput) {
    const members = await prisma.member.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
        theme: true,
        code: true,
        status: true,
        profile: {
          select: {
            address: true,
            bio: true,
            gender: true,
            profilePhoto: true,
            coverPhoto: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        providerTypes: {
          select: {
            providerType: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return members;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.MemberWhereInput) {
    const members = await prisma.member.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
        theme: true,
        code: true,
        status: true,
        profile: {
          select: {
            address: true,
            bio: true,
            gender: true,
            profilePhoto: true,
            coverPhoto: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        providerTypes: {
          select: {
            providerType: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalMembers = await prisma.member.count({
      where,
    });

    return {
      data: members,
      meta: {
        totalCount: totalMembers,
        totalPages: Math.ceil(totalMembers / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalMembers / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalMembers / perPage),
      },
    };
  }

  async findOne(id: number) {
    const member = await prisma.member.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true,
        language: true,
        theme: true,
        status: true,
        profile: {
          select: {
            address: true,
            bio: true,
            gender: true,
            profilePhoto: true,
            coverPhoto: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        providerTypes: {
          select: {
            providerType: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    return member;
  }

  async findCommonAll(where?: Prisma.MemberWhereInput) {
    const members = await prisma.member.findMany({
      where: {
        status: Status.ACTIVE,
        deletedAt: null,
        ...where,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    return members;
  }

  async create(createMemberInput: CreateMemberInput, userId: number) {
    const { name, email, phone, password, address, bio, age, gender, status } =
      createMemberInput;

    if (email) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email,
        },
      });

      if (existingEmail) {
        throw new ValidationException("Failed to create member", [
          {
            field: "email",
            issue: "Email is already existed",
          },
        ]);
      }
    }

    if (phone) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone,
        },
      });

      if (existingPhone) {
        throw new ValidationException("Failed to create member", [
          {
            field: "phone",
            issue: "Phone is already existed",
          },
        ]);
      }
    }

    const member = await prisma.member.create({
      data: {
        name,
        code: await generateMemberCode(),
        email,
        phone,
        password: hashPassword(password),
        status: status ?? Status.ACTIVE,
        profile: {
          create: {
            address,
            bio,
            age,
            gender
          },
        },
        bodyMeasurement: {
          create: {},
        },
        providerTypes: {
          create: {
            providerType: ProviderType.EMAIL,
          },
        },
        createdBy: {
          connect: { id: userId }
        },
      },
    });

    return this.findOne(member.id);
  }

  async update(id: number, updateMemberInput: UpdateMemberInput, userId: number) {
    const { name, email, phone, password, address, bio, age, gender, status } =
      updateMemberInput;

    const existingMember = await prisma.member.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      }
    });

    if (!existingMember) {
      throw new NotFoundException("Member not found");
    }

    if (email) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (existingEmail) {
        throw new ValidationException("Failed to update member", [
          {
            field: "email",
            issue: "Email is already existed",
          },
        ]);
      }
    }

    if (phone) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone,
          NOT: {
            id,
          },
        },
      });

      if (existingPhone) {
        throw new ValidationException("Failed to update member", [
          {
            field: "phone",
            issue: "Phone is already existed",
          },
        ]);
      }
    }

    await prisma.member.update({
      where: {
        id,
      },
      data: {
        name: name ? name : existingMember.name,
        email: email ? email : existingMember.email,
        phone: phone ? phone : existingMember.phone,
        password: password ? hashPassword(password) : existingMember.password,
        status: status ?? existingMember.status,
        profile: {
          update: {
            address: address ?? existingMember.profile?.address,
            bio: bio ?? existingMember.profile?.bio,
            age: age ?? existingMember.profile?.age,
            gender: gender ?? existingMember.profile?.gender,
          },
        },
        updatedBy: {
          connect: { id: userId }
        }
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number, userId: number) {
    await this.findOne(id);

    await prisma.member.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
        deletedBy: {
          connect: { id: userId }
        }
      }
    });
  }
}

export default MemberService;
