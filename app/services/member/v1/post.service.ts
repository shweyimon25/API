import {
  CreatePostInput,
  UpdatePostInput,
} from "../../../schemas/member/v1/post.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  ValidationException,
} from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import { PrivencyType, Status } from "@prisma/client";

const feedWhere = {
  privencyType: PrivencyType.PUBLIC,
  status: Status.ACTIVE,
} as const;

const memberInclude = {
  member: {
    select: {
      id: true,
      name: true,
      email: true,
      code: true,
      profile: {
        select: { profilePhoto: true },
      },
    },
  },
};

const tagInclude = {
  tag: {
    select: { id: true, name: true },
  },
};

class PostService {
  async findAll() {
    const posts = await prisma.post.findMany({
      where: feedWhere,
      orderBy: { id: "desc" },
      include: { ...tagInclude, ...memberInclude },
    });
    return posts;
  }

  async findByPaginate(page: number, perPage: number) {
    const posts = await prisma.post.findMany({
      where: feedWhere,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { ...tagInclude, ...memberInclude },
    });
    const totalPosts = await prisma.post.count({ where: feedWhere });
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
      where: { id, ...feedWhere },
      include: {
        ...tagInclude,
        ...memberInclude,
        postComments: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
                code: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!post) {
      throw new BadRequestException("Post not found");
    }
    return post;
  }

  async create(
    createPostInput: CreatePostInput,
    files: Express.Multer.File[],
    memberId: number
  ) {
    const { content, tagId, privencyType } = createPostInput;

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });
    if (!tag) {
      throw new ValidationException("Failed to create post", [
        { field: "tagId", issue: "Tag is not existed" },
      ]);
    }

    const mediaFiles = (files ?? []).filter(
      (f: Express.Multer.File) => f.fieldname === "media"
    );
    if (mediaFiles.length === 0) {
      throw new ValidationException("Failed to create post", [
        { field: "media", issue: "Media files are required" },
      ]);
    }

    const media = await Promise.all(
      mediaFiles.map(async (file) => {
        const { fileUrl } = await upload(file, "post");
        return fileUrl;
      })
    );

    const post = await prisma.post.create({
      data: {
        content: content ?? "",
        tagId,
        privencyType: privencyType ?? PrivencyType.PUBLIC,
        media,
        memberId,
        status: Status.ACTIVE,
      },
    });

    return this.findOne(post.id);
  }

  async update(
    id: number,
    updatePostInput: UpdatePostInput,
    files: Express.Multer.File[],
    memberId: number
  ) {
    const { content, tagId, privencyType } = updatePostInput;

    const existingPost = await prisma.post.findUnique({
      where: { id, status: Status.ACTIVE },
    });
    if (!existingPost) {
      throw new BadRequestException("Post not found");
    }
    if (existingPost.memberId !== memberId) {
      throw new ForbiddenException("You can only update your own posts");
    }

    if (tagId != null && tagId !== existingPost.tagId) {
      const tag = await prisma.tag.findUnique({
        where: { id: tagId },
      });
      if (!tag) {
        throw new ValidationException("Failed to update post", [
          { field: "tagId", issue: "Tag is not existed" },
        ]);
      }
    }

    let media: string[] = [];
    const mediaFiles = (files ?? []).filter(
      (f: Express.Multer.File) => f.fieldname === "media"
    );
    if (mediaFiles.length > 0) {
      media = await Promise.all(
        mediaFiles.map(async (file) => {
          const { fileUrl } = await upload(file, "post");
          return fileUrl;
        })
      );
    }

    const mediaValue =
      media.length > 0 ? media : ((existingPost.media as string[]) ?? []);

    await prisma.post.update({
      where: { id },
      data: {
        content: content ?? existingPost.content,
        tagId: tagId ?? existingPost.tagId,
        privencyType: privencyType ?? existingPost.privencyType,
        media: mediaValue,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number, memberId: number) {
    const post = await prisma.post.findFirst({
      where: { id, status: Status.ACTIVE },
    });

    if (!post) {
      throw new BadRequestException("Post not found");
    }

    if (post.memberId !== memberId) {
      throw new ForbiddenException("You can only delete your own posts");
    }

    await prisma.post.delete({
      where: { id },
    });
  }
}

export default PostService;
