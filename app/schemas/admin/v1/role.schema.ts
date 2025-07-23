import z from "zod";
import prisma from "../../../../prisma/client";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .refine(
      async (arg) => {
        const result = await prisma.role.findFirst({
          where: { name: arg },
        });
        return !result;
      },
      {
        message: "Name is already exist",
      }
    ),
  permissionIds: z.array(z.number()).refine(async (arg: any) => {
    const result = await prisma.permission.findMany({
      where: {
        id: {
          in: arg,
        },
      },
    });
    return result.length === arg.length;
  }, {
    message: "Permissions is not exist",
  }).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().optional(),
  permissionIds: z.array(z.number()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
