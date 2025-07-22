import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
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
        roles: true,
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
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalUsers = await prisma.user.count();

    return {
      data: users,
      totalCount: totalUsers,
      totalPages: Math.ceil(totalUsers / perPage),
      currentPage: page,
      perPage,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(totalUsers / perPage) ? page + 1 : null,
      hasPrevPage: page > 1,
      hasNextPage: page < Math.ceil(totalUsers / perPage),
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
        roles: true,
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
    const { name, email, password, status } = createUserInput;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        status,
      },
    });

    return this.findOne(user.id);
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const { name, email, password, status } = updateUserInput;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: password ? hashPassword(password) : user.password,
        status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.user.delete({ where: { id } });
  }
}

export default UserService;
