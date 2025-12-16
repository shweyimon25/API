import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";

class PermissionService {
  async findAll() {
    const permissions = await prisma.permission.findMany({
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

    return permissions;
  }

  async findByPaginate(page: number, perPage: number) {
    const permissions = await prisma.permission.findMany({
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

    const totalPermissions = await prisma.permission.count();

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
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!permission) {
      throw new BadRequestException("Permission not found");
    }

    return permission;
  }
}

export default PermissionService;
