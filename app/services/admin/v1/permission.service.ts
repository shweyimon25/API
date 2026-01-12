import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { Prisma } from "@prisma/client";

class PermissionService {
  async findAll(where?: Prisma.PermissionWhereInput) {
    const permissions = await prisma.permission.findMany({
      where,
      orderBy: {
        id: "desc",
      }
    });

    return permissions;
  }

  async findCommonAll(where?: Prisma.PermissionWhereInput) {
    const permissions = await prisma.permission.findMany({
      where,
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

  async findByPaginate(page: number, perPage: number, where?: Prisma.PermissionWhereInput) {
    const permissions = await prisma.permission.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage
    });

    const totalPermissions = await prisma.permission.count({
      where
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
