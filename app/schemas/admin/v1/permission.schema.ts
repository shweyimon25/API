import z from "zod";
import prisma from "../../../../prisma/client";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .refine(
      async (arg) => {
        const result = await prisma.permission.findFirst({
          where: { name: arg },
        });
        return !result;
      },
      {
        message: "Name is already exist",
      }
    ),
});

export const updatePermissionSchema = z.object({
  name: z.string().optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
