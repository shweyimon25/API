import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import {
  CreateMemberInput,
  UpdateMemberInput,
} from "../../../schemas/admin/v1/member.schema";
import MemberTypeService from "./member-type.service";

class MemberService {
  private memberTypeService: MemberTypeService;

  constructor() {
    this.memberTypeService = new MemberTypeService();
  }

  async findAll() {
    const members = await prisma.member.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
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
        email: true,
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
      throw new BadRequestException("Member not found");
    }

    return member;
  }

  async create(createMemberInput: CreateMemberInput) {
    const {
      name,
      email,
      password,
      memberTypeId,
      providerTypes,
      status,
    } = createMemberInput;

    // Check member email is existed
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

    // Check member type is existed
    const existingMemberType = await this.memberTypeService.findOne(
      memberTypeId
    );

    if (!existingMemberType) {
      throw new ValidationException("Failed to create member", [
        {
          field: "memberTypeId",
          issue: "Member type is not existed",
        },
      ]);
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        name,
        code: "M-" + Date.now(),
        email,
        password: hashPassword(password),
        memberTypeId,
        status: status ?? true,
        providerTypes: {
          create: providerTypes.map((providerType) => ({
            providerType,
          })),
        },
      },
    });

    return this.findOne(member.id);
  }

  async update(memberId: number, updateMemberInput: UpdateMemberInput) {
    const {
      name,
      email,
      password,
      memberTypeId,
      providerTypes,
      status,
    } = updateMemberInput;

    // Check member is existing
    const existingMember = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!existingMember) {
      throw new NotFoundException("Member not found");
    }

    // Check member email is existed
    if (email) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email,
          NOT: {
            id: memberId,
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

    // Check member type is existed
    if (memberTypeId) {
      const existingMemberType = await this.memberTypeService.findOne(
        memberTypeId
      );

      if (!existingMemberType) {
        throw new ValidationException("Failed to update member", [
          {
            field: "memberTypeId",
            issue: "Member type is not existed",
          },
        ]);
      }
    }

    // Update member
    const updateData: any = {
      name: name ?? existingMember.name,
      email: email ?? existingMember.email,
      password: password ? hashPassword(password) : existingMember.password,
      memberTypeId: memberTypeId ?? existingMember.memberTypeId,
      status: status !== undefined ? status : existingMember.status,
    };

    // Update provider types if provided
    if (providerTypes) {
      // Delete existing provider types
      await prisma.memberProviderType.deleteMany({
        where: {
          memberId,
        },
      });

      // Create new provider types
      updateData.providerTypes = {
        create: providerTypes.map((providerType) => ({
          providerType,
        })),
      };
    }

    await prisma.member.update({
      where: {
        id: memberId,
      },
      data: updateData,
    });

    return this.findOne(memberId);
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
