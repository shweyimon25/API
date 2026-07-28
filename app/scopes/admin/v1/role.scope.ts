import { Prisma } from "@prisma/client";

interface RoleScopeQuery {
  name?: string;
}

export const roleScope = (query: RoleScopeQuery): Prisma.RoleWhereInput => {
  const { name } = query;
  const where: Prisma.RoleWhereInput = {};

  if (name) {
    where.name = { contains: name };
  }

  return where;
};
