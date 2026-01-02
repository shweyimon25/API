import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";

interface PermissionFilters {
  search?: string;
}

class PermissionService {
  private where(filters?: PermissionFilters) {
    const where: any = {};

    if (filters?.search) {
      where.name = {
        contains: filters.search,
      };
    }

    return where;
  }

  async findAll(filters?: PermissionFilters) {
    const permissions = await prisma.permission.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      }
    });

    return permissions;
  }

  async findCommonAll(filters?: PermissionFilters) {
    const permissions = await prisma.permission.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true
      },
    });

    return permissions;
  }

  async findByPaginate(page: number, perPage: number, filters?: PermissionFilters) {
    const permissions = await prisma.permission.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage
    });

    const totalPermissions = await prisma.permission.count({
      where: this.where(filters)
    });

    return {
      data: permissions,
      meta: {
        totalCount: totalPermissions,
        totalPages: Math.ceil(totalPermissions / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalPermissions / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalPermissions / perPage),
      },
    };
  }

  async findOne(id: number) {
    const permission = await prisma.permission.findUnique({
      where: {
        id,
      },
    });

    if (!permission) {
      throw new BadRequestException("Permission not found");
    }

    return permission;
  }
}

export default PermissionService;
