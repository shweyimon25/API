import { Permission, Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { ForbiddenException } from "./exceptions";

export type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true };
}>;

export const hasFullControl = (user: UserWithRole | null | undefined) =>
  Boolean(user?.role && user.role.permission === Permission.FULL_CONTROL);

export const assertFullControl = (user: UserWithRole | null | undefined) => {
  if (!hasFullControl(user)) {
    throw new ForbiddenException(
      "You do not have permission to perform this action",
    );
  }
};

export const assertCanEditProject = async (
  user: UserWithRole | null | undefined,
  projectId: number,
) => {
  if (!user) {
    throw new ForbiddenException(
      "You do not have permission to perform this action",
    );
  }

  if (hasFullControl(user)) {
    return;
  }

  const ownership = await prisma.projectOwner.findFirst({
    where: {
      projectId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!ownership) {
    throw new ForbiddenException(
      "You can only edit projects you own",
    );
  }
};
