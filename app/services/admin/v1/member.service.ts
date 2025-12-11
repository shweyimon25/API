import { ProviderType, Status } from "@prisma/client";
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
  async findAll() {
    const members = await prisma.member.findMany({
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
      },
    });

    return members;
  }

  async findByPaginate(page: number, perPage: number) {
    const members = await prisma.member.findMany({
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
      },
    });

    const totalMembers = await prisma.member.count();

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
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    return member;
  }

  async create(createMemberInput: CreateMemberInput) {
    const { name, email, phone, password, memberTypeId, address, bio, status } =
      createMemberInput;

    // Check member email is existed
    if (email && email !== "") {
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

    // Check member phone is existed
    if (phone && phone !== "") {
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

    // Create member
    const member = await prisma.member.create({
      data: {
        name,
        code: await generateMemberCode(),
        email,
        phone,
        password: hashPassword(password),
        memberTypeId,
        status: status ?? Status.ACTIVE,
        profile: {
          create: {
            address,
            bio,
          },
        },
        providerTypes: {
          create: {
            providerType: ProviderType.EMAIL,
          },
        },
      },
    });

    return this.findOne(member.id);
  }

  async update(id: number, updateMemberInput: UpdateMemberInput) {
    const { name, email, phone, password, memberTypeId, address, bio, status } =
      updateMemberInput;

    // Check member is existed
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

    // Check member email is existed
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

    // Check member phone is existed
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

    // Update member
    await prisma.member.update({
      where: {
        id,
      },
      data: {
        name: name ? name : existingMember.name,
        email: email ? email : existingMember.email,
        phone: phone ? phone : existingMember.phone,
        password: password ? hashPassword(password) : existingMember.password,
        memberTypeId: memberTypeId ? memberTypeId : existingMember.memberTypeId,
        status: status ?? existingMember.status,
        profile: {
          update: {
            address: address ?? existingMember.profile?.address,
            bio: bio ?? existingMember.profile?.bio,
          },
        },
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find member
    const member = await this.findOne(id);

    // Delete member
    await prisma.member.delete({
      where: {
        id,
      },
    });

    return member;
  }
}

export default MemberService;
