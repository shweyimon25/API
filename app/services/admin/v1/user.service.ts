import prisma from "../../../../prisma/client";
import { Prisma, Status } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import { deleteUploadedFile, saveProfileCover } from "../../../helpers/upload";
import { getRandomAvatarPath } from "./avatar.service";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../../schemas/admin/v1/user.schema";
import {
  assertFullControl,
  UserWithRole,
} from "../../../helpers/permission";

export const HIDDEN_USER_EMAIL = "systemadmin@ayabank.com";

const userSelect = {
  id: true,
  name: true,
  email: true,
  employeeId: true,
  profileCover: true,
  status: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const excludeHiddenUser: Prisma.UserWhereInput = {
  NOT: { email: HIDDEN_USER_EMAIL },
};

class UserService {
  async findAll(where?: Prisma.UserWhereInput) {
    return prisma.user.findMany({
      where: {
        ...where,
        ...excludeHiddenUser,
      },
      orderBy: { id: "desc" },
      select: userSelect,
    });
  }

  async findCommonAll(where?: Prisma.UserWhereInput) {
    return prisma.user.findMany({
      where: {
        ...where,
        ...excludeHiddenUser,
        status: Status.ACTIVE,
      },
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
      },
    });
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.UserWhereInput,
  ) {
    const userWhere: Prisma.UserWhereInput = {
      ...where,
      ...excludeHiddenUser,
    };

    const users = await prisma.user.findMany({
      where: userWhere,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: userSelect,
    });

    const totalUsers = await prisma.user.count({ where: userWhere });

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
      where: { id },
      select: userSelect,
    });

    if (!user || user.email === HIDDEN_USER_EMAIL) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(
    createUserInput: CreateUserInput,
    currentUser: UserWithRole,
    profileCoverFile?: Express.Multer.File,
  ) {
    assertFullControl(currentUser);

    const { name, employeeId, email, password, status, roleId } =
      createUserInput;

    if (email === HIDDEN_USER_EMAIL) {
      throw new ValidationException("Failed to create user", [
        {
          field: "email",
          issue: "Email is already existed",
        },
      ]);
    }

    const existingEmployeeId = await prisma.user.findFirst({
      where: { employeeId },
    });

    if (existingEmployeeId) {
      throw new ValidationException("Failed to create user", [
        {
          field: "employeeId",
          issue: "Employee ID is already existed",
        },
      ]);
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (existingEmail) {
      throw new ValidationException("Failed to create user", [
        {
          field: "email",
          issue: "Email is already existed",
        },
      ]);
    }

    const role = await prisma.role.findFirst({
      where: { id: roleId },
    });

    if (!role) {
      throw new ValidationException("Failed to create user", [
        {
          field: "roleId",
          issue: "Role does not exist",
        },
      ]);
    }

    const profileCover = profileCoverFile
      ? saveProfileCover(profileCoverFile)
      : getRandomAvatarPath();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        roleId,
        password: hashPassword(password),
        status: status ?? Status.ACTIVE,
        ...(profileCover !== undefined && { profileCover }),
      },
    });

    return this.findOne(user.id);
  }

  async update(
    id: number,
    updateUserInput: UpdateUserInput,
    currentUser: UserWithRole,
    profileCoverFile?: Express.Multer.File,
  ) {
    assertFullControl(currentUser);

    const { name, employeeId, email, password, status, roleId } =
      updateUserInput;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || existingUser.email === HIDDEN_USER_EMAIL) {
      throw new NotFoundException("User not found");
    }

    if (email === HIDDEN_USER_EMAIL) {
      throw new ValidationException("Failed to update user", [
        {
          field: "email",
          issue: "Email is already existed",
        },
      ]);
    }

    if (email && email !== existingUser.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
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

    if (employeeId && employeeId !== existingUser.employeeId) {
      const existingEmployeeIdRecord = await prisma.user.findFirst({
        where: {
          employeeId,
          NOT: { id },
        },
      });

      if (existingEmployeeIdRecord) {
        throw new ValidationException("Failed to update user", [
          {
            field: "employeeId",
            issue: "Employee ID is already existed",
          },
        ]);
      }
    }

    if (roleId) {
      const existingRole = await prisma.role.findFirst({
        where: { id: roleId },
      });

      if (!existingRole) {
        throw new ValidationException("Failed to update user", [
          {
            field: "roleId",
            issue: "Role does not exist",
          },
        ]);
      }
    }

    let profileCover: string | undefined;
    if (profileCoverFile) {
      profileCover = saveProfileCover(profileCoverFile);
      deleteUploadedFile(existingUser.profileCover);
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(employeeId !== undefined && { employeeId }),
        ...(password !== undefined && { password: hashPassword(password) }),
        ...(status !== undefined && { status }),
        ...(roleId !== undefined && { roleId }),
        ...(profileCover !== undefined && { profileCover }),
      },
    });

    return this.findOne(id);
  }

  async destory(id: number, currentUser: UserWithRole) {
    assertFullControl(currentUser);

    const user = await this.findOne(id);

    await prisma.user.delete({
      where: { id },
    });

    deleteUploadedFile(user.profileCover);
  }
}

export default UserService;
