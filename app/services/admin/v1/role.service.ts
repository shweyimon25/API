import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../../schemas/admin/v1/role.schema";
import { Status } from "@prisma/client";

interface RoleFilters {
  status?: Status;
  search?: string;
}

class RoleService {
  private where(filters?: RoleFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
      };
    }

    return where;
  }

  async findAll(filters?: RoleFilters) {
    const roles = await prisma.role.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
    });

    return roles;
  }

  async findByPaginate(page: number, perPage: number, filters?: RoleFilters) {
    const roles = await prisma.role.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalRoles = await prisma.role.count({
      where: this.where(filters),
    });

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
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async create(createRoleInput: CreateRoleInput) {
    const { name, status } = createRoleInput;

    // Check role name unique
    const roleName = await prisma.role.findFirst({
      where: {
        name,
      },
    });

    if (roleName) {
      throw new ValidationException("Failed to created role", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    // Create new role
    const role = await prisma.role.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
      },
    });

    return role;
  }

  async update(roleId: number, updateRoleInput: UpdateRoleInput) {
    const { name, status } = updateRoleInput;

    // Check role is existed
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new NotFoundException("Role not found");
    }

    // Check role name is unique
    if (name && name !== existingRole.name) {
      const roleName = await prisma.role.findFirst({
        where: {
          name,
          NOT: {
            id: roleId,
          },
        },
      });

      if (roleName) {
        throw new ValidationException("Failed to updated role", [
          {
            issue: "Name is already existed",
            field: "name",
          },
        ]);
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name ?? existingRole.name,
        status: status ?? existingRole.status,
      },
    });

    return role;
  }

  async destory(roleId: number) {
    // Delete role
    await prisma.role.delete({
      where: { id: roleId },
    });
  }
}

export default RoleService;
