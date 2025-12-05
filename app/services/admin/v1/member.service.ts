import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { CreateMemberInput, UpdateMemberInput } from "../../../schemas/admin/v1/member.schema";

class MemberService {
  async findAll() {
    const roles = await prisma.member.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return roles;
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      throw new BadRequestException("Role not found");
    }

    return member;
  }

  async create(createMemberInput: CreateMemberInput) {
    const member = await prisma.member.create({
      data: createMemberInput,
    });

    return member;
  }

  async update(updateMemberInput: UpdateMemberInput) {
    // const role = await prisma.role.update({
    //   data:
    // });
    // return role;
  }

  async destory(id: number) {}
}

export default MemberService;
