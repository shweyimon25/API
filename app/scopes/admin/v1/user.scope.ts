import { Prisma, Status } from "@prisma/client";

interface UserScopeQuery {
  name?: string;
  email?: string;
  employeeId?: string;
  status?: string;
  roleId?: string;
}

export const userScope = (query: UserScopeQuery): Prisma.UserWhereInput => {
  const { name, email, employeeId, status, roleId } = query;

  const where: Prisma.UserWhereInput = {};

  if (name) {
    where.name = { contains: name };
  }

  if (email) {
    where.email = { contains: email };
  }

  if (employeeId) {
    where.employeeId = { contains: employeeId };
  }

  if (status) {
    where.status = status as Status;
  }

  if (roleId) {
    where.roleId = +roleId;
  }

  return where;
};
