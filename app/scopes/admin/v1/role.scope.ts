import { Permission, Prisma } from "@prisma/client";

interface RoleScopeQuery {
  name?: string;
  permission?: string;
}

export const roleScope = (query: RoleScopeQuery): Prisma.RoleWhereInput => {
  const { name, permission } = query;
  const where: Prisma.RoleWhereInput = {};

  if (name) {
    where.name = { contains: name };
  }

  if (permission) {
    where.permission = permission as Permission;
  }

  return where;
};
