import { Permission, Prisma } from "@prisma/client";
import { ForbiddenException } from "./exceptions";

export type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true };
}>;

export const assertFullControl = (user: UserWithRole | null | undefined) => {
  if (!user?.role || user.role.permission !== Permission.FULL_CONTROL) {
    throw new ForbiddenException(
      "You do not have permission to perform this action",
    );
  }
};
