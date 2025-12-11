import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../../schemas/admin/v1/user.schema";

class UserService {
  async findAll() {
    const users = await prisma.user.findMany({
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

  async findByPaginate(page: number, perPage: number) {
    const users = await prisma.user.findMany({
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

    const totalUsers = await prisma.user.count();

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
      throw new BadRequestException("User not found");
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

  async update(userId: number, updateUserInput: UpdateUserInput) {
    const { name, username, email, password, status, roleId } = updateUserInput;

    // Check user is existing
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Check user username is existed
    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: userId,
        },
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
        NOT: {
          id: userId,
        },
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

    // check role is existed
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

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name || user.name,
        email: email || user.email,
        username: username || user.username,
        password: password ? hashPassword(password) : user.password,
        status: status ?? user.status,
      },
    });

    if (roleId) {
      await prisma.userRole.deleteMany({
        where: {
          userId,
        },
      });
      await prisma.userRole.create({
        data: {
          userId,
          roleId,
        },
      });
    }

    return this.findOne(userId);
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
