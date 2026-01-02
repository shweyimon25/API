import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

interface MemberTypeFilters {
  search?: string;
  status?: Status
}

class MemberTypeService {
  private where(filters?: MemberTypeFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
      ];
    }

    return where;
  }


  async findAll(filters?: MemberTypeFilters) {
    const memberTypes = await prisma.memberType.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return memberTypes;
  }

  async findCommonAll(filters?: MemberTypeFilters) {
    return 'con';
    const memberTypes = await prisma.memberType.findMany({
      where: {
        ...this.where(filters),
        status: Status.ACTIVE
      },
      orderBy: {
        id: "desc"
      },
    });

    return memberTypes;
  }

  async findByPaginate(page: number, perPage: number, filters: MemberTypeFilters) {
    const memberTypes = await prisma.memberType.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalMemberTypes = await prisma.memberType.count({
      where: this.where(filters)
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
