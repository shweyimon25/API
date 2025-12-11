import z from "zod";
import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";

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
  status: z.nativeEnum(Status).optional(),
});

export const updatePermissionSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
