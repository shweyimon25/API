import { Prisma } from "@prisma/client";

interface PostCategoryScopeQuery {
  name?: string;
}

export const tagScope = (
  query: PostCategoryScopeQuery,
): Prisma.PostCategoryWhereInput => {
  const { name } = query;

  const where: Prisma.PostCategoryWhereInput = {};

  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  return where;
};
