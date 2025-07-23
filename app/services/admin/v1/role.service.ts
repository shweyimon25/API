import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../../schemas/admin/v1/role.schema";

class RoleService {
  async findAll() {
    const roles = await prisma.role.findMany({
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
    const roles = await prisma.role.findMany({
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

    const totalRoles = await prisma.role.count();

    return {
      data: roles,
      meta: {
        totalCount: totalRoles,
        totalPages: Math.ceil(totalRoles / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalRoles / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalRoles / perPage),
      },
    };
  }

  async findOne(id: number) {
    const role = await prisma.role.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!role) {
      throw new BadRequestException("Role not found");
    }

    return role;
  }

  async create(createRoleInput: CreateRoleInput) {
    const { name, permissionIds } = createRoleInput;

    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissionIds?.map((permissionId: number) => ({
            permission: {
              connect: {
                id: permissionId,
              },
            },
          })),
        },
      },
    });

    return this.findOne(role.id);
  }

  async update(id: number, updateRoleInput: UpdateRoleInput) {
    const { name, permissionIds } = updateRoleInput;

    const role = await prisma.role.findUnique({
      where: {
        id,
      },
    });

    if (!role) {
      throw new BadRequestException("Role not found");
    }

    await prisma.role.update({
      where: {
        id,
      },
      data: {
        name: name || role.name,
      },
    });

    if (permissionIds) {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId: id,
        },
      });
      await prisma.rolePermission.create({
        data: {
          roleId: id,
          permissionId: permissionIds,
        },
      });
    }

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.role.delete({ where: { id } });
  }
}

export default RoleService;
