import prisma from "../../../../prisma/client";
import { NotFoundException, ValidationException } from "../../../helpers/exceptions";
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
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
    const { name } = createRoleInput;

    // Check role name unique 
    const roleName = await prisma.role.findFirst({
      where: {
        name
      }
    });

    if (roleName) {
      throw new ValidationException("Failed to created role", [
        {
          field: "name",
          issue: "Name is already existed"
        }
      ]);
    }

    // Create new role
    const role = await prisma.role.create({
      data: createRoleInput,
    });

    return role;
  }

  async update(roleId: number, updateRoleInput: UpdateRoleInput) {
    const { name } = updateRoleInput;

    // Check role is existed 
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!existingRole) {
      throw new NotFoundException("Role not found");
    }

    // Check role name is unique
    const roleName = await prisma.role.findFirst({
      where: {
        name,
        NOT: {
          id: roleId
        }
      }
    });

    if (roleName) {
      throw new ValidationException("Failed to updated role", [
        {
          issue: "Name is already existed",
          field: "name"
        }
      ])
    }

    // Update role
    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name ?? existingRole.name
      }
    });

    return role;
  }

  async destory(roleId: number) {
    // Delete role
    await prisma.role.delete({
      where: { id: roleId }
    })
  }
}

export default RoleService;
