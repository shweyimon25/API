import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

interface MemberTypeFilters {
  search?: string;
  status?: Status
}

class MemberTypeService {
  async findAll(where?: Prisma.MemberTypeWhereInput) {
    const memberTypes = await prisma.memberType.findMany({
      where,
      orderBy: {
        id: "desc",
      }
    });

    return memberTypes;
  }

  async findCommonAll(where?: Prisma.MemberTypeWhereInput) {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        ...where,
        status: Status.ACTIVE
      },
      orderBy: {
        id: "desc"
      },
      select: {
        id: true,
        name: true
      }
    });

    return memberTypes;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.MemberTypeWhereInput) {
    const memberTypes = await prisma.memberType.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalMemberTypes = await prisma.memberType.count({
      where,
    });

    return {
      data: memberTypes,
      meta: {
        totalCount: totalMemberTypes,
        totalPages: Math.ceil(totalMemberTypes / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalMemberTypes / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalMemberTypes / perPage),
      },
    };
  }

  async findOne(id: number) {
    const memberType = await prisma.memberType.findFirst({
      where: {
        id,
      },
    });

    if (!memberType) {
      throw new NotFoundException("Member type not found");
    }

    return memberType;
  }
}

export default MemberTypeService;
