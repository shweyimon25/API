import { PrivencyType, Prisma } from "@prisma/client";

interface PostScopeQuery {
  caption?: string;
  postCategoryId?: string;
  privencyType?: string;
}

export const postScope = (query: PostScopeQuery): Prisma.PostWhereInput => {
  const { caption, postCategoryId, privencyType } = query;

  const where: Prisma.PostWhereInput = {};

  if (caption) {
    where.caption = {
      equals: JSON.stringify(caption),
    };
  }

  if (postCategoryId) {
    where.postCategoryId = +postCategoryId;
  }

  if (privencyType) {
    where.privencyType = privencyType as PrivencyType;
  }

  return where;
};
