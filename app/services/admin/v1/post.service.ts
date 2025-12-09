import {
  CreatePostInput,
  UpdatePostInput,
} from "./../../../schemas/admin/v1/post.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";

class PostService {
  async findAll() {
    const posts = await prisma.post.findMany({
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

  async findByPaginate(page: number, perPage: number) {
    const posts = await prisma.post.findMany({
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
        postComments: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            postComments: true,
          },
        },
      },
    });

    if (!post) {
      throw new BadRequestException("Post not found");
    }

    return post;
  }

  async create(createPostInput: CreatePostInput) {
    const { contact, tagId, privencyType } = createPostInput;

    // Check tag exists
    const tag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });

    if (!tag) {
      throw new ValidationException("Failed to create post", [
        {
          field: "tagId",
          issue: "Tag is not existed",
        },
      ]);
    }

    // Create new post
    const post = await prisma.post.create({
      data: {
        contact: contact,
        tagId,
        privencyType: privencyType || "PUBLIC"
      },
    });

    return this.findOne(post.id);
  }

  async update(id: number, updatePostInput: UpdatePostInput) {
    const { contact, tagId, privencyType } = updatePostInput;

    // Check post exists
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!existingPost) {
      throw new BadRequestException("Post not found");
    }

    // Check tag exists if tagId is being updated
    if (tagId && tagId !== existingPost.tagId) {
      const tag = await prisma.tag.findUnique({
        where: {
          id: tagId,
        },
      });

      if (!tag) {
        throw new ValidationException("Failed to update post", [
          {
            field: "tagId",
            issue: "Tag is not existed",
          },
        ]);
      }
    }

    // Update post
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        contact: contact ? contact : existingPost.contact,
        tagId: tagId ?? existingPost.tagId,
        privencyType: privencyType ?? existingPost.privencyType
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find post
    const post = await this.findOne(id);

    // Delete post
    await prisma.post.delete({
      where: {
        id,
      },
    });

    return post;
  }
}

export default PostService;

