import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../../schemas/admin/v1/user.schema";

interface UserFilters {
  status?: Status;
  search?: string;
  roleId?: number;
}

class UserService {
  private where(filters?: UserFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.roleId) {
      where.roles = {
        some: {
          roleId: filters.roleId,
        },
      };
    }

    if (filters?.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
          },
        },
        {
          email: {
            contains: filters.search,
          },
        },
        {
          username: {
            contains: filters.search,
          },
        },
      ];
    }

    return where;
  }

  async findAll(filters?: UserFilters) {
    const users = await prisma.user.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roles: {
          select: {
            role: {
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

    return users;
  }

  async findByPaginate(page: number, perPage: number, filters?: UserFilters) {
    const users = await prisma.user.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roles: {
          select: {
            role: {
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

    const totalUsers = await prisma.user.count({
      where: this.where(filters),
    });

    return {
      data: users,
      meta: {
        totalCount: totalUsers,
        totalPages: Math.ceil(totalUsers / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalUsers / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalUsers / perPage),
      },
    };
  }

  async findOne(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roles: {
          select: {
            role: {
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

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(createUserInput: CreateUserInput) {
    const { name, username, email, password, status, roleId } = createUserInput;

    // Check user username is existed
    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (existingUsername) {
      throw new ValidationException("Failed to created user", [
        {
          field: "username",
          issue: "Username is already existed",
        },
      ]);
    }

    // Check user email is existed
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new ValidationException("Failed to created user", [
        {
          field: "email",
          issue: "Email is already existed",
        },
      ]);
    }

    // Check role is existed
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new ValidationException("Failed to created user", [
        {
          field: "roleId",
          issue: "Role is not existed",
        },
      ]);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashPassword(password),
        status: status ?? Status.ACTIVE,
        roles: {
          create: {
            role: {
              connect: {
                id: roleId,
              },
            },
          },
        },
      },
    });

    return this.findOne(user.id);
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const { name, username, email, password, status, roleId } = updateUserInput;

    // Check user is existed
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // Check user email is existed (only if email is being updated)
    if (email && email !== existingUser.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (existingEmail) {
        throw new ValidationException("Failed to update user", [
          {
            field: "email",
            issue: "Email is already existed",
          },
        ]);
      }
    }

    // Check user username is existed (only if username is being updated)
    if (username && username !== existingUser.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id,
          },
        },
      });

      if (existingUsername) {
        throw new ValidationException("Failed to update user", [
          {
            field: "username",
            issue: "Username is already existed",
          },
        ]);
      }
    }

    // Check role is existed (only if roleId is provided)
    if (roleId) {
      const existingRole = await prisma.role.findFirst({
        where: {
          id: roleId,
        },
      });

      if (!existingRole) {
        throw new ValidationException("Failed to update user", [
          {
            field: "roleId",
            issue: "Role is not existed",
          },
        ]);
      }
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        username: username || existingUser.username,
        password: password ? hashPassword(password) : existingUser.password,
        status: status ?? existingUser.status,
      },
    });

    if (roleId) {
      await prisma.userRole.deleteMany({
        where: {
          id,
        },
      });
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId,
        },
      });
    }

    return this.findOne(id);
  }

  async destory(id: number) {
    const user = await this.findOne(id);

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return user;
  }
}

export default UserService;
