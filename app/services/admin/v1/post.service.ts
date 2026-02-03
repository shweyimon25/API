import prisma from "../../../../prisma/client";
import {
  NotFoundException,
} from "../../../helpers/exceptions";
import { Prisma } from "@prisma/client";

class PostService {
  async findAll(where?: Prisma.PostWhereInput) {
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            postComments: true,
          },
        },
      },
    });

    return posts;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.PostWhereInput) {
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            postComments: true,
          },
        },
      },
    });

    const totalPosts = await prisma.post.count();

    return {
      data: posts,
      meta: {
        totalCount: totalPosts,
        totalPages: Math.ceil(totalPosts / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalPosts / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalPosts / perPage),
      },
    };
  }

  async findOne(id: number) {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }
}

export default PostService;
