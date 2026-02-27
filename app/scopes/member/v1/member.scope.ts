import { Prisma, Status } from "@prisma/client";

interface MemberScopeQuery {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
}

export const memberScope = (
  query: MemberScopeQuery,
): Prisma.MemberWhereInput => {
  const { name, code, email, phone } = query;

  const where: Prisma.MemberWhereInput = {
    status: Status.ACTIVE, // Default to active status
  };

  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  if (code) {
    where.code = {
      contains: code,
      mode: "insensitive",
    };
  }

  if (email) {
    where.email = {
      contains: email,
      mode: "insensitive",
    };
  }

  if (phone) {
    where.phone = {
      contains: phone,
      mode: "insensitive",
    };
  }

  return where;
};
