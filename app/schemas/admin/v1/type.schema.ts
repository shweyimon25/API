import z from "zod";
import prisma from "../../../../prisma/client";

export const createTypeSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .refine(
      async (arg) => {
        const result = await prisma.type.findFirst({
          where: { name: arg },
        });
        return !result;
      },
      {
        message: "Name is already exist",
      }
    ),
});

export const updateTypeSchema = z.object({
  name: z.string().optional(),
});

export type CreateTypeInput = z.infer<typeof createTypeSchema>;
export type UpdateTypeInput = z.infer<typeof updateTypeSchema>;
