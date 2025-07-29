import z from "zod";
import prisma from "../../../../prisma/client";

export const createTableTypeSchema = z.object({
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

export const updateTableTypeSchema = z.object({
  name: z.string().optional(),
});

export type CreateTableTypeInput = z.infer<typeof createTableTypeSchema>;
export type UpdateTableTypeInput = z.infer<typeof updateTableTypeSchema>;
