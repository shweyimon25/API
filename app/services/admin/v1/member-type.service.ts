import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";

class MemberTypeService {
  async findAll() {
    const memberTypes = await prisma.memberType.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return memberTypes;
  }

  async findByPaginate(page: number, perPage: number) {
    const memberTypes = await prisma.memberType.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalMemberTypes = await prisma.memberType.count();

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
    const memberType = await prisma.memberType.findUnique({
      where: {
        id,
      },
    });

    if (!memberType) {
      throw new BadRequestException("Member type not found");
    }

    return memberType;
  }
}

export default MemberTypeService;
