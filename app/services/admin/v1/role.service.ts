import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";
import {
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  assertFullControl,
  UserWithRole,
} from "../../../helpers/permission";
import {
  CreateRoleInput,
  UpdateRoleInput,
} from "../../../schemas/admin/v1/role.schema";

export const HIDDEN_ROLE_NAME = "Developer";

const roleSelect = {
  id: true,
  name: true,
  description: true,
  permission: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RoleSelect;

const excludeDeveloper: Prisma.RoleWhereInput = {
  NOT: { name: HIDDEN_ROLE_NAME },
};

class RoleService {
  async findAll(where?: Prisma.RoleWhereInput) {
    return prisma.role.findMany({
      where: {
        ...where,
        ...excludeDeveloper,
      },
      orderBy: { id: "desc" },
      select: roleSelect,
    });
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.RoleWhereInput,
  ) {
    const roleWhere: Prisma.RoleWhereInput = {
      ...where,
      ...excludeDeveloper,
    };

    const roles = await prisma.role.findMany({
      where: roleWhere,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: roleSelect,
    });

    const totalRoles = await prisma.role.count({ where: roleWhere });

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
      where: { id },
      select: roleSelect,
    });

    if (!role || role.name === HIDDEN_ROLE_NAME) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async create(createRoleInput: CreateRoleInput, currentUser: UserWithRole) {
    assertFullControl(currentUser);

    const { name, description, permission } = createRoleInput;

    if (name === HIDDEN_ROLE_NAME) {
      throw new ForbiddenException("Developer role name is not allowed");
    }

    const existingName = await prisma.role.findFirst({
      where: { name },
    });

    if (existingName) {
      throw new ValidationException("Failed to create role", [
        {
          field: "name",
          issue: "Role name is already existed",
        },
      ]);
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        ...(permission !== undefined && { permission }),
      },
    });

    return this.findOne(role.id);
  }

  async update(
    id: number,
    updateRoleInput: UpdateRoleInput,
    currentUser: UserWithRole,
  ) {
    assertFullControl(currentUser);

    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole || existingRole.name === HIDDEN_ROLE_NAME) {
      throw new NotFoundException("Role not found");
    }

    const { name, description, permission } = updateRoleInput;

    if (name === HIDDEN_ROLE_NAME) {
      throw new ForbiddenException("Developer role name is not allowed");
    }

    if (name && name !== existingRole.name) {
      const existingName = await prisma.role.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existingName) {
        throw new ValidationException("Failed to update role", [
          {
            field: "name",
            issue: "Role name is already existed",
          },
        ]);
      }
    }

    await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(permission !== undefined && { permission }),
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number, currentUser: UserWithRole) {
    assertFullControl(currentUser);

    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole || existingRole.name === HIDDEN_ROLE_NAME) {
      throw new NotFoundException("Role not found");
    }

    if (existingRole._count.users > 0) {
      throw new ValidationException("Failed to delete role", [
        {
          field: "id",
          issue: "Role cannot be deleted while users are assigned to it",
        },
      ]);
    }

    await prisma.role.delete({
      where: { id },
    });
  }
}

export default RoleService;
