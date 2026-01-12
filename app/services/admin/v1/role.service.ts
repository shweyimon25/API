import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../../schemas/admin/v1/role.schema";
import { Prisma, Status } from "@prisma/client";

class RoleService {
  async findAll(where?: Prisma.RoleWhereInput) {
    const roles = await prisma.role.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        }
      }
    });

    return roles;
  }

  async findCommonAll(where?: Prisma.RoleWhereInput) {
    const roles = await prisma.role.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc"
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      }
    });

    return roles;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.RoleWhereInput) {
    const roles = await prisma.role.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        }
      }
    });

    const totalRoles = await prisma.role.count({
      where,
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
      include: {
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
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async create(createRoleInput: CreateRoleInput, userId: number) {
    const { name, status, permissions } = createRoleInput;

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

    // Check permissions exist and are active
    if (permissions && permissions.length > 0) {
      const existingPermissions = await prisma.permission.findMany({
        where: {
          id: { in: permissions },
          status: Status.ACTIVE,
        },
        select: { id: true },
      });

      const existingPermissionIds = existingPermissions.map((p) => p.id);
      const invalidPermissionIds = permissions.filter(
        (id) => !existingPermissionIds.includes(id)
      );

      if (invalidPermissionIds.length > 0) {
        throw new ValidationException("Failed to create role", [
          {
            field: "permissions",
            issue: `Permission(s) with ID(s) ${invalidPermissionIds.join(", ")} do not exist or are inactive`,
          },
        ]);
      }
    }

    // Create new role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
        permissions:
          permissions && permissions.length > 0
            ? {
              create: permissions.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
            : undefined,
        createdBy: {
          connect: { id: userId }
        }
      },
    });

    return this.findOne(role.id);
  }

  async update(id: number, updateRoleInput: UpdateRoleInput, userId: number) {
    const { name, status, permissions } = updateRoleInput;

    // Check role is existed
    const existingRole = await prisma.role.findUnique({
      where: { id },
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
            id,
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

    // Check permissions exist and are active
    if (permissions !== undefined) {
      if (permissions.length > 0) {
        const existingPermissions = await prisma.permission.findMany({
          where: {
            id: { in: permissions },
            status: Status.ACTIVE,
          },
          select: { id: true },
        });

        const existingPermissionIds = existingPermissions.map((p) => p.id);
        const invalidPermissionIds = permissions.filter(
          (id) => !existingPermissionIds.includes(id)
        );

        if (invalidPermissionIds.length > 0) {
          throw new ValidationException("Failed to update role", [
            {
              field: "permissions",
              issue: `Permission(s) with ID(s) ${invalidPermissionIds.join(", ")} do not exist or are inactive`,
            },
          ]);
        }
      }
    }

    // Update role with permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: name ?? existingRole.name,
        status: status ?? existingRole.status,
        permissions:
          permissions !== undefined
            ? {
              deleteMany: {},
              create:
                permissions.length > 0
                  ? permissions.map((permissionId) => ({
                    permission: { connect: { id: permissionId } },
                  }))
                  : [],
            }
            : undefined,
        updatedBy: {
          connect: { id: userId }
        }
      },
    });

    return this.findOne(role.id);
  }

  async destory(id: number) {
    await this.findOne(id);

    await prisma.role.update({
      where: {
        id
      },
      data: {
        deletedAt: new Date()
      }
    });
  }
}

export default RoleService;
