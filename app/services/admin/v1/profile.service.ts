import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import { deleteUploadedFile, saveProfileCover } from "../../../helpers/upload";
import { UpdateProfileInput } from "../../../schemas/admin/v1/profile.schema";

const profileSelect = {
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
      permission: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

class ProfileService {
  async findMe(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: profileSelect,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateMe(
    id: number,
    updateProfileInput: UpdateProfileInput,
    profileCoverFile?: Express.Multer.File,
  ) {
    const { name, employeeId, email, password, profileCover } = updateProfileInput;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    if (email && email !== existingUser.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (existingEmail) {
        throw new ValidationException("Failed to update profile", [
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
        throw new ValidationException("Failed to update profile", [
          {
            field: "employeeId",
            issue: "Employee ID is already existed",
          },
        ]);
      }
    }

    const nextProfileCover = profileCoverFile
      ? saveProfileCover(profileCoverFile)
      : profileCover;

    if (nextProfileCover !== undefined) {
      deleteUploadedFile(existingUser.profileCover);
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(employeeId !== undefined && { employeeId }),
        ...(nextProfileCover !== undefined && { profileCover: nextProfileCover }),
        ...(password !== undefined && { password: hashPassword(password) }),
      },
    });

    return this.findMe(id);
  }
}

export default ProfileService;
